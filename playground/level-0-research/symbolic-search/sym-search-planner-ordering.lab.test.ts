import { describe, expect, it } from 'vitest';
import { SYMBOLIC_SEARCH_CORPUS } from './corpus';
import { runSymbolicSearchPlannerOrderingExperiment } from './run-experiment';

describe('sym-search planner ordering lab', () => {
  it('keeps the fixed corpus at twelve tracked cases', () => {
    expect(SYMBOLIC_SEARCH_CORPUS).toHaveLength(12);
  });

  it('runs the symbolic-search corpus against the recursive-first and trig-rewrite-first orderings', { timeout: 20_000 }, () => {
    const experiment = runSymbolicSearchPlannerOrderingExperiment(SYMBOLIC_SEARCH_CORPUS);
    const recursiveFirst = experiment.orderings['recursive-first'];
    const trigRewriteFirst = experiment.orderings['trig-rewrite-first'];

    expect(experiment.baselineParityMismatches).toHaveLength(0);
    expect(recursiveFirst.comparisons).toHaveLength(experiment.corpusSize);
    expect(trigRewriteFirst.comparisons).toHaveLength(experiment.corpusSize);
    expect(
      recursiveFirst.comparisons.every((comparison) => comparison.classification.length > 0),
    ).toBe(true);
    expect(
      trigRewriteFirst.comparisons.every((comparison) => comparison.classification.length > 0),
    ).toBe(true);

    console.info(
      JSON.stringify(
        {
          baselineParityMismatches: experiment.baselineParityMismatches,
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
