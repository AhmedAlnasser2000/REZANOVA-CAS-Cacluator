import { describe, expect, it } from 'vitest';
import {
  runGuardedEquationSolve,
  runGuardedEquationSolveWithStageOrder,
} from '../../../src/lib/equation/guarded-solve';
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

type OrderingSummary = {
  classificationCounts: Record<string, number>;
  cleanerBoundedPathWins: number;
  exactImprovements: string[];
  regressions: string[];
};

function createRequest(equationLatex: string) {
  return {
    ...BASE_REQUEST,
    originalLatex: equationLatex,
    resolvedLatex: equationLatex,
  };
}

function summarizeOrdering(
  cases: SymbolicSearchCorpusCase[],
  orderingName: Exclude<PlannerOrderingName, 'baseline-default'>,
) {
  const summary: OrderingSummary = {
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

    expect(baselineReplay.outcome.kind).toBe(stableOutcome.kind);
    if (stableOutcome.kind !== 'prompt' && baselineReplay.outcome.kind !== 'prompt') {
      expect(baselineReplay.outcome.exactLatex ?? null).toBe(stableOutcome.exactLatex ?? null);
      expect(baselineReplay.outcome.solveSummaryText ?? null).toBe(stableOutcome.solveSummaryText ?? null);
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

describe('sym-search planner ordering lab', () => {
  it('keeps the fixed corpus at twelve tracked cases', () => {
    expect(SYMBOLIC_SEARCH_CORPUS).toHaveLength(12);
  });

  it('runs the symbolic-search corpus against the recursive-first and trig-rewrite-first orderings', { timeout: 20_000 }, () => {
    const recursiveFirst = summarizeOrdering(SYMBOLIC_SEARCH_CORPUS, 'recursive-first');
    const trigRewriteFirst = summarizeOrdering(SYMBOLIC_SEARCH_CORPUS, 'trig-rewrite-first');

    expect(recursiveFirst.comparisons).toHaveLength(SYMBOLIC_SEARCH_CORPUS.length);
    expect(trigRewriteFirst.comparisons).toHaveLength(SYMBOLIC_SEARCH_CORPUS.length);
    expect(
      recursiveFirst.comparisons.every((comparison) => comparison.classification.length > 0),
    ).toBe(true);
    expect(
      trigRewriteFirst.comparisons.every((comparison) => comparison.classification.length > 0),
    ).toBe(true);

    console.info(
      JSON.stringify(
        {
          recursiveFirst: recursiveFirst.summary,
          trigRewriteFirst: trigRewriteFirst.summary,
          recursiveFirstComparisons: recursiveFirst.comparisons,
          trigRewriteFirstComparisons: trigRewriteFirst.comparisons,
        },
        null,
        2,
      ),
    );
  });
});
