import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  type ExternalComputeArtifactManifest,
  type ExternalComputeJobSpec,
  type ExternalComputeRunnerProfile,
} from './contracts';
import {
  EXTERNAL_COMPUTE_WORKLOAD_REGISTRY,
  type ExternalComputeWorkloadRegistration,
} from './workloads';

export const DEFAULT_EXTERNAL_COMPUTE_ARTIFACT_ROOT = '.task_tmp/pgl4-external-compute';

export type ExternalComputeExecutionResult = {
  manifest: ExternalComputeArtifactManifest;
  manifestPath: string;
  summaryPath: string;
};

type ExecuteExternalComputeJobOptions = {
  artifactRoot?: string;
  workloadRegistry?: Map<string, ExternalComputeWorkloadRegistration>;
};

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function resolveArtifactRoot(
  runnerProfile: ExternalComputeRunnerProfile,
  artifactRoot?: string,
): string {
  if (artifactRoot) {
    return path.resolve(process.cwd(), artifactRoot);
  }

  if (runnerProfile.runnerKind === 'local' && runnerProfile.local?.artifactRoot) {
    return path.resolve(process.cwd(), runnerProfile.local.artifactRoot);
  }

  return path.resolve(process.cwd(), DEFAULT_EXTERNAL_COMPUTE_ARTIFACT_ROOT);
}

async function writeJsonFile(filePath: string, payload: unknown) {
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function validateRunnerSelection(
  jobSpec: ExternalComputeJobSpec,
  runnerProfile: ExternalComputeRunnerProfile,
) {
  if (jobSpec.profileId !== runnerProfile.profileId) {
    throw new Error(
      `Job ${jobSpec.jobId} expects profile ${jobSpec.profileId}, but received ${runnerProfile.profileId}.`,
    );
  }

  if (jobSpec.runnerKind !== runnerProfile.runnerKind) {
    throw new Error(
      `Job ${jobSpec.jobId} expects runner kind ${jobSpec.runnerKind}, but received ${runnerProfile.runnerKind}.`,
    );
  }
}

export async function executeExternalComputeJob(
  jobSpec: ExternalComputeJobSpec,
  runnerProfile: ExternalComputeRunnerProfile,
  options: ExecuteExternalComputeJobOptions = {},
): Promise<ExternalComputeExecutionResult> {
  validateRunnerSelection(jobSpec, runnerProfile);

  const workloadRegistry = options.workloadRegistry ?? EXTERNAL_COMPUTE_WORKLOAD_REGISTRY;
  const workload = workloadRegistry.get(jobSpec.workloadId);
  if (!workload) {
    throw new Error(`Unknown external-compute workload id: ${jobSpec.workloadId}`);
  }

  const artifactRoot = resolveArtifactRoot(runnerProfile, options.artifactRoot);
  const jobDirectory = path.join(artifactRoot, sanitizePathSegment(jobSpec.jobId));
  await mkdir(jobDirectory, { recursive: true });

  const summaryPath = path.join(jobDirectory, 'summary.json');
  const manifestPath = path.join(jobDirectory, 'artifact-manifest.json');
  const startedAt = new Date().toISOString();
  const startedAtMs = Date.now();

  if (runnerProfile.runnerKind === 'ssh') {
    const finishedAt = new Date().toISOString();
    const manifest: ExternalComputeArtifactManifest = {
      jobId: jobSpec.jobId,
      workloadId: jobSpec.workloadId,
      runnerKind: runnerProfile.runnerKind,
      profileId: runnerProfile.profileId,
      status: 'not-implemented',
      startedAt,
      finishedAt,
      durationMs: Date.now() - startedAtMs,
      summaryPath,
      outputPaths: [summaryPath],
      note: 'PGL4 foundations-only: SSH execution is intentionally not implemented yet.',
    };

    await writeJsonFile(summaryPath, {
      jobId: jobSpec.jobId,
      workloadId: jobSpec.workloadId,
      runnerKind: runnerProfile.runnerKind,
      status: manifest.status,
      note: manifest.note,
      profile: {
        profileId: runnerProfile.profileId,
        description: runnerProfile.description,
        ssh: runnerProfile.ssh,
      },
    });
    await writeJsonFile(manifestPath, manifest);

    return { manifest, manifestPath, summaryPath };
  }

  const workloadResult = await workload.executeLocal(jobSpec.input);
  const finishedAt = new Date().toISOString();
  const manifest: ExternalComputeArtifactManifest = {
    jobId: jobSpec.jobId,
    workloadId: jobSpec.workloadId,
    runnerKind: runnerProfile.runnerKind,
    profileId: runnerProfile.profileId,
    status: 'completed',
    startedAt,
    finishedAt,
    durationMs: Date.now() - startedAtMs,
    summaryPath,
    outputPaths: [summaryPath],
    note: workloadResult.note,
  };

  await writeJsonFile(summaryPath, {
    jobId: jobSpec.jobId,
    workloadId: jobSpec.workloadId,
    runnerKind: runnerProfile.runnerKind,
    status: manifest.status,
    note: workloadResult.note ?? null,
    summary: workloadResult.summary,
  });
  await writeJsonFile(manifestPath, manifest);

  return { manifest, manifestPath, summaryPath };
}
