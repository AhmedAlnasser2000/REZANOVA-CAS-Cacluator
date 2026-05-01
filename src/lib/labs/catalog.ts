import { LABS_EXPERIMENTS } from './generated-catalog';
import type { LabExperimentLevel, LabExperimentStatus, LabExperimentSummary } from './types';

export { LABS_CATALOG_DIGEST, LABS_CATALOG_SOURCE, LABS_EXPERIMENTS } from './generated-catalog';
export type { LabExperimentLevel, LabExperimentStatus, LabExperimentSummary } from './types';

export const LAB_STATUS_LABELS: Record<LabExperimentStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  promoted: 'Promoted',
  retired: 'Retired',
};

export const LAB_LEVEL_LABELS: Record<LabExperimentLevel, string> = {
  'level-0-research': 'Level 0 Research',
  'level-1-feasibility': 'Level 1 Feasibility',
  'level-2-bounded-prototypes': 'Level 2 Bounded Prototype',
  'level-3-integration-candidates': 'Level 3 Integration Candidate',
};

export function getLabsCatalog() {
  return LABS_EXPERIMENTS;
}

export function getLabExperimentById(experimentId: string): LabExperimentSummary | undefined {
  return LABS_EXPERIMENTS.find((experiment) => experiment.experimentId === experimentId);
}

export function groupLabsByStatus(experiments: readonly LabExperimentSummary[] = LABS_EXPERIMENTS) {
  return experiments.reduce<Record<LabExperimentStatus, LabExperimentSummary[]>>(
    (groups, experiment) => {
      groups[experiment.status].push(experiment);
      return groups;
    },
    {
      draft: [],
      active: [],
      paused: [],
      promoted: [],
      retired: [],
    },
  );
}
