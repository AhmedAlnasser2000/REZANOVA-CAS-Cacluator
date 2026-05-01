import { useMemo, useState } from 'react';
import {
  LAB_LEVEL_LABELS,
  LAB_STATUS_LABELS,
  LABS_CATALOG_DIGEST,
  LABS_EXPERIMENTS,
  type LabExperimentSummary,
} from '../lib/labs/catalog';

type LabsPanelProps = {
  experiments?: readonly LabExperimentSummary[];
};

export function LabsPanel({ experiments = LABS_EXPERIMENTS }: LabsPanelProps) {
  const [selectedExperimentId, setSelectedExperimentId] = useState(experiments[0]?.experimentId ?? '');
  const selectedExperiment = useMemo(
    () =>
      experiments.find((experiment) => experiment.experimentId === selectedExperimentId)
      ?? experiments[0],
    [experiments, selectedExperimentId],
  );

  return (
    <section className="mode-panel labs-panel" data-testid="labs-panel">
      <div className="equation-panel-header labs-panel-header">
        <div className="equation-panel-copy">
          <div className="equation-breadcrumbs">
            <span className="equation-breadcrumb">Incubation</span>
            <span className="equation-breadcrumb">Labs</span>
          </div>
          <div className="card-title-row">
            <strong>Labs</strong>
            <span className="labs-chip labs-chip--neutral">Developer only</span>
            <span className="labs-chip labs-chip--gold">Read-only catalog</span>
          </div>
          <p className="equation-hint">
            This view reads a committed catalog snapshot generated from Playground records. It does not execute experiments or make Playground product behavior.
          </p>
        </div>
      </div>

      <div className="editor-card labs-boundary-card">
        <div className="card-title-row">
          <strong>Boundary</strong>
          <span className="labs-chip labs-chip--neutral">One-way</span>
        </div>
        <p className="equation-hint">
          Stable app code imports only `src/lib/labs/*`. Paths below are inert text links for humans; the calculator does not import, run, or delegate to `playground/`.
        </p>
        <p className="equation-hint">Catalog digest: {LABS_CATALOG_DIGEST.slice(0, 12)}</p>
      </div>

      <div className="labs-layout">
        <div className="launcher-list labs-list" aria-label="Lab experiments">
          {experiments.map((experiment) => (
            <button
              key={experiment.experimentId}
              type="button"
              className={`launcher-entry labs-entry ${
                experiment.experimentId === selectedExperiment?.experimentId ? 'is-selected' : ''
              }`}
              onClick={() => setSelectedExperimentId(experiment.experimentId)}
            >
              <span className="labs-entry-content">
                <strong>{experiment.title}</strong>
                <small>{experiment.experimentId}</small>
              </span>
              <span className={`labs-status-chip labs-status-chip--${experiment.status}`}>
                {LAB_STATUS_LABELS[experiment.status]}
              </span>
            </button>
          ))}
        </div>

        {selectedExperiment ? (
          <article className="editor-card labs-detail-card" data-testid="labs-detail">
            <div className="card-title-row">
              <strong className="labs-detail-title">{selectedExperiment.title}</strong>
              <span className={`labs-status-chip labs-status-chip--${selectedExperiment.status}`}>
                {LAB_STATUS_LABELS[selectedExperiment.status]}
              </span>
              <span className="labs-level-chip">{LAB_LEVEL_LABELS[selectedExperiment.currentLevel]}</span>
            </div>
            <dl className="labs-fact-grid">
              <div>
                <dt>Experiment ID</dt>
                <dd>{selectedExperiment.experimentId}</dd>
              </div>
              <div>
                <dt>Lane</dt>
                <dd>{selectedExperiment.laneTopic}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{selectedExperiment.owner}</dd>
              </div>
              <div>
                <dt>Last Review</dt>
                <dd>{selectedExperiment.lastReviewed}</dd>
              </div>
              <div>
                <dt>Next Review</dt>
                <dd>{selectedExperiment.nextReview}</dd>
              </div>
              <div>
                <dt>Candidate Stable Home</dt>
                <dd>{selectedExperiment.candidateStableHome}</dd>
              </div>
              <div>
                <dt>Record Path</dt>
                <dd>{selectedExperiment.recordPath}</dd>
              </div>
              <div>
                <dt>Manifest Path</dt>
                <dd>{selectedExperiment.manifestPath}</dd>
              </div>
            </dl>
            <div className="labs-next-step">
              <strong>Next Step</strong>
              <p>{selectedExperiment.nextStep}</p>
            </div>
          </article>
        ) : (
          <div className="editor-card labs-detail-card" data-testid="labs-detail-empty">
            <strong>No lab experiments in the generated catalog.</strong>
          </div>
        )}
      </div>
    </section>
  );
}
