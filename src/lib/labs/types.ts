export type LabExperimentStatus = 'draft' | 'active' | 'paused' | 'promoted' | 'retired';

export type LabExperimentLevel =
  | 'level-0-research'
  | 'level-1-feasibility'
  | 'level-2-bounded-prototypes'
  | 'level-3-integration-candidates';

export type LabExperimentSummary = {
  experimentId: string;
  title: string;
  laneTopic: string;
  currentLevel: LabExperimentLevel;
  status: LabExperimentStatus;
  owner: string;
  recordPath: string;
  manifestPath: string;
  lastReviewed: string;
  nextReview: string;
  candidateStableHome: string;
  nextStep: string;
};
