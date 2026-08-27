import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  extractGodModeReference,
  extractGodModeShellContract,
  extractSpecForgeReferenceContract,
  referencePath,
  serializeGodModeReference,
} from './extract-godmode-reference.mjs';

const html = await readFile(referencePath(), 'utf8');
const first = extractGodModeReference(html);
const second = extractGodModeReference(html);
const shell = extractGodModeShellContract(html);
const specForge = extractSpecForgeReferenceContract(html);

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
assert.deepEqual(shell.regionOrder, ['rail', 'navigator', 'topbar', 'canvas', 'inspector']);
assert.deepEqual(shell.geometry, {
  rail: 74,
  railExpanded: 264,
  navigator: 306,
  navigatorCompact: 78,
  inspector: 344,
  topbar: 66,
});
assert.deepEqual(shell.breakpoints, [760, 1050, 1260, 1400]);
assert.equal(shell.themes.light['--teal'], '#19B7B0');
assert.equal(shell.themes.light['--rail'], '74px');
assert.deepEqual(shell.themes.dark, {});
assert.equal(shell.referenceDarkTheme, false);
assert.deepEqual(specForge.views.map(({ id, label, renderer }) => ({ id, label, renderer })), [
  { id: 'overview', label: 'Overview', renderer: 'renderOverview' },
  { id: 'pictorial', label: 'Pictorial Board', renderer: 'renderPictorial' },
  { id: 'sections', label: 'Sections', renderer: 'renderSections' },
  { id: 'products', label: 'Products', renderer: 'renderProducts' },
  { id: 'docpreview', label: 'Document Preview', renderer: 'renderDocPreview' },
  { id: 'approvals', label: 'Approvals', renderer: 'renderApprovals' },
  { id: 'budget', label: 'Budget & Risk', renderer: 'renderBudget' },
  { id: 'bomboq', label: 'BoM / BoQ', renderer: 'renderBomBoq' },
  { id: 'planning', label: 'Planning', renderer: 'renderPlanning' },
  { id: 'procurement', label: 'Procurement', renderer: 'renderProcurement' },
  { id: 'issue', label: 'Issue & Distribute', renderer: 'renderIssue' },
  { id: 'drawings', label: 'Drawing Intelligence', renderer: 'renderDrawings' },
  { id: 'closeout', label: 'Closeout', renderer: 'renderCloseout' },
  { id: 'integration', label: 'Integration', renderer: 'renderIntegration' },
]);
assert.match(specForge.embeddedSourceSha256, /^[a-f0-9]{64}$/);
assert.equal(specForge.sourceSha256, first.sourceSha256);
assert.deepEqual(specForge.procurementPipeline, [
  'RFQ Pending', 'Quoted', 'PO Raised', 'Ordered', 'In Transit', 'Delivered', 'Installed',
]);

console.log('God Mode reference extraction contract passed.');
