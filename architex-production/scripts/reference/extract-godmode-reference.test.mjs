import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  extractGodModeReference,
  referencePath,
  serializeGodModeReference,
} from './extract-godmode-reference.mjs';

const html = await readFile(referencePath(), 'utf8');
const first = extractGodModeReference(html);
const second = extractGodModeReference(html);

assert.equal(Object.keys(first.tools).length, 47, 'the sole reference must define exactly 47 tools');
assert.equal(new Set(Object.keys(first.tools)).size, 47, 'reference tool ids must be unique');
assert.deepEqual(first.tools.specforge.tabs.map((tab) => tab.label), [
  'Overview',
  'Pictorial Board',
  'Sections',
  'Products',
  'Document Preview',
  'Approvals',
  'Budget & Risk',
  'BoM / BoQ',
  'Planning',
  'Procurement',
  'Issue & Distribute',
  'Drawing Intelligence',
  'Closeout',
  'Integration',
]);
assert.deepEqual(first.unresolvedMapToolIds, [
  'contracts',
  'cpd',
  'eia',
  'expense_claim',
  'fire_safety',
  'valuations',
]);
assert.equal(first.sourceSha256, second.sourceSha256, 'source hashing must be deterministic');
assert.deepEqual(first, second, 'extraction must be deterministic');
assert.equal(serializeGodModeReference(first), serializeGodModeReference(second), 'serialized output must be byte stable');
assert.match(first.sourcePath, /architex_datum_os_integrated_modules_v8_engineering_godmode\.html$/);

console.log('God Mode reference extraction contract passed.');
