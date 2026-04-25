import { ComputeEngine } from '@cortex-js/compute-engine';
import type { LimitDirection } from '../../types/calculator';
import { differentiateAst } from './differentiation';
import { normalizeAst } from './normalize';
import { isNodeArray } from './patterns';
import { normalizeExactRationalNode } from './rational';

const ce = new ComputeEngine();
type FiniteLimitRuleValue = number | 'posInfinity' | 'negInfinity';

type BoxedLike = {
  latex: string;
  json: unknown;
  evaluate: () => BoxedLike;
  N?: () => BoxedLike;
  subs: (scope: Record<string, number>) => BoxedLike;
};

function box(node: unknown) {
  return ce.box(node as Parameters<typeof ce.box>[0]) as BoxedLike;
}

function latexToNumber(latex: string) {
  const normalized = latex
    .replaceAll('\\cdot', '')
    .replaceAll('\\,', '')
    .replaceAll(' ', '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function evaluateNodeAt(node: unknown, value: number, variable = 'x') {
  try {
    const evaluated = box(node).subs({ [variable]: value }).evaluate();
    if (typeof evaluated.json === 'number' && Number.isFinite(evaluated.json)) {
      return evaluated.json;
    }
    return latexToNumber((evaluated.N?.() ?? evaluated).latex);
  } catch {
    return undefined;
  }
}

function isZeroish(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) && Math.abs(value) < 1e-8;
}

function isHuge(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) && Math.abs(value) > 1e8;
}

function isNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value < 0;
}

function isEquivalentNode(left: unknown, right: unknown) {
  return JSON.stringify(normalizeAst(left)) === JSON.stringify(normalizeAst(right));
}

function isNumericOne(node: unknown) {
  return node === 1;
}

function isNumericMinusOne(node: unknown) {
  return node === -1;
}

function matchOnePlus(node: unknown) {
  if (!isNodeArray(node) || node[0] !== 'Add') {
    return null;
  }

  const terms = node.slice(1);
  const oneIndex = terms.findIndex(isNumericOne);
  if (oneIndex === -1 || terms.length !== 2) {
    return null;
  }

  return terms[1 - oneIndex];
}

function matchFunctionMinusOne(node: unknown, functionHead: string) {
  if (!isNodeArray(node) || node[0] !== 'Add') {
    return null;
  }

  const terms = node.slice(1);
  if (terms.length !== 2 || !terms.some(isNumericMinusOne)) {
    return null;
  }

  const functionTerm = terms.find((term) =>
    isNodeArray(term)
    && term[0] === functionHead
    && term.length === 2);

  return isNodeArray(functionTerm) ? functionTerm[1] : null;
}

function matchExpMinusOne(node: unknown) {
  if (!isNodeArray(node) || node[0] !== 'Add') {
    return null;
  }

  const terms = node.slice(1);
  if (terms.length !== 2 || !terms.some(isNumericMinusOne)) {
    return null;
  }

  const expTerm = terms.find((term) =>
    isNodeArray(term)
    && term[0] === 'Power'
    && term.length === 3
    && term[1] === 'ExponentialE');

  return isNodeArray(expTerm) ? expTerm[2] : null;
}

function matchOneMinusFunction(node: unknown, functionHead: string) {
  if (!isNodeArray(node) || node[0] !== 'Add') {
    return null;
  }

  const terms = node.slice(1);
  if (terms.length !== 2 || !terms.some(isNumericOne)) {
    return null;
  }

  const negatedFunction = terms.find((term) =>
    isNodeArray(term)
    && term[0] === 'Negate'
    && term.length === 2
    && isNodeArray(term[1])
    && term[1][0] === functionHead
    && term[1].length === 2);

  return isNodeArray(negatedFunction) && isNodeArray(negatedFunction[1])
    ? negatedFunction[1][1]
    : null;
}

function matchKnownLimitInner(
  node: unknown,
  denominator: unknown,
  target: number,
  variable: string,
): number | undefined {
  if (isNodeArray(node) && (node[0] === 'Sin' || node[0] === 'Tan') && node.length === 2) {
    const inner = node[1];
    return isEquivalentNode(denominator, inner) && isZeroish(evaluateNodeAt(inner, target, variable))
      ? 1
      : undefined;
  }

  const cosineInner = matchOneMinusFunction(node, 'Cos');
  if (
    cosineInner
    && isEquivalentNode(denominator, ['Power', cosineInner, 2])
    && isZeroish(evaluateNodeAt(cosineInner, target, variable))
  ) {
    return 0.5;
  }

  const expInner = matchExpMinusOne(node);
  if (
    expInner
    && isEquivalentNode(denominator, expInner)
    && isZeroish(evaluateNodeAt(expInner, target, variable))
  ) {
    return 1;
  }

  if (isNodeArray(node) && node[0] === 'Ln' && node.length === 2) {
    const inner = matchOnePlus(node[1]);
    if (inner && isEquivalentNode(denominator, inner) && isZeroish(evaluateNodeAt(inner, target, variable))) {
      return 1;
    }
  }

  const sqrtArgument = matchFunctionMinusOne(node, 'Sqrt');
  const sqrtInner = sqrtArgument ? matchOnePlus(sqrtArgument) : null;
  if (
    sqrtInner
    && isEquivalentNode(denominator, sqrtInner)
    && isZeroish(evaluateNodeAt(sqrtInner, target, variable))
  ) {
    return 0.5;
  }

  return undefined;
}

function resolveKnownFiniteLimitRule(node: unknown, target: number, variable: string) {
  if (!isNodeArray(node) || node[0] !== 'Divide' || node.length !== 3) {
    return undefined;
  }

  const value = matchKnownLimitInner(node[1], node[2], target, variable);
  return value === undefined
    ? undefined
    : { kind: 'success' as const, value, origin: 'rule-based-symbolic' as const };
}

function resolveRemovableRationalHole(node: unknown, target: number, variable: string) {
  if (!isNodeArray(node) || node[0] !== 'Divide' || node.length !== 3) {
    return undefined;
  }

  const numeratorValue = evaluateNodeAt(node[1], target, variable);
  const denominatorValue = evaluateNodeAt(node[2], target, variable);
  if (!isZeroish(numeratorValue) || !isZeroish(denominatorValue)) {
    return undefined;
  }

  const simplified = normalizeExactRationalNode(node, 'simplify');
  if (!simplified?.changed) {
    return undefined;
  }

  const value = evaluateNodeAt(simplified.normalizedNode, target, variable);
  return value === undefined
    ? undefined
    : { kind: 'success' as const, value, origin: 'rule-based-symbolic' as const };
}

function unboundedSampleSign(
  node: unknown,
  target: number,
  variable: string,
  direction: Exclude<LimitDirection, 'two-sided'>,
): 1 | -1 | undefined {
  const steps = [1e-2, 1e-3, 1e-4];
  const values = steps.map((step) =>
    evaluateNodeAt(node, direction === 'left' ? target - step : target + step, variable));

  if (values.some((value) => value === undefined || !Number.isFinite(value))) {
    return undefined;
  }

  const finiteValues = values as number[];
  const magnitudes = finiteValues.map((value) => Math.abs(value));
  const growsTowardTarget =
    magnitudes[2] >= 1e4
    && magnitudes[2] > magnitudes[1] * 1.5
    && magnitudes[1] > magnitudes[0] * 1.5;

  if (!growsTowardTarget) {
    return undefined;
  }

  return finiteValues[2] < 0 ? -1 : 1;
}

function isDividePoleCandidate(node: unknown, target: number, variable: string) {
  if (!isNodeArray(node) || node[0] !== 'Divide' || node.length !== 3) {
    return false;
  }

  const numeratorValue = evaluateNodeAt(node[1], target, variable);
  const denominatorValue = evaluateNodeAt(node[2], target, variable);
  return numeratorValue !== undefined
    && !isZeroish(numeratorValue)
    && isZeroish(denominatorValue);
}

function isNegativePowerPoleCandidate(node: unknown, target: number, variable: string) {
  if (!isNodeArray(node) || node[0] !== 'Power' || node.length !== 3 || !isNegativeInteger(node[2])) {
    return false;
  }

  return isZeroish(evaluateNodeAt(node[1], target, variable));
}

function resolveSignedPoleLimit(
  node: unknown,
  target: number,
  variable: string,
  direction: LimitDirection,
): { kind: 'success'; value: FiniteLimitRuleValue; origin: 'rule-based-symbolic' } | undefined {
  if (
    !isDividePoleCandidate(node, target, variable)
    && !isNegativePowerPoleCandidate(node, target, variable)
  ) {
    return undefined;
  }

  const leftSign = unboundedSampleSign(node, target, variable, 'left');
  const rightSign = unboundedSampleSign(node, target, variable, 'right');

  if (direction === 'left' && leftSign) {
    return {
      kind: 'success',
      value: leftSign > 0 ? 'posInfinity' : 'negInfinity',
      origin: 'rule-based-symbolic',
    };
  }

  if (direction === 'right' && rightSign) {
    return {
      kind: 'success',
      value: rightSign > 0 ? 'posInfinity' : 'negInfinity',
      origin: 'rule-based-symbolic',
    };
  }

  if (direction === 'two-sided' && leftSign && rightSign && leftSign === rightSign) {
    return {
      kind: 'success',
      value: leftSign > 0 ? 'posInfinity' : 'negInfinity',
      origin: 'rule-based-symbolic',
    };
  }

  return undefined;
}

function resolveLogBoundaryLimit(
  node: unknown,
  target: number,
  variable: string,
  direction: LimitDirection,
): { kind: 'success'; value: FiniteLimitRuleValue; origin: 'rule-based-symbolic' } | undefined {
  if (!isNodeArray(node) || (node[0] !== 'Ln' && node[0] !== 'Log') || node.length !== 2) {
    return undefined;
  }

  if (direction === 'two-sided') {
    return undefined;
  }

  const argumentValue = evaluateNodeAt(node[1], target, variable);
  if (!isZeroish(argumentValue)) {
    return undefined;
  }

  const steps = [1e-2, 1e-3, 1e-4];
  const argumentSamples = steps.map((step) =>
    evaluateNodeAt(node[1], direction === 'left' ? target - step : target + step, variable));
  if (argumentSamples.some((value) => value === undefined || value <= 0)) {
    return undefined;
  }

  const magnitudes = (argumentSamples as number[]).map((value) => Math.abs(value));
  if (!(magnitudes[2] < magnitudes[1] && magnitudes[1] < magnitudes[0])) {
    return undefined;
  }

  return {
    kind: 'success',
    value: 'negInfinity',
    origin: 'rule-based-symbolic',
  };
}

export function attemptLHospital(node: unknown, target: number, variable = 'x', remaining = 3): number | undefined {
  if (remaining <= 0 || !isNodeArray(node) || node[0] !== 'Divide' || node.length !== 3) {
    return undefined;
  }

  const numerator = node[1];
  const denominator = node[2];
  const numeratorValue = evaluateNodeAt(numerator, target, variable);
  const denominatorValue = evaluateNodeAt(denominator, target, variable);

  const zeroOverZero = isZeroish(numeratorValue) && isZeroish(denominatorValue);
  const infinityOverInfinity = isHuge(numeratorValue) && isHuge(denominatorValue);
  if (!zeroOverZero && !infinityOverInfinity) {
    return undefined;
  }

  const nextNode = ['Divide', differentiateAst(numerator, variable), differentiateAst(denominator, variable)];
  const evaluated = evaluateNodeAt(nextNode, target, variable);
  if (evaluated !== undefined) {
    return evaluated;
  }

  return attemptLHospital(nextNode, target, variable, remaining - 1);
}

export function resolveFiniteLimitRule(
  node: unknown,
  target: number,
  variable = 'x',
  direction: LimitDirection = 'two-sided',
) {
  try {
    const evaluated = box(node).subs({ [variable]: target }).evaluate();
    if (!evaluated.latex.includes('Undefined') && !evaluated.latex.includes('\\infty')) {
      const numeric = typeof evaluated.json === 'number' ? evaluated.json : latexToNumber((evaluated.N?.() ?? evaluated).latex);
      if (numeric !== undefined) {
        return { kind: 'success' as const, value: numeric, origin: 'symbolic' as const };
      }
    }
  } catch {
    // ignore direct substitution failures
  }

  const knownRule = resolveKnownFiniteLimitRule(node, target, variable);
  if (knownRule) {
    return knownRule;
  }

  const rationalHole = resolveRemovableRationalHole(node, target, variable);
  if (rationalHole) {
    return rationalHole;
  }

  const signedPole = resolveSignedPoleLimit(node, target, variable, direction);
  if (signedPole) {
    return signedPole;
  }

  const logBoundary = resolveLogBoundaryLimit(node, target, variable, direction);
  if (logBoundary) {
    return logBoundary;
  }

  const byLHospital = attemptLHospital(node, target, variable);
  if (byLHospital !== undefined) {
    return { kind: 'success' as const, value: byLHospital, origin: 'heuristic-symbolic' as const };
  }

  return { kind: 'unhandled' as const };
}
