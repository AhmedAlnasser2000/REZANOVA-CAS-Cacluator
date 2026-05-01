import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildLabsCatalog, renderLabsCatalog } from './labs-catalog-core.mjs';

const outputPath = 'src/lib/labs/generated-catalog.ts';
const catalog = buildLabsCatalog();
const rendered = renderLabsCatalog(catalog);

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, rendered);
console.log(`Generated ${outputPath} with ${catalog.length} lab experiment(s).`);
