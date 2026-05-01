import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const POSIX_SEP = /\\/g;

export const ALLOWED_LAB_STATUSES = ['draft', 'active', 'paused', 'promoted', 'retired'];
export const ALLOWED_LAB_LEVELS = [
  'level-0-research',
  'level-1-feasibility',
  'level-2-bounded-prototypes',
  'level-3-integration-candidates',
];

const REQUIRED_MANIFEST_FIELDS = [
  'experiment_id',
  'title',
  'owner',
  'lane_topic',
  'current_level',
  'status',
  'record_path',
  'last_reviewed',
  'next_review',
  'candidate_stable_home',
];

function normalizeRepoPath(filePath) {
  return filePath.replace(POSIX_SEP, '/').replace(/^\.\//, '');
}

function resolveRepoPath(fromRepoPath, relativePath) {
  if (!relativePath || relativePath === '-') {
    return '-';
  }

  if (relativePath.startsWith('playground/')) {
    return normalizeRepoPath(relativePath);
  }

  const fromDir = path.posix.dirname(fromRepoPath);
  return normalizeRepoPath(path.posix.normalize(path.posix.join(fromDir, relativePath)));
}

function stripCode(value) {
  return value.trim().replace(/^`(.+)`$/, '$1');
}

function parseMarkdownLink(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/^\[[^\]]+\]\(([^)]+)\)$/);
  return match ? match[1] : stripCode(trimmed);
}

function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

export function parseFlatYaml(text, filePath = 'manifest.yaml') {
  const data = {};
  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex < 0) {
      throw new Error(`${filePath}:${index + 1} is not a supported flat YAML key/value line`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    data[key] = value;
  }

  return data;
}

export function parseRecordsIndex(text, options = {}) {
  const indexRepoPath = options.indexRepoPath ?? 'playground/records/INDEX.md';
  const rows = [];
  let insideTable = false;

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) {
      if (insideTable) {
        break;
      }
      continue;
    }

    const cells = splitMarkdownRow(line);
    if (cells[0] === 'experiment_id') {
      insideTable = true;
      continue;
    }
    if (!insideTable || cells.every((cell) => /^-+$/.test(cell.replace(/ /g, '')))) {
      continue;
    }
    if (cells.length < 9) {
      throw new Error(`Malformed Playground record index row: ${line}`);
    }

    rows.push({
      experimentId: stripCode(cells[0]),
      laneTopic: stripCode(cells[1]),
      currentLevel: stripCode(cells[2]),
      status: stripCode(cells[3]),
      owner: stripCode(cells[4]),
      recordPath: resolveRepoPath(
        indexRepoPath,
        parseMarkdownLink(cells[5]),
      ),
      manifestPath: resolveRepoPath(
        indexRepoPath,
        parseMarkdownLink(cells[6]),
      ),
      lastReviewed: stripCode(cells[7]),
      nextStep: stripCode(cells[8]),
    });
  }

  return rows;
}

function assertAllowed(label, value, allowed, experimentId) {
  if (!allowed.includes(value)) {
    throw new Error(`${experimentId} has invalid ${label} "${value}"`);
  }
}

function assertEqual(label, actual, expected, experimentId) {
  if (actual !== expected) {
    throw new Error(`${experimentId} ${label} mismatch: manifest has "${actual}", index has "${expected}"`);
  }
}

function validateManifest(manifest, manifestPath) {
  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!manifest[field]) {
      throw new Error(`${manifestPath} is missing required field "${field}"`);
    }
  }

  assertAllowed('status', manifest.status, ALLOWED_LAB_STATUSES, manifest.experiment_id);
  assertAllowed('level', manifest.current_level, ALLOWED_LAB_LEVELS, manifest.experiment_id);
}

export function buildLabsCatalog(options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const manifestsDir = options.manifestsDir ?? 'playground/manifests';
  const indexPath = options.indexPath ?? 'playground/records/INDEX.md';
  const absoluteManifestsDir = path.join(rootDir, manifestsDir);
  const absoluteIndexPath = path.join(rootDir, indexPath);

  if (!existsSync(absoluteManifestsDir)) {
    throw new Error(`Missing Playground manifests directory: ${manifestsDir}`);
  }
  if (!existsSync(absoluteIndexPath)) {
    throw new Error(`Missing Playground records index: ${indexPath}`);
  }

  const manifestFiles = readdirSync(absoluteManifestsDir)
    .filter((fileName) => fileName.endsWith('.yaml') || fileName.endsWith('.yml'))
    .sort();
  const manifests = new Map();

  for (const fileName of manifestFiles) {
    const repoPath = normalizeRepoPath(path.posix.join(manifestsDir, fileName));
    const absolutePath = path.join(rootDir, repoPath);
    const manifest = parseFlatYaml(readFileSync(absolutePath, 'utf8'), repoPath);
    validateManifest(manifest, repoPath);

    if (manifests.has(manifest.experiment_id)) {
      throw new Error(`Duplicate Playground experiment id "${manifest.experiment_id}"`);
    }

    manifests.set(manifest.experiment_id, { manifest, manifestPath: repoPath });
  }

  const indexRows = parseRecordsIndex(readFileSync(absoluteIndexPath, 'utf8'), {
    indexRepoPath: indexPath,
  });
  const seenIndexIds = new Set();
  const catalog = [];

  for (const row of indexRows) {
    if (seenIndexIds.has(row.experimentId)) {
      throw new Error(`Duplicate Playground record index id "${row.experimentId}"`);
    }
    seenIndexIds.add(row.experimentId);

    const manifestEntry = manifests.get(row.experimentId);
    if (!manifestEntry) {
      throw new Error(`${row.experimentId} appears in records index without a manifest`);
    }

    const { manifest, manifestPath } = manifestEntry;
    assertEqual('lane', manifest.lane_topic, row.laneTopic, row.experimentId);
    assertEqual('level', manifest.current_level, row.currentLevel, row.experimentId);
    assertEqual('status', manifest.status, row.status, row.experimentId);
    assertEqual('owner', manifest.owner, row.owner, row.experimentId);
    assertEqual('record path', normalizeRepoPath(manifest.record_path), row.recordPath, row.experimentId);
    assertEqual('manifest path', manifestPath, row.manifestPath, row.experimentId);
    assertEqual('last reviewed', manifest.last_reviewed, row.lastReviewed, row.experimentId);

    catalog.push({
      experimentId: manifest.experiment_id,
      title: manifest.title,
      laneTopic: manifest.lane_topic,
      currentLevel: manifest.current_level,
      status: manifest.status,
      owner: manifest.owner,
      recordPath: normalizeRepoPath(manifest.record_path),
      manifestPath,
      lastReviewed: manifest.last_reviewed,
      nextReview: manifest.next_review,
      candidateStableHome: manifest.candidate_stable_home,
      nextStep: row.nextStep,
    });
  }

  for (const id of manifests.keys()) {
    if (!seenIndexIds.has(id)) {
      throw new Error(`${id} has a manifest without a records index row`);
    }
  }

  return catalog;
}

export function renderLabsCatalog(catalog) {
  const sourceDigest = createHash('sha256')
    .update(JSON.stringify(catalog))
    .digest('hex');

  return `import type { LabExperimentSummary } from './types';

export const LABS_CATALOG_DIGEST = '${sourceDigest}';

export const LABS_CATALOG_SOURCE = 'playground/manifests/*.yaml + playground/records/INDEX.md';

export const LABS_EXPERIMENTS = ${JSON.stringify(catalog, null, 2)} as const satisfies readonly LabExperimentSummary[];
`;
}
