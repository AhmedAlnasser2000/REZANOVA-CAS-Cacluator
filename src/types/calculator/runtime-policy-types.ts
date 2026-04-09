export type RuntimeStopReasonKind =
  | 'invalid-request'
  | 'planner-hard-stop'
  | 'range-guard'
  | 'unsupported-family';

export type RuntimeStopReason = {
  kind: RuntimeStopReasonKind;
  source: 'planner' | 'host' | 'stage';
};

export type EquationNumericSolveAdvisory =
  | { kind: 'blocked'; reason: 'range-guard' | 'invalid-request' }
  | { kind: 'manual-only' }
  | { kind: 'suggest-on-error' };

export type RuntimeAdvisories = {
  stopReason?: RuntimeStopReason;
  equationNumericSolve?: EquationNumericSolveAdvisory;
};
