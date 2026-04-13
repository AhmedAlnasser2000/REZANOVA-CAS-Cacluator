import {
  runGuardedEquationSolve,
  runGuardedEquationSolveWithStageOrder,
} from '../../../src/lib/equation/guarded-solve';
import { type DisplayOutcome } from '../../../src/types/calculator/display-types';
import {
  SYMBOLIC_SEARCH_CORPUS,
  type SymbolicSearchCorpusCase,
} from './corpus';
import { classifyOutcomeDelta, isCleanerBoundedPathWin } from './classification';
import { PLANNER_ORDERINGS, type PlannerOrderingName } from './planner-orders';

const BASE_REQUEST = {
  originalLatex: '',
  resolvedLatex: '',
  angleUnit: 'deg' as const,
  outputStyle: 'both' as const,
  ansLatex: '0',
};

export type SymbolicSearchOrderingSummary = {
  classificationCounts: Record<string, number>;
  cleanerBoundedPathWins: number;
  exactImprovements: string[];
  regressions: string[];
};

export type SymbolicSearchOrderingComparison = {
  caseId: string;
  equationLatex: string;
  tags: SymbolicSearchCorpusCase['tags'];
  baselineWinningStage: string | null;
  alternateWinningStage: string | null;
  baselineAttemptCount: number;
  alternateAttemptCount: number;
  classification: string;
};

export type SymbolicSearchBaselineParityMismatch = {
  caseId: string;
  stableKind: DisplayOutcome['kind'];
  replayKind: DisplayOutcome['kind'];
  stableExactLatex: string | null;
  replayExactLatex: string | null;
  stableSolveSummaryText: string | null;
  replaySolveSummaryText: string | null;
};

export type SymbolicSearchExperimentResult = {
  corpusSize: number;
  baselineParityMismatches: SymbolicSearchBaselineParityMismatch[];
  orderings: Record<
    Exclude<PlannerOrderingName, 'baseline-default'>,
    {
      summary: SymbolicSearchOrderingSummary;
      comparisons: SymbolicSearchOrderingComparison[];
    }
  >;
};

function createRequest(equationLatex: string) {
  return {
    ...BASE_REQUEST,
    originalLatex: equationLatex,
    resolvedLatex: equationLatex,
  };
}

function detectBaselineParityMismatch(
  corpusCase: SymbolicSearchCorpusCase,
  stableOutcome: DisplayOutcome,
  replayOutcome: DisplayOutcome,
): SymbolicSearchBaselineParityMismatch | null {
  if (stableOutcome.kind !== replayOutcome.kind) {
    return {
      caseId: corpusCase.id,
      stableKind: stableOutcome.kind,
      replayKind: replayOutcome.kind,
      stableExactLatex: stableOutcome.exactLatex ?? null,
      replayExactLatex: replayOutcome.exactLatex ?? null,
      stableSolveSummaryText: stableOutcome.solveSummaryText ?? null,
      replaySolveSummaryText: replayOutcome.solveSummaryText ?? null,
    };
  }

  if (stableOutcome.kind !== 'prompt' && replayOutcome.kind !== 'prompt') {
    const stableExactLatex = stableOutcome.exactLatex ?? null;
    const replayExactLatex = replayOutcome.exactLatex ?? null;
    const stableSolveSummaryText = stableOutcome.solveSummaryText ?? null;
    const replaySolveSummaryText = replayOutcome.solveSummaryText ?? null;

    if (
      stableExactLatex !== replayExactLatex
      || stableSolveSummaryText !== replaySolveSummaryText
    ) {
      return {
        caseId: corpusCase.id,
        stableKind: stableOutcome.kind,
        replayKind: replayOutcome.kind,
        stableExactLatex,
        replayExactLatex,
        stableSolveSummaryText,
        replaySolveSummaryText,
      };
    }
  }

  return null;
}

function summarizeOrdering(
  cases: SymbolicSearchCorpusCase[],
  orderingName: Exclude<PlannerOrderingName, 'baseline-default'>,
  baselineParityMismatches: SymbolicSearchBaselineParityMismatch[],
) {
  const summary: SymbolicSearchOrderingSummary = {
    classificationCounts: {
      same_effective_outcome: 0,
      exact_improvement: 0,
      exact_regression: 0,
      preference_regression: 0,
      honesty_regression: 0,
      trace_only_difference: 0,
    },
    cleanerBoundedPathWins: 0,
    exactImprovements: [],
    regressions: [],
  };

  const comparisons = cases.map((corpusCase) => {
    const request = createRequest(corpusCase.equationLatex);
    const stableOutcome = runGuardedEquationSolve(request);
    const baselineReplay = runGuardedEquationSolveWithStageOrder(
      request,
      PLANNER_ORDERINGS['baseline-default'],
    );
    const alternateReplay = runGuardedEquationSolveWithStageOrder(
      request,
      PLANNER_ORDERINGS[orderingName],
    );

    const baselineMismatch = detectBaselineParityMismatch(
      corpusCase,
      stableOutcome,
      baselineReplay.outcome,
    );
    if (baselineMismatch) {
      baselineParityMismatches.push(baselineMismatch);
    }

    const classification = classifyOutcomeDelta(
      baselineReplay.outcome,
      alternateReplay.outcome,
      baselineReplay.trace,
      alternateReplay.trace,
    );

    summary.classificationCounts[classification] += 1;
    if (classification === 'exact_improvement') {
      summary.exactImprovements.push(corpusCase.id);
    }
    if (
      classification === 'exact_regression'
      || classification === 'preference_regression'
      || classification === 'honesty_regression'
    ) {
      summary.regressions.push(`${corpusCase.id}:${classification}`);
    }
    if (isCleanerBoundedPathWin(baselineReplay.trace, alternateReplay.trace, classification)) {
      summary.cleanerBoundedPathWins += 1;
    }

    return {
      caseId: corpusCase.id,
      equationLatex: corpusCase.equationLatex,
      tags: corpusCase.tags,
      baselineWinningStage: baselineReplay.trace.winningStageId ?? null,
      alternateWinningStage: alternateReplay.trace.winningStageId ?? null,
      baselineAttemptCount: baselineReplay.trace.attempts.length,
      alternateAttemptCount: alternateReplay.trace.attempts.length,
      classification,
    };
  });

  return { summary, comparisons };
}

export function runSymbolicSearchPlannerOrderingExperiment(
  cases: SymbolicSearchCorpusCase[] = SYMBOLIC_SEARCH_CORPUS,
): SymbolicSearchExperimentResult {
  const baselineParityMismatches: SymbolicSearchBaselineParityMismatch[] = [];

  return {
    corpusSize: cases.length,
    baselineParityMismatches,
    orderings: {
      'recursive-first': summarizeOrdering(
        cases,
        'recursive-first',
        baselineParityMismatches,
      ),
      'trig-rewrite-first': summarizeOrdering(
        cases,
        'trig-rewrite-first',
        baselineParityMismatches,
      ),
    },
  };
}
