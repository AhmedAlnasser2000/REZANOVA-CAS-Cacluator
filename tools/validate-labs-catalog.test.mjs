import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLabsCatalog, parseFlatYaml, parseRecordsIndex, renderLabsCatalog } from './labs-catalog-core.mjs';

function collectSourceFiles(dirPath, result = []) {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, result);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      result.push(fullPath);
    }
  }

  return result;
}

function createFixture() {
  const rootDir = mkdtempSync(path.join(tmpdir(), 'calcwiz-labs-catalog-'));
  mkdirSync(path.join(rootDir, 'playground/manifests'), { recursive: true });
  mkdirSync(path.join(rootDir, 'playground/records'), { recursive: true });
  return rootDir;
}

function writeValidFixture(rootDir, options = {}) {
  const status = options.status ?? 'active';
  const level = options.level ?? 'level-0-research';
  const id = options.id ?? 'sample-experiment';
  const manifestPath = `playground/manifests/${id}.yaml`;
  const recordPath = `playground/records/${id}.md`;
  writeFileSync(path.join(rootDir, manifestPath), [
    `experiment_id: ${id}`,
    'title: Sample Experiment',
    'owner: unassigned',
    'lane_topic: sample-lane',
    `current_level: ${level}`,
    `status: ${status}`,
    `record_path: ${recordPath}`,
    'started_on: 2026-04-30',
    'last_reviewed: 2026-04-30',
    'next_review: 2026-05-07',
    'candidate_stable_home: future stable core',
    '',
  ].join('\n'));
  writeFileSync(path.join(rootDir, recordPath), '# Sample Experiment\n');
  writeFileSync(path.join(rootDir, 'playground/records/INDEX.md'), [
    '# Playground Experiment Index',
    '',
    '| experiment_id | lane | level | status | owner | record | manifest | last_reviewed | next_step |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    `| \`${id}\` | \`sample-lane\` | \`${level}\` | \`${status}\` | \`unassigned\` | [Record](./${id}.md) | [Manifest](../manifests/${id}.yaml) | \`2026-04-30\` | Keep observing the sample. |`,
    '',
  ].join('\n'));
}

test('parseFlatYaml reads the bounded manifest shape', () => {
  assert.deepEqual(parseFlatYaml('experiment_id: sample\nstatus: active\n'), {
    experiment_id: 'sample',
    status: 'active',
  });
});

test('parseRecordsIndex normalizes record and manifest paths', () => {
  const rows = parseRecordsIndex([
    '| experiment_id | lane | level | status | owner | record | manifest | last_reviewed | next_step |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    '| `sample` | `lane` | `level-0-research` | `active` | `owner` | [Record](./sample.md) | [Manifest](../manifests/sample.yaml) | `2026-04-30` | Next. |',
  ].join('\n'));

  assert.equal(rows[0].recordPath, 'playground/records/sample.md');
  assert.equal(rows[0].manifestPath, 'playground/manifests/sample.yaml');
});

test('buildLabsCatalog builds a stable generated snapshot from manifests and index', () => {
  const rootDir = createFixture();
  writeValidFixture(rootDir);
  const catalog = buildLabsCatalog({ rootDir });

  assert.equal(catalog.length, 1);
  assert.equal(catalog[0].experimentId, 'sample-experiment');
  assert.equal(catalog[0].nextStep, 'Keep observing the sample.');
  assert.match(renderLabsCatalog(catalog), /LABS_EXPERIMENTS/);
});

test('buildLabsCatalog rejects duplicate experiment ids', () => {
  const rootDir = createFixture();
  writeValidFixture(rootDir);
  writeFileSync(path.join(rootDir, 'playground/manifests/duplicate.yaml'), [
    'experiment_id: sample-experiment',
    'title: Duplicate',
    'owner: unassigned',
    'lane_topic: sample-lane',
    'current_level: level-0-research',
    'status: active',
    'record_path: playground/records/sample-experiment.md',
    'last_reviewed: 2026-04-30',
    'next_review: 2026-05-07',
    'candidate_stable_home: future stable core',
    '',
  ].join('\n'));

  assert.throws(() => buildLabsCatalog({ rootDir }), /Duplicate Playground experiment id/);
});

test('buildLabsCatalog rejects invalid status and level values', () => {
  const invalidStatusRoot = createFixture();
  writeValidFixture(invalidStatusRoot, { status: 'running' });
  assert.throws(() => buildLabsCatalog({ rootDir: invalidStatusRoot }), /invalid status/);

  const invalidLevelRoot = createFixture();
  writeValidFixture(invalidLevelRoot, { level: 'level-9-magic' });
  assert.throws(() => buildLabsCatalog({ rootDir: invalidLevelRoot }), /invalid level/);
});

test('buildLabsCatalog rejects manifest and records-index drift', () => {
  const rootDir = createFixture();
  writeValidFixture(rootDir);
  writeFileSync(path.join(rootDir, 'playground/records/INDEX.md'), [
    '# Playground Experiment Index',
    '',
    '| experiment_id | lane | level | status | owner | record | manifest | last_reviewed | next_step |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    '| `sample-experiment` | `different-lane` | `level-0-research` | `active` | `unassigned` | [Record](./sample-experiment.md) | [Manifest](../manifests/sample-experiment.yaml) | `2026-04-30` | Keep observing the sample. |',
    '',
  ].join('\n'));

  assert.throws(() => buildLabsCatalog({ rootDir }), /lane mismatch/);
});

test('Labs runtime files do not import or dynamically load Playground code', () => {
  const rootDir = process.cwd();
  const labsRuntimeFiles = [
    path.join(rootDir, 'src/components/LabsPanel.tsx'),
    ...collectSourceFiles(path.join(rootDir, 'src/lib/labs')),
  ];

  for (const filePath of labsRuntimeFiles) {
    const source = readFileSync(filePath, 'utf8');
    assert.doesNotMatch(source, /\bfrom\s+['"][^'"]*playground/);
    assert.doesNotMatch(source, /\bimport\s*\([^)]*playground/);
    assert.doesNotMatch(source, /\brequire\s*\([^)]*playground/);
  }
});
