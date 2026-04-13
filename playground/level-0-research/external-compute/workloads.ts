import { runSymbolicSearchPlannerOrderingExperiment } from '../symbolic-search/run-experiment';

export type ExternalComputeWorkloadResult = {
  summary: unknown;
  note?: string;
};

export type ExternalComputeWorkloadRegistration = {
  workloadId: string;
  title: string;
  laneTopic: string;
  executeLocal: (input: Record<string, unknown>) => Promise<ExternalComputeWorkloadResult> | ExternalComputeWorkloadResult;
};

export function createExternalComputeWorkloadRegistry(
  registrations: ExternalComputeWorkloadRegistration[],
): Map<string, ExternalComputeWorkloadRegistration> {
  const registry = new Map<string, ExternalComputeWorkloadRegistration>();

  for (const registration of registrations) {
    if (registry.has(registration.workloadId)) {
      throw new Error(`Duplicate external-compute workload id: ${registration.workloadId}`);
    }
    registry.set(registration.workloadId, registration);
  }

  return registry;
}

export const EXTERNAL_COMPUTE_WORKLOAD_REGISTRY = createExternalComputeWorkloadRegistry([
  {
    workloadId: 'sym-search-planner-ordering',
    title: 'Symbolic Search Planner Ordering and Heuristic Ranking',
    laneTopic: 'symbolic-search',
    executeLocal: () => ({
      summary: runSymbolicSearchPlannerOrderingExperiment(),
      note: 'Executed through the PGL4 local harness using the existing PGL3 symbolic-search workload.',
    }),
  },
]);
