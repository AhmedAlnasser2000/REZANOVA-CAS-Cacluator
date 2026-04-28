import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const REQUIRED_PILLARS = [
  'build-identity.md',
  'math-regression.md',
  'diagnostics.md',
  'config-versioning.md',
  'release-discipline.md',
  'dependency-policy.md',
  'privacy-telemetry.md',
  'result-envelope-stability.md',
];

const REQUIRED_SECTIONS = [
  '## What It Protects',
  '## Why It Is Cheap Now And Expensive Later',
  '## What Exists Today',
  '## First Automated Check',
  '## Explicitly Deferred',
];

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, '\n');
}

async function readRequiredFile(filePath, label, errors) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    errors.push(`${label} is missing`);
    return null;
  }
}

export async function validatePillars(root = process.cwd()) {
  const errors = [];
  const pillarsDir = path.join(root, 'docs', 'pillars');

  const readmeText = await readRequiredFile(path.join(pillarsDir, 'README.md'), 'docs/pillars/README.md', errors);
  if (readmeText) {
    for (const fileName of REQUIRED_PILLARS) {
      if (!normalizeNewlines(readmeText).includes(`](${fileName})`)) {
        errors.push(`docs/pillars/README.md must link to ${fileName}`);
      }
    }
  }

  for (const fileName of REQUIRED_PILLARS) {
    const label = `docs/pillars/${fileName}`;
    const text = await readRequiredFile(path.join(pillarsDir, fileName), label, errors);
    if (!text) {
      continue;
    }

    const normalized = normalizeNewlines(text);
    for (const section of REQUIRED_SECTIONS) {
      if (!normalized.includes(section)) {
        errors.push(`${label} is missing required section: ${section}`);
      }
    }
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

const executedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (executedDirectly) {
  try {
    await validatePillars();
    console.log('pillar validation passed');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
