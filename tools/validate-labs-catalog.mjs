import { readFileSync } from 'node:fs';
import { buildLabsCatalog, renderLabsCatalog } from './labs-catalog-core.mjs';

const outputPath = 'src/lib/labs/generated-catalog.ts';
const catalog = buildLabsCatalog();
const expected = renderLabsCatalog(catalog);
const actual = readFileSync(outputPath, 'utf8');

if (actual !== expected) {
  console.error(`${outputPath} is stale. Run npm run generate:labs-catalog.`);
  process.exitCode = 1;
} else {
  console.log(`Labs catalog snapshot is fresh (${catalog.length} experiment(s)).`);
}
