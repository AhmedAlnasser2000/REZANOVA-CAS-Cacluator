import { describe, expect, it } from 'vitest';
import {
  getLabExperimentById,
  getLabsCatalog,
  groupLabsByStatus,
  LAB_LEVEL_LABELS,
  LABS_CATALOG_SOURCE,
  LAB_STATUS_LABELS,
} from './catalog';

describe('Labs catalog snapshot', () => {
  it('exposes the current Playground experiment states as stable metadata', () => {
    const catalog = getLabsCatalog();
    const statuses = new Set(catalog.map((experiment) => experiment.status));

    expect(catalog.length).toBeGreaterThan(0);
    expect(statuses.has('active')).toBe(true);
    expect(statuses.has('promoted')).toBe(true);
    expect(statuses.has('paused')).toBe(true);
    expect(getLabExperimentById('sym-search-planner-ordering')?.status).toBe('active');
  });

  it('groups experiments by status for the read-only Labs UI', () => {
    const grouped = groupLabsByStatus();

    expect(grouped.active.map((experiment) => experiment.experimentId)).toContain('sym-search-planner-ordering');
    expect(grouped.promoted.map((experiment) => experiment.experimentId)).toContain('ext-compute-ssh-foundations');
    expect(grouped.paused.map((experiment) => experiment.experimentId)).toContain('ext-compute-ssh-vm-hardening');
  });

  it('has user-facing labels for every shipped status and level', () => {
    for (const experiment of getLabsCatalog()) {
      expect(LAB_STATUS_LABELS[experiment.status]).toBeTruthy();
      expect(LAB_LEVEL_LABELS[experiment.currentLevel]).toBeTruthy();
    }
  });

  it('exposes Playground paths as inert catalog text only', () => {
    expect(LABS_CATALOG_SOURCE).toBe('playground/manifests/*.yaml + playground/records/INDEX.md');
    for (const experiment of getLabsCatalog()) {
      expect(experiment.recordPath.startsWith('playground/records/')).toBe(true);
      expect(experiment.manifestPath.startsWith('playground/manifests/')).toBe(true);
    }
  });
});
