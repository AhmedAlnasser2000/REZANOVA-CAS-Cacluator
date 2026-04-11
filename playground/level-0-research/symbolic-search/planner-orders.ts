import {
  listGuardedEquationStageDescriptors,
  type GuardedEquationStageId,
} from '../../../src/lib/equation/guarded/run';

export type PlannerOrderingName =
  | 'baseline-default'
  | 'recursive-first'
  | 'trig-rewrite-first';

export function getBaselineDefaultOrder(): GuardedEquationStageId[] {
  return listGuardedEquationStageDescriptors().map((stage) => stage.id);
}

export const PLANNER_ORDERINGS: Record<PlannerOrderingName, GuardedEquationStageId[]> = {
  'baseline-default': getBaselineDefaultOrder(),
  'recursive-first': [
    'numeric-interval',
    'bounded-polynomial',
    'composition',
    'algebra-transform',
    'substitution',
    'direct-trig',
    'rewrite-trig',
    'direct-symbolic',
  ],
  'trig-rewrite-first': [
    'numeric-interval',
    'bounded-polynomial',
    'direct-trig',
    'rewrite-trig',
    'composition',
    'algebra-transform',
    'substitution',
    'direct-symbolic',
  ],
};
