import { readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  parseExternalComputeArtifactManifest,
  parseExternalComputeJobSpec,
  parseExternalComputeRunnerProfile,
} from './contracts';
import {
  DEFAULT_EXTERNAL_COMPUTE_ARTIFACT_ROOT,
  executeExternalComputeJob,
} from './run-job';
import { createExternalComputeWorkloadRegistry } from './workloads';

async function readJsonFile(filePath: string) {
  const contents = await readFile(filePath, 'utf8');
  return JSON.parse(contents) as unknown;
}

describe('external compute foundations lab', () => {
  it('parses the checked-in runner profile and job spec templates', async () => {
    const runnerProfileTemplate = await readJsonFile(
      path.resolve(
        process.cwd(),
        'playground/level-0-research/external-compute/profiles/runner-profile.template.json',
      ),
    );
    const jobSpecTemplate = await readJsonFile(
      path.resolve(
        process.cwd(),
        'playground/level-0-research/external-compute/jobs/job-spec.template.json',
      ),
    );

    const parsedRunnerProfile = parseExternalComputeRunnerProfile(runnerProfileTemplate);
    const parsedJobSpec = parseExternalComputeJobSpec(jobSpecTemplate);

    expect(parsedRunnerProfile.runnerKind).toBe('ssh');
    expect(parsedRunnerProfile.ssh.hostAlias).toContain('replace-with-your-ssh-config-alias');
    expect(parsedJobSpec.workloadId).toBe('sym-search-planner-ordering');
    expect(parsedJobSpec.runnerKind).toBe('local');
  });

  it('rejects duplicate workload ids', () => {
    expect(() => createExternalComputeWorkloadRegistry([
      {
        workloadId: 'duplicate-workload',
        title: 'A',
        laneTopic: 'test',
        executeLocal: () => ({ summary: { ok: true } }),
      },
      {
        workloadId: 'duplicate-workload',
        title: 'B',
        laneTopic: 'test',
        executeLocal: () => ({ summary: { ok: true } }),
      },
    ])).toThrow('Duplicate external-compute workload id: duplicate-workload');
  });

  it('rejects unknown workload ids during execution', async () => {
    const runnerProfile = parseExternalComputeRunnerProfile({
      profileId: 'local-foundations-template',
      runnerKind: 'local',
      description: 'Local foundations runner for PGL4.',
      budgets: {
        maxRuntimeSeconds: 120,
      },
      local: {},
    });
    const jobSpec = parseExternalComputeJobSpec({
      jobId: 'unknown-workload-proof',
      workloadId: 'missing-workload',
      runnerKind: 'local',
      profileId: 'local-foundations-template',
      input: {},
    });

    await expect(executeExternalComputeJob(jobSpec, runnerProfile)).rejects.toThrow(
      'Unknown external-compute workload id: missing-workload',
    );
  });

  it('executes the registered symbolic-search workload locally and writes structured artifacts', { timeout: 20_000 }, async () => {
    const artifactRoot = path.resolve(process.cwd(), DEFAULT_EXTERNAL_COMPUTE_ARTIFACT_ROOT);
    const jobId = 'sym-search-planner-ordering-local-proof';
    const jobDirectory = path.join(artifactRoot, jobId);

    await rm(jobDirectory, { recursive: true, force: true });

    const runnerProfile = parseExternalComputeRunnerProfile({
      profileId: 'local-foundations-template',
      runnerKind: 'local',
      description: 'Local foundations runner for PGL4.',
      budgets: {
        maxRuntimeSeconds: 120,
      },
      local: {},
    });
    const jobSpec = parseExternalComputeJobSpec({
      jobId,
      workloadId: 'sym-search-planner-ordering',
      runnerKind: 'local',
      profileId: 'local-foundations-template',
      input: {},
    });

    const result = await executeExternalComputeJob(jobSpec, runnerProfile);
    const manifest = parseExternalComputeArtifactManifest(await readJsonFile(result.manifestPath));
    const summary = await readJsonFile(result.summaryPath);

    expect(manifest.status).toBe('completed');
    expect(manifest.outputPaths).toContain(result.summaryPath);
    expect(summary).toMatchObject({
      jobId,
      workloadId: 'sym-search-planner-ordering',
      runnerKind: 'local',
      status: 'completed',
    });
    expect(summary).toHaveProperty('summary.orderings.recursive-first.summary');
    expect(summary).toHaveProperty('summary.orderings.trig-rewrite-first.summary');
    await expect(stat(result.manifestPath)).resolves.toBeDefined();
    await expect(stat(result.summaryPath)).resolves.toBeDefined();
  });

  it('treats ssh execution as foundations-only and non-executable in PGL4', async () => {
    const jobId = 'sym-search-planner-ordering-ssh-foundation';
    const runnerProfile = parseExternalComputeRunnerProfile({
      profileId: 'ssh-foundations-template',
      runnerKind: 'ssh',
      description: 'Future SSH-backed profile for PGL4.',
      budgets: {
        maxRuntimeSeconds: 1800,
      },
      ssh: {
        hostAlias: 'foundation-alias',
        remoteWorkspaceRoot: '~/calcwiz-playground',
        remoteShell: 'bash',
      },
    });
    const jobSpec = parseExternalComputeJobSpec({
      jobId,
      workloadId: 'sym-search-planner-ordering',
      runnerKind: 'ssh',
      profileId: 'ssh-foundations-template',
      input: {},
    });

    const result = await executeExternalComputeJob(jobSpec, runnerProfile);
    const manifest = parseExternalComputeArtifactManifest(await readJsonFile(result.manifestPath));
    const summary = await readJsonFile(result.summaryPath);

    expect(manifest.status).toBe('not-implemented');
    expect(manifest.note).toContain('SSH execution is intentionally not implemented yet');
    expect(summary).toMatchObject({
      jobId,
      workloadId: 'sym-search-planner-ordering',
      runnerKind: 'ssh',
      status: 'not-implemented',
    });
    expect(summary).not.toHaveProperty('summary.orderings');
  });
});
