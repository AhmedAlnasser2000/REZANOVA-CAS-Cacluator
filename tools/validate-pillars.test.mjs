import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { REQUIRED_PILLARS, validatePillars } from './validate-pillars.mjs';

const REQUIRED_SECTION_TEXT = [
  '## What It Protects',
  '',
  'sample',
  '',
  '## Why It Is Cheap Now And Expensive Later',
  '',
  'sample',
  '',
  '## What Exists Today',
  '',
  'sample',
  '',
  '## First Automated Check',
  '',
  'sample',
  '',
  '## Explicitly Deferred',
  '',
  'sample',
  '',
].join('\n');

async function seedPillars(root, options = {}) {
  const { omitFile, omitSectionFile } = options;
  const pillarsDir = path.join(root, 'docs', 'pillars');
  await fs.mkdir(pillarsDir, { recursive: true });

  const links = REQUIRED_PILLARS
    .map((fileName) => `- [${fileName}](${fileName})`)
    .join('\n');
  await fs.writeFile(path.join(pillarsDir, 'README.md'), `# Pillars\n\n${links}\n`);

  for (const fileName of REQUIRED_PILLARS) {
    if (fileName === omitFile) {
      continue;
    }

    const text = fileName === omitSectionFile
      ? REQUIRED_SECTION_TEXT.replace('## Explicitly Deferred\n\nsample\n', '')
      : REQUIRED_SECTION_TEXT;
    await fs.writeFile(path.join(pillarsDir, fileName), `# ${fileName}\n\n${text}`);
  }
}

test('validator passes on a complete pillars folder', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'calcwiz-pillars-pass-'));
  await seedPillars(root);
  await assert.doesNotReject(() => validatePillars(root));
});

test('validator fails when a required pillar file is missing', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'calcwiz-pillars-missing-file-'));
  await seedPillars(root, { omitFile: 'math-regression.md' });
  await assert.rejects(() => validatePillars(root), /math-regression\.md/);
});

test('validator fails when a required pillar section is missing', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'calcwiz-pillars-missing-section-'));
  await seedPillars(root, { omitSectionFile: 'diagnostics.md' });
  await assert.rejects(() => validatePillars(root), /Explicitly Deferred/);
});
