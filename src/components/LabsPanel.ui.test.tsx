import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LabsPanel } from './LabsPanel';
import type { LabExperimentSummary } from '../lib/labs/catalog';

const experiments: LabExperimentSummary[] = [
  {
    experimentId: 'active-lab',
    title: 'Active Lab',
    laneTopic: 'symbolic-search',
    currentLevel: 'level-0-research',
    status: 'active',
    owner: 'unassigned',
    recordPath: 'playground/records/active-lab.md',
    manifestPath: 'playground/manifests/active-lab.yaml',
    lastReviewed: '2026-04-30',
    nextReview: '2026-05-07',
    candidateStableHome: 'future stable core',
    nextStep: 'Continue observing the active lab.',
  },
  {
    experimentId: 'promoted-lab',
    title: 'Promoted Lab',
    laneTopic: 'external-compute',
    currentLevel: 'level-2-bounded-prototypes',
    status: 'promoted',
    owner: 'unassigned',
    recordPath: 'playground/records/promoted-lab.md',
    manifestPath: 'playground/manifests/promoted-lab.yaml',
    lastReviewed: '2026-04-30',
    nextReview: 'closed',
    candidateStableHome: 'future adapter',
    nextStep: 'Keep the promotion record.',
  },
  {
    experimentId: 'paused-lab',
    title: 'Paused Lab',
    laneTopic: 'external-compute',
    currentLevel: 'level-3-integration-candidates',
    status: 'paused',
    owner: 'unassigned',
    recordPath: 'playground/records/paused-lab.md',
    manifestPath: 'playground/manifests/paused-lab.yaml',
    lastReviewed: '2026-04-30',
    nextReview: 'deferred',
    candidateStableHome: 'future adapter',
    nextStep: 'Wait for core stability.',
  },
];

describe('LabsPanel', () => {
  it('renders active, promoted, and paused experiment states without execution controls', async () => {
    const user = userEvent.setup();
    render(<LabsPanel experiments={experiments} />);

    expect(screen.getByTestId('labs-panel')).toHaveTextContent('Developer only');
    expect(screen.getByTestId('labs-panel')).toHaveTextContent('Read-only catalog');
    expect(screen.getByTestId('labs-panel')).toHaveTextContent('does not execute experiments');
    expect(screen.queryByRole('button', { name: /run/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remote/i })).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: /active lab/i })).toHaveTextContent('Active');
    expect(screen.getByRole('button', { name: /promoted lab/i })).toHaveTextContent('Promoted');
    expect(screen.getByRole('button', { name: /paused lab/i })).toHaveTextContent('Paused');
    expect(screen.getByRole('button', { name: /active lab/i }).querySelector('.launcher-entry-hotkey')).toBeNull();
    expect(screen.getByRole('button', { name: /active lab/i }).querySelector('.labs-status-chip')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /paused lab/i }));

    expect(screen.getByTestId('labs-detail')).toHaveTextContent('Paused Lab');
    expect(screen.getByTestId('labs-detail')).toHaveTextContent('Level 3 Integration Candidate');
    expect(screen.getByTestId('labs-detail')).toHaveTextContent('playground/records/paused-lab.md');
    expect(screen.getByTestId('labs-detail')).toHaveTextContent('Wait for core stability.');
  });
});
