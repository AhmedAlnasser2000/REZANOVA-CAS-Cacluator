import type { SolveDomainConstraint } from '../../types/calculator';
import {
  boxLatex,
  compactRepeatedProductFactors,
  isFiniteNumber,
  isNodeArray,
  wrapGroupedLatex,
} from './patterns';
import { normalizeAst } from './normalize';

type PowerLogMode =
  | 'simplify'
  | 'rewrite-root'
  | 'rewrite-power'
  | 'change-base'
  | 'equation-preprocess';

type RationalValue = {
  numerator: number;
  denominator: number;
};

type RadicalInfo = {
  base: unknown;
  numerator: number;
  denominator: number;
};

type SerializedNode = {
  node: unknown;
  latex: string;
  changed: boolean;
  handled: boolean;
  conditionConstraints: SolveDomainConstraint[];
  containsTrackedNotation: boolean;
};

type LogCall = {
  family: 'ln' | 'log';
  baseNode?: unknown;
  baseKey: string;
  argumentNode: unknown;
  argumentLatex: string;
};

export type PowerLogNormalizationResult = {
  handled: boolean;
  changed: boolean;
  normalizedNode: unknown;
  normalizedLatex: string;
  conditionConstraints: SolveDomainConstraint[];
  exactSupplementLatex: string[];
};

const RELATION_LATEX: Record<string, string> = {
  Equal: '=',
  NotEqual: '\\ne',
  Less: '<',
  LessEqual: '\\le',
  Greater: '>',
  GreaterEqual: '\\ge',
};

function gcd(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a || 1;
}

function reduceRational(numerator: number, denominator: number): RationalValue {
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: (sign * numerator) / divisor,
    denominator: Math.abs(denominator) / divisor,
  };
}

function mergeConstraints(
  left: SolveDomainConstraint[] = [],
  right: SolveDomainConstraint[] = [],
) {
  const merged = new Map<string, SolveDomainConstraint>();
  for (const constraint of [...left, ...right]) {
    const key = JSON.stringify(constraint);
    if (!merged.has(key)) {
      merged.set(key, constraint);
    }
  }
  return [...merged.values()];
}

function buildConditionSupplement(constraints: SolveDomainConstraint[]) {
  const supported = constraints.flatMap((constraint) => {
    switch (constraint.kind) {
      case 'nonnegative':
        return [`${constraint.expressionLatex}\\ge0`];
      case 'positive':
        return [`${constraint.expressionLatex}>0`];
      default:
        return [];
    }
  });

  if (supported.length === 0) {
    return [] as string[];
  }

  return [`\\text{Conditions: } ${supported.join(',\\;')}`];
}

function collectVariables(node: unknown, variables: Set<string>) {
  if (typeof node === 'string') {
    if (node !== 'Pi' && node !== 'ExponentialE') {
      variables.add(node);
    }
    return;
  }

  if (!isNodeArray(node) || node.length === 0) {
    return;
  }

  for (let index = 1; index < node.length; index += 1) {
    collectVariables(node[index], variables);
  }
}

function expressionHasVariable(node: unknown) {
  const variables = new Set<string>();
  collectVariables(node, variables);
  return variables.size > 0;
}

function isExponentialE(node: unknown) {
  return node === 'ExponentialE';
}

function asPositiveInteger(node: unknown): number | undefined {
  return isFiniteNumber(node) && Number.isInteger(node) && node > 1 ? node : undefined;
}

function asRational(node: unknown): RationalValue | undefined {
  if (isFiniteNumber(node) && Number.isInteger(node)) {
    return { numerator: node, denominator: 1 };
  }

  if (!isNodeArray(node) || node.length === 0) {
    return undefined;
  }

  const [head, left, right] = node;
  if (
    (head === 'Rational' || head === 'Divide')
    && isFiniteNumber(left)
    && Number.isInteger(left)
    && isFiniteNumber(right)
    && Number.isInteger(right)
    && right !== 0
  ) {
    return reduceRational(left, right);
  }

  return undefined;
}

function readNumericConstant(node: unknown): number | undefined {
  if (isFiniteNumber(node)) {
    return node;
  }

  const rational = asRational(node);
  if (!rational) {
    return undefined;
  }

  return rational.numerator / rational.denominator;
}

function wrapPowerBaseLatex(latex: string, node: unknown) {
  if (typeof node === 'string' || typeof node === 'number') {
    return latex;
  }

  if (!isNodeArray(node) || node.length === 0) {
    return latex;
  }

  const head = node[0];
  return head === 'Sqrt' || head === 'Root' || head === 'Ln' || head === 'Log'
    ? latex
    : wrapGroupedLatex(latex);
}

function wrapAdditiveTerm(latex: string, node: unknown) {
  if (!isNodeArray(node) || node.length === 0) {
    return latex;
  }

  const head = node[0];
  return head === 'Add' || head === 'Equal' || head === 'NotEqual' || head === 'Less' || head === 'LessEqual' || head === 'Greater' || head === 'GreaterEqual'
    ? `\\left(${latex}\\right)`
    : latex;
}

function combineAdditiveLatex(children: Array<{ node: unknown; render: SerializedNode }>) {
  const [first, ...rest] = children;
  let latex = first.render.latex;

  for (const child of rest) {
    const childNode = child.node;
    if (isNodeArray(childNode) && childNode[0] === 'Negate' && childNode.length === 2) {
      latex += `-${wrapAdditiveTerm(child.render.latex.slice(1), childNode[1])}`;
      continue;
    }

    if (typeof childNode === 'number' && childNode < 0) {
      latex += `-${boxLatex(Math.abs(childNode))}`;
      continue;
    }

    latex += `+${child.render.latex}`;
  }

  return latex;
}

function reorderAddChildren(children: Array<{ node: unknown; latex: string }>) {
  if (children.length !== 2) {
    return children;
  }

  const [first, second] = children;
  if (typeof first.node === 'number' && first.node >= 0 && typeof second.node !== 'number') {
    return [second, first];
  }

  return children;
}

function buildRationalNode(value: RationalValue): unknown {
  if (value.denominator === 1) {
    return value.numerator;
  }

  return ['Rational', value.numerator, value.denominator];
}

function buildPowerNode(base: unknown, numerator: number, denominator: number) {
  if (denominator === 1) {
    return numerator === 1 ? base : ['Power', base, numerator];
  }

  return ['Power', base, buildRationalNode(reduceRational(numerator, denominator))];
}

function buildRootNode(base: unknown, numerator: number, denominator: number): unknown {
  const poweredBase = numerator === 1 ? base : ['Power', base, numerator];
  if (denominator === 2) {
    return ['Sqrt', poweredBase];
  }
  return ['Root', poweredBase, denominator];
}

function buildProductNode(left: unknown, right: unknown): unknown {
  const normalized = normalizeAst(['Multiply', left, right]);
  return normalized;
}

function exactPositiveBase(node: unknown) {
  const value = readNumericConstant(node);
  return value !== undefined && value > 0 && Math.abs(value - 1) > 1e-9;
}

function extractRadicalInfo(node: unknown): RadicalInfo | null {
  const normalized = normalizeAst(node);
  if (!isNodeArray(normalized) || normalized.length === 0) {
    return null;
  }

  const [head, left, right] = normalized;
  if (head === 'Sqrt') {
    const inner = extractRadicalInfo(left);
    if (inner) {
      const combined = reduceRational(inner.numerator, inner.denominator * 2);
      return {
        base: inner.base,
        numerator: combined.numerator,
        denominator: combined.denominator,
      };
    }

    return { base: left, numerator: 1, denominator: 2 };
  }

  if (head === 'Root') {
    const index = asPositiveInteger(right);
    if (!index) {
      return null;
    }

    const inner = extractRadicalInfo(left);
    if (inner) {
      const combined = reduceRational(inner.numerator, inner.denominator * index);
      return {
        base: inner.base,
        numerator: combined.numerator,
        denominator: combined.denominator,
      };
    }

    return { base: left, numerator: 1, denominator: index };
  }

  if (head === 'Power') {
    const exponent = asRational(right);
    if (!exponent) {
      return null;
    }

    const inner = extractRadicalInfo(left);
    if (inner) {
      const combined = reduceRational(
        inner.numerator * exponent.numerator,
        inner.denominator * exponent.denominator,
      );
      return {
        base: inner.base,
        numerator: combined.numerator,
        denominator: combined.denominator,
      };
    }

    if (exponent.denominator > 1) {
      return {
        base: left,
        numerator: exponent.numerator,
        denominator: exponent.denominator,
      };
    }
  }

  return null;
}

function isPlainFamiliarRoot(node: unknown) {
  if (!isNodeArray(node) || node.length === 0) {
    return false;
  }

  if (node[0] === 'Sqrt' && node.length === 2) {
    return extractRadicalInfo(node[1]) === null;
  }

  if (node[0] === 'Root' && node.length === 3) {
    const index = asPositiveInteger(node[2]);
    return index === 3 && extractRadicalInfo(node[1]) === null;
  }

  return false;
}

function shouldCanonicalizePower(node: unknown) {
  if (!isNodeArray(node) || node.length === 0) {
    return false;
  }

  if (node[0] === 'Sqrt') {
    return !isPlainFamiliarRoot(node);
  }

  if (node[0] === 'Root') {
    return !isPlainFamiliarRoot(node);
  }

  return node[0] === 'Power' && isNodeArray(node[1]) && (node[1][0] === 'Sqrt' || node[1][0] === 'Root');
}

function radicalConstraints(base: unknown, denominator: number) {
  if (denominator % 2 !== 0 || !expressionHasVariable(base)) {
    return [] as SolveDomainConstraint[];
  }

  return [{
    kind: 'nonnegative' as const,
    expressionLatex: boxLatex(base),
  }];
}

function serializeNode(node: unknown): string {
  if (typeof node === 'string') {
    return node === 'ExponentialE' ? 'e' : boxLatex(node);
  }

  if (typeof node === 'number') {
    return boxLatex(node);
  }

  if (!isNodeArray(node) || node.length === 0) {
    return boxLatex(node);
  }

  const compactedProduct = compactRepeatedProductFactors(node);
  if (compactedProduct !== node) {
    return serializeNode(compactedProduct);
  }

  const [head, ...children] = node;
  const renderedChildren = children.map((child) => ({
    node: child,
    latex: serializeNode(child),
  }));

  switch (head) {
    case 'Equal':
    case 'NotEqual':
    case 'Less':
    case 'LessEqual':
    case 'Greater':
    case 'GreaterEqual':
      if (renderedChildren.length === 2) {
        return `${renderedChildren[0].latex}${RELATION_LATEX[head]}${renderedChildren[1].latex}`;
      }
      break;
    case 'Add':
      if (renderedChildren.length > 0) {
        return combineAdditiveLatex(reorderAddChildren(renderedChildren).map((child) => ({
          node: child.node,
          render: {
            node: child.node,
            latex: child.latex,
            changed: false,
            handled: false,
            conditionConstraints: [],
            containsTrackedNotation: false,
          },
        })));
      }
      break;
    case 'Multiply':
      if (renderedChildren.length > 0) {
        return renderedChildren
          .map((child) => wrapAdditiveTerm(child.latex, child.node))
          .join('');
      }
      break;
    case 'Divide':
      if (renderedChildren.length === 2) {
        return `\\frac{${renderedChildren[0].latex}}{${renderedChildren[1].latex}}`;
      }
      break;
    case 'Negate':
      if (renderedChildren.length === 1) {
        return `-${wrapAdditiveTerm(renderedChildren[0].latex, renderedChildren[0].node)}`;
      }
      break;
    case 'Power':
      if (children.length === 2) {
        if (isExponentialE(children[0])) {
          return `e^{${renderedChildren[1].latex}}`;
        }
        return `${wrapPowerBaseLatex(renderedChildren[0].latex, children[0])}^{${renderedChildren[1].latex}}`;
      }
      break;
    case 'Sqrt':
      if (renderedChildren.length === 1) {
        return `\\sqrt{${renderedChildren[0].latex}}`;
      }
      break;
    case 'Root':
      if (renderedChildren.length === 2) {
        return `\\sqrt[${renderedChildren[1].latex}]{${renderedChildren[0].latex}}`;
      }
      break;
    case 'Ln':
      if (renderedChildren.length === 1) {
        return `\\ln\\left(${renderedChildren[0].latex}\\right)`;
      }
      break;
    case 'Log':
      if (renderedChildren.length === 1) {
        return `\\log\\left(${renderedChildren[0].latex}\\right)`;
      }
      if (renderedChildren.length === 2) {
        if (isExponentialE(children[1])) {
          return `\\ln\\left(${renderedChildren[0].latex}\\right)`;
        }
        if (readNumericConstant(children[1]) === 10) {
          return `\\log\\left(${renderedChildren[0].latex}\\right)`;
        }
        return `\\log_{${renderedChildren[1].latex}}\\left(${renderedChildren[0].latex}\\right)`;
      }
      break;
    default:
      break;
  }

  return boxLatex(node);
}

function matchLogCall(node: unknown): LogCall | null {
  const normalized = normalizeAst(node);
  if (!isNodeArray(normalized) || normalized.length === 0) {
    return null;
  }

  if (normalized[0] === 'Ln' && normalized.length === 2) {
    return {
      family: 'ln',
      baseKey: 'ln',
      argumentNode: normalized[1],
      argumentLatex: serializeNode(normalized[1]),
    };
  }

  if (normalized[0] !== 'Log' || normalized.length < 2 || normalized.length > 3) {
    return null;
  }

  const argumentNode = normalized[1];
  const argumentLatex = serializeNode(argumentNode);
  if (normalized.length === 2) {
    return {
      family: 'log',
      baseKey: 'log10',
      argumentNode,
      argumentLatex,
    };
  }

  const base = normalized[2];
  if (isExponentialE(base)) {
    return {
      family: 'ln',
      baseKey: 'ln',
      argumentNode,
      argumentLatex,
    };
  }

  const numericBase = readNumericConstant(base);
  if (numericBase === 10) {
    return {
      family: 'log',
      baseKey: 'log10',
      argumentNode,
      argumentLatex,
    };
  }

  if (!exactPositiveBase(base)) {
    return null;
  }

  return {
    family: 'log',
    baseNode: base,
    baseKey: serializeNode(base),
    argumentNode,
    argumentLatex,
  };
}

function buildLogNode(call: LogCall, argumentNode: unknown) {
  if (call.family === 'ln') {
    return ['Ln', argumentNode];
  }

  if (!call.baseNode) {
    return ['Log', argumentNode];
  }

  return ['Log', argumentNode, call.baseNode];
}

function tryCombineSameBaseLogs(node: unknown, left: SerializedNode, right: SerializedNode): SerializedNode | null {
  const normalized = normalizeAst(node);
  if (!isNodeArray(normalized) || normalized[0] !== 'Add' || normalized.length !== 3) {
    return null;
  }

  const leftCall = matchLogCall(left.node);
  const rightCall = matchLogCall(right.node);
  if (!leftCall || !rightCall || leftCall.baseKey !== rightCall.baseKey) {
    return null;
  }

  const combinedArgument = buildProductNode(leftCall.argumentNode, rightCall.argumentNode);
  const combinedNode = normalizeAst(buildLogNode(leftCall, combinedArgument));
  const constraints = mergeConstraints(
    left.conditionConstraints,
    mergeConstraints(
      right.conditionConstraints,
      [
        { kind: 'positive' as const, expressionLatex: leftCall.argumentLatex },
        { kind: 'positive' as const, expressionLatex: rightCall.argumentLatex },
      ],
    ),
  );

  return {
    node: combinedNode,
    latex: serializeNode(combinedNode),
    changed: true,
    handled: true,
    conditionConstraints: constraints,
    containsTrackedNotation: true,
  };
}

function serializeRebuiltNode(
  original: unknown,
  children: SerializedNode[],
): SerializedNode {
  if (!isNodeArray(original) || original.length === 0) {
    return {
      node: original,
      latex: serializeNode(original),
      changed: false,
      handled: false,
      conditionConstraints: [],
      containsTrackedNotation: false,
    };
  }

  const rebuilt = normalizeAst([original[0], ...children.map((child) => child.node)]);
  const conditionConstraints = children.reduce<SolveDomainConstraint[]>(
    (current, child) => mergeConstraints(current, child.conditionConstraints),
    [],
  );
  const containsTrackedNotation =
    (isNodeArray(rebuilt)
      && (rebuilt[0] === 'Ln'
        || rebuilt[0] === 'Log'
        || (rebuilt[0] === 'Power' && rebuilt.length === 3 && isExponentialE(rebuilt[1]))))
    || children.some((child) => child.containsTrackedNotation);

  return {
    node: rebuilt,
    latex: serializeNode(rebuilt),
    changed: children.some((child) => child.changed),
    handled: children.some((child) => child.handled),
    conditionConstraints,
    containsTrackedNotation,
  };
}

function normalizeEquationPreprocess(node: unknown): SerializedNode {
  const normalized = normalizeAst(node);
  if (typeof normalized === 'string' || typeof normalized === 'number' || !isNodeArray(normalized) || normalized.length === 0) {
    return {
      node: normalized,
      latex: serializeNode(normalized),
      changed: false,
      handled: false,
      conditionConstraints: [],
      containsTrackedNotation: false,
    };
  }

  const [head, ...children] = normalized;
  if (head === 'Power' && children.length === 2) {
    const exponent = asRational(children[1]);
    if (
      exponent
      && exponent.numerator === 1
      && exponent.denominator > 1
      && !isExponentialE(children[0])
    ) {
      const base = normalizeEquationPreprocess(children[0]);
      const rewrittenNode = normalizeAst(buildRootNode(base.node, 1, exponent.denominator));
      return {
        node: rewrittenNode,
        latex: serializeNode(rewrittenNode),
        changed: true,
        handled: true,
        conditionConstraints: base.conditionConstraints,
        containsTrackedNotation: base.containsTrackedNotation,
      };
    }
  }

  const childResults = children.map((child) => normalizeEquationPreprocess(child));
  const rebuilt = serializeRebuiltNode(normalized, childResults);

  if (
    head === 'Log'
    || head === 'Ln'
    || head === 'Sqrt'
    || head === 'Root'
    || (head === 'Power' && children.length === 2 && isExponentialE(children[0]))
  ) {
    const targetLatex = serializeNode(rebuilt.node);
    return {
      ...rebuilt,
      latex: targetLatex,
      changed: rebuilt.changed || targetLatex !== boxLatex(normalized),
      handled: true,
      containsTrackedNotation:
        head === 'Log'
        || head === 'Ln'
        || (head === 'Power' && children.length === 2 && isExponentialE(children[0])),
    };
  }

  return rebuilt;
}

function normalizeForSimplify(node: unknown): SerializedNode {
  const normalized = normalizeAst(node);

  if (typeof normalized === 'string' || typeof normalized === 'number' || !isNodeArray(normalized) || normalized.length === 0) {
    return {
      node: normalized,
      latex: serializeNode(normalized),
      changed: false,
      handled: false,
      conditionConstraints: [],
      containsTrackedNotation: false,
    };
  }

  if (shouldCanonicalizePower(normalized)) {
    const info = extractRadicalInfo(normalized);
    if (info) {
      const powerNode = normalizeAst(buildPowerNode(info.base, info.numerator, info.denominator));
      return {
        node: powerNode,
        latex: serializeNode(powerNode),
        changed: true,
        handled: true,
        conditionConstraints: radicalConstraints(info.base, info.denominator),
        containsTrackedNotation: false,
      };
    }
  }

  if (isPlainFamiliarRoot(normalized)) {
    return {
      node: normalized,
      latex: serializeNode(normalized),
      changed: false,
      handled: true,
      conditionConstraints: [],
      containsTrackedNotation: false,
    };
  }

  const [head, ...children] = normalized;
  const childResults = children.map((child) => normalizeForSimplify(child));

  if (head === 'Add' && childResults.length === 2) {
    const combined = tryCombineSameBaseLogs(normalized, childResults[0], childResults[1]);
    if (combined) {
      return combined;
    }
  }

  const rebuilt = serializeRebuiltNode(normalized, childResults);
  if (rebuilt.containsTrackedNotation) {
    return {
      ...rebuilt,
      changed: rebuilt.changed || rebuilt.latex !== boxLatex(normalized),
      handled: true,
    };
  }

  return rebuilt;
}

function rewriteAsPower(node: unknown): SerializedNode | null {
  const info = extractRadicalInfo(node);
  if (!info) {
    return null;
  }

  const powerNode = normalizeAst(buildPowerNode(info.base, info.numerator, info.denominator));
  return {
    node: powerNode,
    latex: serializeNode(powerNode),
    changed: true,
    handled: true,
    conditionConstraints: radicalConstraints(info.base, info.denominator),
    containsTrackedNotation: false,
  };
}

function rewriteAsRoot(node: unknown): SerializedNode | null {
  const info = extractRadicalInfo(node);
  if (!info || info.denominator <= 1) {
    return null;
  }

  const rootNode = normalizeAst(buildRootNode(info.base, info.numerator, info.denominator));
  return {
    node: rootNode,
    latex: serializeNode(rootNode),
    changed: true,
    handled: true,
    conditionConstraints: radicalConstraints(info.base, info.denominator),
    containsTrackedNotation: false,
  };
}

function changeBase(node: unknown): SerializedNode | null {
  const call = matchLogCall(node);
  if (!call || call.family !== 'log' || !call.baseNode) {
    return null;
  }

  const baseValue = readNumericConstant(call.baseNode);
  if (baseValue === undefined || baseValue === 10 || !exactPositiveBase(call.baseNode)) {
    return null;
  }

  const ratioNode = normalizeAst([
    'Divide',
    ['Ln', call.argumentNode],
    ['Ln', call.baseNode],
  ]);

  return {
    node: ratioNode,
    latex: serializeNode(ratioNode),
    changed: true,
    handled: true,
    conditionConstraints: [{
      kind: 'positive',
      expressionLatex: call.argumentLatex,
    }],
    containsTrackedNotation: true,
  };
}

function normalizeByMode(node: unknown, mode: PowerLogMode): SerializedNode | null {
  switch (mode) {
    case 'simplify':
      return normalizeForSimplify(node);
    case 'rewrite-power':
      return rewriteAsPower(node);
    case 'rewrite-root':
      return rewriteAsRoot(node);
    case 'change-base':
      return changeBase(node);
    case 'equation-preprocess':
      return normalizeEquationPreprocess(node);
    default:
      return null;
  }
}

export function normalizeExactPowerLogNode(
  node: unknown,
  mode: PowerLogMode,
): PowerLogNormalizationResult | null {
  const normalized = normalizeByMode(node, mode);
  if (!normalized) {
    return null;
  }

  const originalLatex = serializeNode(normalizeAst(node));
  const conditionConstraints = mergeConstraints(normalized.conditionConstraints);
  const exactSupplementLatex = buildConditionSupplement(conditionConstraints);
  const changed = normalized.changed || exactSupplementLatex.length > 0;

  if (!changed && !normalized.handled) {
    return null;
  }

  return {
    handled: normalized.handled,
    changed: normalized.latex !== originalLatex || exactSupplementLatex.length > 0,
    normalizedNode: normalized.node,
    normalizedLatex: normalized.latex,
    conditionConstraints,
    exactSupplementLatex,
  };
}
