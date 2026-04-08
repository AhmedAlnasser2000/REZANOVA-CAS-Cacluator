import { ComputeEngine, expand } from '@cortex-js/compute-engine';
import {
  buildConditionSupplementLatex as buildConstraintSupplementLatex,
  buildSquareRootConjugateProfile,
  isSupportedRadicand,
  mergeSolveDomainConstraints as mergeConstraints,
  matchSupportedRadical,
  matchSupportedRationalPower,
  type SupportedRadical,
  type SupportedRationalPower,
} from '../../radical-core';
import { normalizeAst } from '../../symbolic-engine/normalize';
import { boxLatex, isNodeArray, termKey } from '../../symbolic-engine/patterns';
import { normalizeExactRationalNode } from '../../symbolic-engine/rational';
import { evaluateRealNumericExpression } from '../../real-numeric-eval';
import type {
  DisplayOutcome,
  GuardedSolveRequest,
  SolveBadge,
  SolveDomainConstraint,
} from '../../../types/calculator';
import {
  UNSUPPORTED_FAMILY_ERROR,
  errorOutcome,
} from './outcome';
import { dedupe, mergeDisplayOutcomes } from './merge';
import { equationStateKey } from './state-key';

const ce = new ComputeEngine();
const PLACEHOLDER_SYMBOL = '__calcwiz_r3_u';

type ExactScalar = {
  numerator: number;
  denominator: number;
};

type PlaceholderLinearExpression = {
  a: ExactScalar;
  remainder: unknown;
};

type RadicalTarget =
  | {
      kind: 'root';
      targetNode: unknown;
      root: SupportedRadical;
    }
  | {
      kind: 'reciprocal-root';
      targetNode: unknown;
      root: SupportedRadical;
      numeratorScalar: ExactScalar;
    }
  | {
      kind: 'power';
      targetNode: unknown;
      power: SupportedRationalPower;
    };

type AlgebraTransform = {
  equationLatex: string;
  branchEquations?: string[];
  domainConstraints?: SolveDomainConstraint[];
  solveBadges: SolveBadge[];
  solveSummaryText: string;
  unresolvedError: string;
};

type GuardedSolveRunner = (
  request: GuardedSolveRequest,
  depth: number,
  trail: Set<string>,
) => DisplayOutcome;

function gcd(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a === 0 ? 1 : a;
}

function normalizeScalar(numerator: number, denominator: number): ExactScalar | null {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator === 0) {
    return null;
  }

  if (numerator === 0) {
    return { numerator: 0, denominator: 1 };
  }

  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: (sign * numerator) / divisor,
    denominator: Math.abs(denominator) / divisor,
  };
}

function readExactScalar(node: unknown): ExactScalar | null {
  if (typeof node === 'number' && Number.isFinite(node) && Number.isInteger(node)) {
    return { numerator: node, denominator: 1 };
  }

  if (!isNodeArray(node) || node.length === 0) {
    return null;
  }

  if (
    node[0] === 'Rational'
    && node.length === 3
    && typeof node[1] === 'number'
    && Number.isInteger(node[1])
    && typeof node[2] === 'number'
    && Number.isInteger(node[2])
  ) {
    return normalizeScalar(node[1], node[2]);
  }

  if (node[0] === 'Negate' && node.length === 2) {
    const child = readExactScalar(node[1]);
    return child
      ? { numerator: -child.numerator, denominator: child.denominator }
      : null;
  }

  return null;
}

function expressionHasVariable(node: unknown): boolean {
  if (typeof node === 'string') {
    return node !== 'Pi' && node !== 'ExponentialE';
  }

  if (!isNodeArray(node) || node.length === 0) {
    return false;
  }

  for (const child of node.slice(1)) {
    if (expressionHasVariable(child)) {
      return true;
    }
  }

  return false;
}

function multiplyScalar(left: ExactScalar, right: ExactScalar): ExactScalar | null {
  return normalizeScalar(
    left.numerator * right.numerator,
    left.denominator * right.denominator,
  );
}

function divideScalar(left: ExactScalar, right: ExactScalar): ExactScalar | null {
  if (right.numerator === 0) {
    return null;
  }

  return normalizeScalar(
    left.numerator * right.denominator,
    left.denominator * right.numerator,
  );
}

function addScalar(left: ExactScalar, right: ExactScalar): ExactScalar | null {
  return normalizeScalar(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

function negateScalar(value: ExactScalar): ExactScalar {
  return {
    numerator: -value.numerator,
    denominator: value.denominator,
  };
}

function isZeroScalar(value: ExactScalar) {
  return value.numerator === 0;
}

function buildScalarNode(value: ExactScalar): unknown {
  if (value.denominator === 1) {
    return value.numerator;
  }

  return ['Rational', value.numerator, value.denominator];
}

function simplifyNode(node: unknown): unknown {
  return normalizeAst(ce.box(node as Parameters<typeof ce.box>[0]).simplify().json);
}

function buildNegatedNode(node: unknown) {
  const scalar = readExactScalar(node);
  if (scalar) {
    return buildScalarNode(negateScalar(scalar));
  }
  return simplifyNode(['Negate', node]);
}

function buildSumNode(left: unknown, right: unknown) {
  return simplifyNode(['Add', left, right]);
}

function buildDifferenceNode(left: unknown, right: unknown) {
  return buildSumNode(left, buildNegatedNode(right));
}

function buildProductNode(left: unknown, right: unknown) {
  return simplifyNode(['Multiply', left, right]);
}

function buildQuotientNode(numerator: unknown, denominator: unknown) {
  return simplifyNode(['Divide', numerator, denominator]);
}

function buildPowerNode(base: unknown, exponent: number) {
  return simplifyNode(['Power', base, exponent]);
}

function buildPoweredNode(base: unknown, exponent: ExactScalar) {
  const poweredNode = simplifyNode(['Power', base, buildScalarNode(exponent)]);
  if (!expressionHasVariable(poweredNode)) {
    const numeric = evaluateRealNumericExpression(poweredNode, boxLatex(poweredNode));
    if (numeric.kind === 'success') {
      const roundedInteger = Math.round(numeric.value);
      if (Math.abs(numeric.value - roundedInteger) < 1e-10) {
        return roundedInteger;
      }
    }
  }

  return poweredNode;
}

function buildScaledNode(node: unknown, scalar: ExactScalar) {
  if (isZeroScalar(scalar)) {
    return 0;
  }

  if (scalar.numerator === scalar.denominator) {
    return node;
  }

  return buildProductNode(buildScalarNode(scalar), node);
}

function parseLinearPlaceholder(node: unknown, placeholder: string): PlaceholderLinearExpression | null {
  const normalized = normalizeAst(node);
  if (normalized === placeholder) {
    return {
      a: { numerator: 1, denominator: 1 },
      remainder: 0,
    };
  }

  const scalar = readExactScalar(normalized);
  if (scalar) {
    return {
      a: { numerator: 0, denominator: 1 },
      remainder: buildScalarNode(scalar),
    };
  }

  if (!isNodeArray(normalized) || normalized.length === 0) {
    return null;
  }

  if (normalized[0] === 'Negate' && normalized.length === 2) {
    const child = parseLinearPlaceholder(normalized[1], placeholder);
    if (!child) {
      return null;
    }

    return {
      a: negateScalar(child.a),
      remainder: buildNegatedNode(child.remainder),
    };
  }

  if (normalized[0] === 'Add') {
    let coefficient: ExactScalar = { numerator: 0, denominator: 1 };
    let remainder: unknown = 0;

    for (const child of normalized.slice(1)) {
      const parsed = parseLinearPlaceholder(child, placeholder);
      if (!parsed) {
        return null;
      }

      const nextCoefficient = addScalar(coefficient, parsed.a);
      if (!nextCoefficient) {
        return null;
      }
      coefficient = nextCoefficient;
      remainder = buildSumNode(remainder, parsed.remainder);
    }

    return {
      a: coefficient,
      remainder,
    };
  }

  if (normalized[0] === 'Multiply') {
    let scalarFactor: ExactScalar = { numerator: 1, denominator: 1 };
    let linearChild: PlaceholderLinearExpression | null = null;

    for (const child of normalized.slice(1)) {
      const childScalar = readExactScalar(child);
      if (childScalar) {
        const nextFactor = multiplyScalar(scalarFactor, childScalar);
        if (!nextFactor) {
          return null;
        }
        scalarFactor = nextFactor;
        continue;
      }

      const parsed = parseLinearPlaceholder(child, placeholder);
      if (!parsed || linearChild) {
        return null;
      }
      linearChild = parsed;
    }

    if (!linearChild) {
      return {
        a: { numerator: 0, denominator: 1 },
        remainder: buildScalarNode(scalarFactor),
      };
    }

    const nextA = multiplyScalar(scalarFactor, linearChild.a);
    if (!nextA) {
      return null;
    }

    return {
      a: nextA,
      remainder: buildScaledNode(linearChild.remainder, scalarFactor),
    };
  }

  if (normalized[0] === 'Divide' && normalized.length === 3) {
    const denominatorScalar = readExactScalar(normalized[2]);
    if (!denominatorScalar) {
      return null;
    }

    const numeratorLinear = parseLinearPlaceholder(normalized[1], placeholder);
    if (!numeratorLinear) {
      return null;
    }

    const nextA = divideScalar(numeratorLinear.a, denominatorScalar);
    if (!nextA) {
      return null;
    }

    return {
      a: nextA,
      remainder: buildQuotientNode(numeratorLinear.remainder, buildScalarNode(denominatorScalar)),
    };
  }

  return null;
}

function collectSupportedRoots(node: unknown, variable: string, roots: SupportedRadical[] = []) {
  const radical = matchSupportedRadical(node, variable);
  if (radical) {
    roots.push(radical);
  }

  if (!isNodeArray(node) || node.length === 0) {
    return roots;
  }

  for (const child of node.slice(1)) {
    collectSupportedRoots(child, variable, roots);
  }

  return roots;
}

function collectRadicalTargets(node: unknown, variable: string, targets: RadicalTarget[] = []) {
  const normalized = normalizeAst(node);
  const root = matchSupportedRadical(normalized, variable);
  if (root) {
    targets.push({
      kind: 'root',
      targetNode: normalized,
      root,
    });
  }

  if (
    isNodeArray(normalized)
    && normalized[0] === 'Divide'
    && normalized.length === 3
  ) {
    const numeratorScalar = readExactScalar(normalized[1]);
    const denominatorRoot = matchSupportedRadical(normalized[2], variable);
    if (numeratorScalar && denominatorRoot) {
      targets.push({
        kind: 'reciprocal-root',
        targetNode: normalized,
        root: denominatorRoot,
        numeratorScalar,
      });
    }
  }

  const power = matchSupportedRationalPower(normalized, variable);
  if (power) {
    targets.push({
      kind: 'power',
      targetNode: normalized,
      power,
    });
  }

  if (!isNodeArray(normalized) || normalized.length === 0) {
    return targets;
  }

  for (const child of normalized.slice(1)) {
    collectRadicalTargets(child, variable, targets);
  }

  return targets;
}

function replaceFirstMatch(node: unknown, targetKey: string, replacement: unknown): { node: unknown; replaced: boolean } {
  if (termKey(node) === targetKey) {
    return {
      node: replacement,
      replaced: true,
    };
  }

  if (!isNodeArray(node) || node.length === 0) {
    return {
      node,
      replaced: false,
    };
  }

  const rebuilt: unknown[] = [node[0]];
  let replaced = false;
  for (const child of node.slice(1)) {
    if (replaced) {
      rebuilt.push(child);
      continue;
    }
    const next = replaceFirstMatch(child, targetKey, replacement);
    rebuilt.push(next.node);
    replaced ||= next.replaced;
  }

  return {
    node: rebuilt,
    replaced,
  };
}

function appendSolveMetadata(
  outcome: DisplayOutcome,
  badges: SolveBadge[],
  summary: string,
): DisplayOutcome {
  if (outcome.kind === 'prompt') {
    return outcome;
  }

  const solveBadges = dedupe([...(outcome.solveBadges ?? []), ...badges]);
  const solveSummaryText = outcome.solveSummaryText
    ? `${summary}; ${outcome.solveSummaryText}`
    : summary;

  return {
    ...outcome,
    solveBadges,
    solveSummaryText,
  };
}

function subtractConstraints(
  constraints: SolveDomainConstraint[] = [],
  existing: SolveDomainConstraint[] = [],
): SolveDomainConstraint[] {
  if (constraints.length === 0) {
    return [];
  }

  const existingKeys = new Set(existing.map((constraint) => JSON.stringify(constraint)));
  return constraints.filter((constraint) => !existingKeys.has(JSON.stringify(constraint)));
}

function isSupportedRightSideExpression(node: unknown, variable: string): boolean {
  const normalized = normalizeAst(node);
  if (readExactScalar(normalized) || isSupportedRadicand(normalized, variable)) {
    return true;
  }

  if (matchSupportedRadical(normalized, variable)) {
    return true;
  }

  if (!isNodeArray(normalized) || normalized.length === 0) {
    return false;
  }

  if (normalized[0] === 'Negate' && normalized.length === 2) {
    return isSupportedRightSideExpression(normalized[1], variable);
  }

  if (normalized[0] === 'Add') {
    return (
      collectSupportedRoots(normalized, variable).length <= 1
      && normalized.slice(1).every((child) => isSupportedRightSideExpression(child, variable))
    );
  }

  if (normalized[0] === 'Multiply') {
    return (
      collectSupportedRoots(normalized, variable).length <= 1
      && normalized.slice(1).every((child) =>
        Boolean(readExactScalar(child) || isSupportedRightSideExpression(child, variable)))
    );
  }

  if (normalized[0] === 'Divide' && normalized.length === 3) {
    return Boolean(
      readExactScalar(normalized[2])
      && isSupportedRightSideExpression(normalized[1], variable)
    );
  }

  return false;
}

function matchRationalTransform(request: GuardedSolveRequest): AlgebraTransform | null {
  const parsed = ce.parse(request.resolvedLatex).json;
  if (!isNodeArray(parsed) || parsed[0] !== 'Equal' || parsed.length !== 3) {
    return null;
  }

  const zeroForm = normalizeAst(['Add', parsed[1], ['Negate', parsed[2]]]);
  const rational = normalizeExactRationalNode(zeroForm, 'simplify');
  if (!rational?.denominatorNode) {
    return null;
  }

  const equationLatex = `${rational.numeratorLatex}=0`;
  if (equationStateKey(equationLatex) === equationStateKey(request.resolvedLatex)) {
    return null;
  }

  return {
    equationLatex,
    domainConstraints: rational.exclusionConstraints,
    solveBadges: ['LCD Clear'],
    solveSummaryText: 'Cleared the LCD and reduced the equation to an exact solve-ready form',
    unresolvedError: 'This recognized rational family is outside the current exact bounded solve set. Use Numeric Solve with an interval in Equation mode.',
  };
}

function buildIsolatedExpression(
  targetSide: unknown,
  otherSide: unknown,
  targetKey: string,
): { isolated: unknown } | null {
  const replaced = replaceFirstMatch(targetSide, targetKey, PLACEHOLDER_SYMBOL);
  if (!replaced.replaced) {
    return null;
  }

  const linear = parseLinearPlaceholder(replaced.node, PLACEHOLDER_SYMBOL);
  if (!linear || isZeroScalar(linear.a)) {
    return null;
  }

  const numerator = buildDifferenceNode(otherSide, linear.remainder);
  const isolated = buildQuotientNode(numerator, buildScalarNode(linear.a));
  return {
    isolated,
  };
}

function buildRadicalPowerTransform(
  root: SupportedRadical,
  isolated: unknown,
  extraConstraints: SolveDomainConstraint[] = [],
): AlgebraTransform {
  const powered = root.index === 2
    ? normalizeAst((expand(ce.box(['Power', isolated, 2] as Parameters<typeof ce.box>[0]) as never) as { json: unknown }).json)
    : buildPowerNode(isolated, root.index);
  const equationLatex = `${boxLatex(root.radicand)}=${boxLatex(powered)}`;
  const domainConstraints = [...extraConstraints];

  if (root.index % 2 === 0) {
    domainConstraints.push({
      kind: 'nonnegative',
      expressionLatex: boxLatex(root.radicand),
    });
    domainConstraints.push({
      kind: 'nonnegative',
      expressionLatex: boxLatex(isolated),
    });
  }

  return {
    equationLatex,
    domainConstraints,
    solveBadges: ['Radical Isolation', 'Root Isolation', 'Power Lift'],
    solveSummaryText: 'Isolated a root and applied an exact power lift',
    unresolvedError: 'This recognized radical family is outside the current exact bounded solve set. Use Numeric Solve with an interval in Equation mode.',
  };
}

function buildLiftedPowerTransform(
  power: SupportedRationalPower,
  isolated: unknown,
): AlgebraTransform {
  const inverseExponent = normalizeScalar(power.denominator, power.numerator);
  const domainConstraints: SolveDomainConstraint[] = [];
  if (!inverseExponent) {
    return {
      equationLatex: `${boxLatex(power.node)}=${boxLatex(isolated)}`,
      solveBadges: ['Power Lift'],
      solveSummaryText: 'Isolated a rational power and applied an exact lift',
      unresolvedError: 'This recognized rational-power family is outside the current exact bounded solve set. Use Numeric Solve with an interval in Equation mode.',
    };
  }

  if (power.denominator % 2 === 0) {
    domainConstraints.push({
      kind: 'nonnegative',
      expressionLatex: boxLatex(power.base),
    });
    domainConstraints.push({
      kind: 'nonnegative',
      expressionLatex: boxLatex(isolated),
    });
  }

  if (power.denominator % 2 !== 0 && power.numerator % 2 === 0) {
    domainConstraints.push({
      kind: 'nonnegative',
      expressionLatex: boxLatex(isolated),
    });
  }

  const solvedMagnitude = buildPoweredNode(isolated, inverseExponent);
  const branchNodes = [solvedMagnitude];
  if (power.denominator % 2 !== 0 && power.numerator % 2 === 0) {
    branchNodes.push(buildNegatedNode(solvedMagnitude));
  }

  const branchEquations = dedupe(
    branchNodes.map((branchNode) => `${boxLatex(power.base)}=${boxLatex(branchNode)}`),
  );

  return {
    equationLatex: branchEquations[0],
    branchEquations,
    domainConstraints,
    solveBadges: ['Power Lift'],
    solveSummaryText: 'Isolated a rational power and applied an exact lift',
    unresolvedError: 'This recognized rational-power family is outside the current exact bounded solve set. Use Numeric Solve with an interval in Equation mode.',
  };
}

function matchDirectRationalPowerTransform(request: GuardedSolveRequest): AlgebraTransform | null {
  const parsed = ce.parse(request.resolvedLatex).json;
  if (!isNodeArray(parsed) || parsed[0] !== 'Equal' || parsed.length !== 3) {
    return null;
  }

  const leftNode = normalizeAst(parsed[1]);
  const rightNode = normalizeAst(parsed[2]);

  const variables = new Set<string>();
  const collectVariables = (node: unknown) => {
    if (typeof node === 'string' && node !== 'Pi' && node !== 'ExponentialE') {
      variables.add(node);
      return;
    }
    if (!isNodeArray(node) || node.length === 0) {
      return;
    }
    for (const child of node.slice(1)) {
      collectVariables(child);
    }
  };
  collectVariables(leftNode);
  collectVariables(rightNode);
  const variable = variables.size === 1 ? [...variables][0] : 'x';

  const attempts: Array<{ target: unknown; other: unknown }> = [
    { target: leftNode, other: rightNode },
    { target: rightNode, other: leftNode },
  ];

  for (const attempt of attempts) {
    const power = matchSupportedRationalPower(attempt.target, variable);
    if (!power || !isSupportedRightSideExpression(attempt.other, variable)) {
      continue;
    }
    const normalizedTarget = normalizeAst(attempt.target);
    if (
      isNodeArray(normalizedTarget)
      && (normalizedTarget[0] === 'Sqrt' || normalizedTarget[0] === 'Root')
      && power.numerator === 1
    ) {
      continue;
    }

    const transform = buildLiftedPowerTransform(power, attempt.other);
    if (equationStateKey(transform.equationLatex) !== equationStateKey(request.resolvedLatex)) {
      return transform;
    }
  }

  return null;
}

function matchRadicalIsolationTransform(request: GuardedSolveRequest): AlgebraTransform | null {
  const parsed = ce.parse(request.resolvedLatex).json;
  if (!isNodeArray(parsed) || parsed[0] !== 'Equal' || parsed.length !== 3) {
    return null;
  }
  const leftNode = normalizeAst(parsed[1]);
  const rightNode = normalizeAst(parsed[2]);

  const variables = new Set<string>();
  const collectVariables = (node: unknown) => {
    if (typeof node === 'string' && node !== PLACEHOLDER_SYMBOL && node !== 'Pi' && node !== 'ExponentialE') {
      variables.add(node);
      return;
    }
    if (!isNodeArray(node) || node.length === 0) {
      return;
    }
    for (const child of node.slice(1)) {
      collectVariables(child);
    }
  };
  collectVariables(leftNode);
  collectVariables(rightNode);
  const variable = variables.size === 1 ? [...variables][0] : 'x';

  const supportedRoots = [
    ...collectSupportedRoots(leftNode, variable),
    ...collectSupportedRoots(rightNode, variable),
  ];
  const supportedTargets = [
    ...collectRadicalTargets(leftNode, variable),
    ...collectRadicalTargets(rightNode, variable),
  ];

  if (supportedTargets.length === 0) {
    return null;
  }

  if (supportedRoots.length > 2) {
    return null;
  }

  if (supportedRoots.length > 1 && supportedRoots.some((root) => root.index !== 2)) {
    return null;
  }

  const attempts: Array<{ targetSide: unknown; otherSide: unknown }> = [
    { targetSide: leftNode, otherSide: rightNode },
    { targetSide: rightNode, otherSide: leftNode },
  ];

  for (const attempt of attempts) {
    if (!isSupportedRightSideExpression(attempt.otherSide, variable)) {
      continue;
    }

    const candidates = collectRadicalTargets(attempt.targetSide, variable).sort((left, right) => {
      const priority = (target: RadicalTarget) => {
        if (target.kind === 'reciprocal-root') {
          return 0;
        }
        if (target.kind === 'root') {
          return 1;
        }
        return 2;
      };
      return priority(left) - priority(right);
    });

    for (const candidate of candidates) {
      const isolatedBase = buildIsolatedExpression(
        attempt.targetSide,
        attempt.otherSide,
        termKey(candidate.targetNode),
      );
      if (!isolatedBase) {
        continue;
      }

      if (candidate.kind === 'power') {
        const transform = buildLiftedPowerTransform(candidate.power, isolatedBase.isolated);
        if (equationStateKey(transform.equationLatex) !== equationStateKey(request.resolvedLatex)) {
          return transform;
        }
        continue;
      }

      if (candidate.kind === 'root') {
        const transform = buildRadicalPowerTransform(candidate.root, isolatedBase.isolated);
        if (equationStateKey(transform.equationLatex) !== equationStateKey(request.resolvedLatex)) {
          return transform;
        }
        continue;
      }

      const radicalExpression = buildQuotientNode(
        buildScalarNode(candidate.numeratorScalar),
        isolatedBase.isolated,
      );
      const transform = buildRadicalPowerTransform(candidate.root, radicalExpression, [{
        kind: 'nonzero',
        expressionLatex: boxLatex(isolatedBase.isolated),
      }]);
      if (equationStateKey(transform.equationLatex) !== equationStateKey(request.resolvedLatex)) {
        return transform;
      }
    }
  }

  return null;
}

function tryRationalizeSquareRootBinomialSide(node: unknown, variable: string): AlgebraTransform | null {
  const normalized = normalizeAst(node);
  if (!isNodeArray(normalized) || normalized[0] !== 'Divide' || normalized.length !== 3) {
    return null;
  }

  const profile = buildSquareRootConjugateProfile(normalized[2], variable);
  if (!profile || profile.radicalCount !== 1) {
    return null;
  }

  const rationalizedNode = normalizeAst(['Divide',
    buildProductNode(normalized[1], profile.conjugateNode),
    profile.denominatorProductNode,
  ]);

  const constraints: SolveDomainConstraint[] = [{
    kind: 'nonzero',
    expressionLatex: boxLatex(profile.denominatorNode),
  }];

  return {
    equationLatex: boxLatex(rationalizedNode),
    domainConstraints: mergeConstraints(constraints, profile.conditionConstraints),
    solveBadges: ['Conjugate Transform'],
    solveSummaryText: 'Applied a conjugate to remove a square-root denominator',
    unresolvedError: 'This recognized radical conjugate family is outside the current exact bounded solve set. Use Numeric Solve with an interval in Equation mode.',
  };
}

function isSupportedClearableDenominator(node: unknown, variable: string) {
  return Boolean(readExactScalar(node) || isSupportedRadicand(node, variable));
}

function tryCrossMultiplySingleFractionEquation(equationLatex: string, variable: string) {
  const parsed = ce.parse(equationLatex).json;
  if (!isNodeArray(parsed) || parsed[0] !== 'Equal' || parsed.length !== 3) {
    return null;
  }

  const leftNode = normalizeAst(parsed[1]);
  const rightNode = normalizeAst(parsed[2]);
  const attempts: Array<{ fractionSide: unknown; otherSide: unknown; fractionOnLeft: boolean }> = [
    { fractionSide: leftNode, otherSide: rightNode, fractionOnLeft: true },
    { fractionSide: rightNode, otherSide: leftNode, fractionOnLeft: false },
  ];

  for (const attempt of attempts) {
    if (
      !isNodeArray(attempt.fractionSide)
      || attempt.fractionSide[0] !== 'Divide'
      || attempt.fractionSide.length !== 3
    ) {
      continue;
    }

    const denominator = normalizeAst(attempt.fractionSide[2]);
    if (!isSupportedClearableDenominator(denominator, variable)) {
      continue;
    }

    const clearedLeft = attempt.fractionOnLeft
      ? normalizeAst(attempt.fractionSide[1])
      : buildProductNode(leftNode, denominator);
    const clearedRight = attempt.fractionOnLeft
      ? buildProductNode(rightNode, denominator)
      : normalizeAst(attempt.fractionSide[1]);

    return {
      equationLatex: `${boxLatex(clearedLeft)}=${boxLatex(clearedRight)}`,
      domainConstraints: [],
      solveBadges: ['Conjugate Transform', 'LCD Clear'] as SolveBadge[],
      solveSummaryText: 'Applied a conjugate and cleared the remaining supported denominator',
      unresolvedError: 'This recognized radical conjugate family is outside the current exact bounded solve set. Use Numeric Solve with an interval in Equation mode.',
    };
  }

  return null;
}

function matchConjugateTransform(request: GuardedSolveRequest): AlgebraTransform | null {
  const parsed = ce.parse(request.resolvedLatex).json;
  if (!isNodeArray(parsed) || parsed[0] !== 'Equal' || parsed.length !== 3) {
    return null;
  }
  const leftNode = normalizeAst(parsed[1]);
  const rightNode = normalizeAst(parsed[2]);

  const variables = new Set<string>();
  const collectVariables = (node: unknown) => {
    if (typeof node === 'string' && node !== 'Pi' && node !== 'ExponentialE') {
      variables.add(node);
      return;
    }
    if (!isNodeArray(node) || node.length === 0) {
      return;
    }
    for (const child of node.slice(1)) {
      collectVariables(child);
    }
  };
  collectVariables(leftNode);
  collectVariables(rightNode);
  const variable = variables.size === 1 ? [...variables][0] : 'x';

  const leftTransform = tryRationalizeSquareRootBinomialSide(leftNode, variable);
  if (leftTransform) {
    const equationLatex = `${leftTransform.equationLatex}=${boxLatex(rightNode)}`;
    const cleared = tryCrossMultiplySingleFractionEquation(equationLatex, variable);
    if (cleared && equationStateKey(cleared.equationLatex) !== equationStateKey(request.resolvedLatex)) {
      return {
        ...cleared,
        domainConstraints: mergeConstraints(leftTransform.domainConstraints, cleared.domainConstraints),
      };
    }
    if (equationStateKey(equationLatex) !== equationStateKey(request.resolvedLatex)) {
      return {
        ...leftTransform,
        equationLatex,
      };
    }
  }

  const rightTransform = tryRationalizeSquareRootBinomialSide(rightNode, variable);
  if (rightTransform) {
    const equationLatex = `${boxLatex(leftNode)}=${rightTransform.equationLatex}`;
    const cleared = tryCrossMultiplySingleFractionEquation(equationLatex, variable);
    if (cleared && equationStateKey(cleared.equationLatex) !== equationStateKey(request.resolvedLatex)) {
      return {
        ...cleared,
        domainConstraints: mergeConstraints(rightTransform.domainConstraints, cleared.domainConstraints),
      };
    }
    if (equationStateKey(equationLatex) !== equationStateKey(request.resolvedLatex)) {
      return {
        ...rightTransform,
        equationLatex,
      };
    }
  }

  return null;
}

function recurseTransform(
  request: GuardedSolveRequest,
  transform: AlgebraTransform,
  depth: number,
  trail: Set<string>,
  maxRecursionDepth: number,
  runGuardedEquationSolve: GuardedSolveRunner,
): DisplayOutcome | null {
  if (depth >= maxRecursionDepth) {
    return errorOutcome(
      'Solve',
      'This equation exceeded the supported guarded-solve recursion depth for this milestone.',
      [],
      [],
      transform.solveBadges,
      transform.solveSummaryText,
    );
  }

  const parentKey = equationStateKey(request.resolvedLatex);
  const branchEquations = dedupe(transform.branchEquations ?? [transform.equationLatex]).filter(
    (equationLatex) => equationStateKey(equationLatex) !== parentKey,
  );
  if (branchEquations.length === 0) {
    return null;
  }

  const recursiveOutcomes = branchEquations.map((equationLatex) =>
    runGuardedEquationSolve(
      {
        ...request,
        originalLatex: equationLatex,
        resolvedLatex: equationLatex,
        validationLatex: request.validationLatex ?? request.resolvedLatex,
        numericInterval: undefined,
        domainConstraints: mergeConstraints(request.domainConstraints, transform.domainConstraints),
      },
      depth + 1,
      new Set(trail),
    ));

  const recursiveOutcome = recursiveOutcomes.length === 1
    ? recursiveOutcomes[0]
    : mergeDisplayOutcomes(
        recursiveOutcomes,
        transform.solveBadges,
        dedupe([
          transform.solveSummaryText,
          ...recursiveOutcomes
            .flatMap((outcome) => (outcome.kind !== 'prompt' && outcome.solveSummaryText ? [outcome.solveSummaryText] : [])),
        ]).join('; '),
      );

  if (recursiveOutcome.kind === 'error' && recursiveOutcome.error === UNSUPPORTED_FAMILY_ERROR) {
    if (request.numericInterval) {
      return null;
    }

    return errorOutcome(
      'Solve',
      transform.unresolvedError,
      recursiveOutcome.warnings,
      recursiveOutcome.plannerBadges ?? [],
      dedupe([...(recursiveOutcome.solveBadges ?? []), ...transform.solveBadges]),
      transform.solveSummaryText,
      recursiveOutcome.rejectedCandidateCount,
      recursiveOutcome.substitutionDiagnostics,
      recursiveOutcome.numericMethod,
    );
  }

  const supplementedOutcome: DisplayOutcome =
    recursiveOutcome.kind === 'success'
      ? (() => {
          const newTransformConstraints = subtractConstraints(
            transform.domainConstraints,
            request.domainConstraints,
          );
          const supplements = dedupe([
            ...(recursiveOutcome.exactSupplementLatex ?? []),
            ...buildConstraintSupplementLatex(newTransformConstraints),
          ]);
          return {
            ...recursiveOutcome,
            exactSupplementLatex: supplements.length > 0 ? supplements : undefined,
          };
        })()
      : recursiveOutcome;

  if (recursiveOutcomes.length > 1) {
    return supplementedOutcome;
  }

  return appendSolveMetadata(supplementedOutcome, transform.solveBadges, transform.solveSummaryText);
}

function algebraTransformSolve(
  request: GuardedSolveRequest,
  depth: number,
  trail: Set<string>,
  maxRecursionDepth: number,
  runGuardedEquationSolve: GuardedSolveRunner,
): DisplayOutcome | null {
  const rationalTransform = matchRationalTransform(request);
  if (rationalTransform) {
    const recursive = recurseTransform(
      request,
      rationalTransform,
      depth,
      trail,
      maxRecursionDepth,
      runGuardedEquationSolve,
    );
    if (recursive) {
      return recursive;
    }
  }

  const directPowerTransform = matchDirectRationalPowerTransform(request);
  if (directPowerTransform) {
    const recursive = recurseTransform(
      request,
      directPowerTransform,
      depth,
      trail,
      maxRecursionDepth,
      runGuardedEquationSolve,
    );
    if (recursive) {
      return recursive;
    }
  }

  const radicalTransform = matchRadicalIsolationTransform(request);
  if (radicalTransform) {
    const recursive = recurseTransform(
      request,
      radicalTransform,
      depth,
      trail,
      maxRecursionDepth,
      runGuardedEquationSolve,
    );
    if (recursive) {
      return recursive;
    }
  }

  const conjugateTransform = matchConjugateTransform(request);
  if (conjugateTransform) {
    const recursive = recurseTransform(
      request,
      conjugateTransform,
      depth,
      trail,
      maxRecursionDepth,
      runGuardedEquationSolve,
    );
    if (recursive) {
      return recursive;
    }
  }

  return null;
}

export { algebraTransformSolve };
