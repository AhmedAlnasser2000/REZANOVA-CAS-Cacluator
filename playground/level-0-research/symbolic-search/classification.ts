import type { DisplayOutcome } from '../../../src/types/calculator/display-types';
import type { GuardedEquationStageReplayTrace } from '../../../src/lib/equation/guarded/run';

export type OutcomeDeltaClassification =
  | 'same_effective_outcome'
  | 'exact_improvement'
  | 'exact_regression'
  | 'preference_regression'
  | 'honesty_regression'
  | 'trace_only_difference';

type ExactnessClass = 'exact' | 'guided';
type ExactPreferenceClass = 'explicit-or-direct-exact' | 'reduced-carrier-exact' | 'not-exact';

type ComparableOutcomeProfile = {
  kind: DisplayOutcome['kind'];
  exactnessClass: ExactnessClass;
  exactPreferenceClass: ExactPreferenceClass;
  hasStructuredGuidance: boolean;
  hasPeriodicContext: boolean;
  suggestedIntervalCount: number;
};

function isExactOutcome(outcome: DisplayOutcome): boolean {
  return outcome.kind === 'success' && Boolean(outcome.exactLatex);
}

function isReducedCarrierExact(outcome: DisplayOutcome): boolean {
  if (outcome.kind !== 'success' || !outcome.exactLatex || !outcome.periodicFamily?.reducedCarrierLatex) {
    return false;
  }

  return outcome.exactLatex.includes(outcome.periodicFamily.reducedCarrierLatex);
}

function toComparableOutcomeProfile(outcome: DisplayOutcome): ComparableOutcomeProfile {
  const hasStructuredGuidance = outcome.kind === 'error'
    && (
      Boolean(outcome.solveSummaryText)
      || Boolean(outcome.periodicFamily)
      || (outcome.detailSections?.length ?? 0) > 0
      || (outcome.exactSupplementLatex?.length ?? 0) > 0
    );

  return {
    kind: outcome.kind,
    exactnessClass: isExactOutcome(outcome) ? 'exact' : 'guided',
    exactPreferenceClass: isExactOutcome(outcome)
      ? (isReducedCarrierExact(outcome) ? 'reduced-carrier-exact' : 'explicit-or-direct-exact')
      : 'not-exact',
    hasStructuredGuidance,
    hasPeriodicContext: Boolean(outcome.periodicFamily),
    suggestedIntervalCount: outcome.periodicFamily?.suggestedIntervals?.length ?? 0,
  };
}

function tracesDiffer(
  baseline: GuardedEquationStageReplayTrace,
  alternate: GuardedEquationStageReplayTrace,
): boolean {
  return baseline.winningStageId !== alternate.winningStageId
    || JSON.stringify(baseline.attempts) !== JSON.stringify(alternate.attempts);
}

function sameEffectiveOutcome(
  baseline: ComparableOutcomeProfile,
  alternate: ComparableOutcomeProfile,
): boolean {
  return baseline.kind === alternate.kind
    && baseline.exactnessClass === alternate.exactnessClass
    && baseline.exactPreferenceClass === alternate.exactPreferenceClass;
}

function losesStructuredGuidance(
  baseline: ComparableOutcomeProfile,
  alternate: ComparableOutcomeProfile,
): boolean {
  if (!baseline.hasStructuredGuidance) {
    return false;
  }

  return !alternate.hasStructuredGuidance
    || (baseline.hasPeriodicContext && !alternate.hasPeriodicContext)
    || (baseline.suggestedIntervalCount > 0 && alternate.suggestedIntervalCount === 0);
}

export function classifyOutcomeDelta(
  baselineOutcome: DisplayOutcome,
  alternateOutcome: DisplayOutcome,
  baselineTrace: GuardedEquationStageReplayTrace,
  alternateTrace: GuardedEquationStageReplayTrace,
): OutcomeDeltaClassification {
  const baseline = toComparableOutcomeProfile(baselineOutcome);
  const alternate = toComparableOutcomeProfile(alternateOutcome);

  if (
    baseline.exactnessClass === 'exact'
    && baseline.exactPreferenceClass === 'explicit-or-direct-exact'
    && alternate.exactnessClass === 'exact'
    && alternate.exactPreferenceClass === 'reduced-carrier-exact'
  ) {
    return 'preference_regression';
  }

  if (
    baseline.exactnessClass === 'guided'
    && alternate.exactnessClass === 'guided'
    && losesStructuredGuidance(baseline, alternate)
  ) {
    return 'honesty_regression';
  }

  if (baseline.exactnessClass === 'exact' && alternate.exactnessClass !== 'exact') {
    return 'exact_regression';
  }

  if (baseline.exactnessClass !== 'exact' && alternate.exactnessClass === 'exact') {
    return 'exact_improvement';
  }

  if (sameEffectiveOutcome(baseline, alternate)) {
    return tracesDiffer(baselineTrace, alternateTrace)
      ? 'trace_only_difference'
      : 'same_effective_outcome';
  }

  return 'trace_only_difference';
}

export function isCleanerBoundedPathWin(
  baselineTrace: GuardedEquationStageReplayTrace,
  alternateTrace: GuardedEquationStageReplayTrace,
  classification: OutcomeDeltaClassification,
): boolean {
  return classification === 'trace_only_difference'
    && alternateTrace.attempts.length + 1 < baselineTrace.attempts.length;
}
