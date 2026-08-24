import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('.');
const targets = [
  'README.md',
  'production.md',
  'docs/E2E_TESTS.md',
  'docs/DATABASE.md',
  'docs/MODULE_FUNCTIONALITY.md',
  'docs/FOUNDATION_BUILD_STATUS.md',
  'docs/DEPLOYMENT.md',
];
const findings = [];
const source = new Map(targets.map((path) => [path, readFileSync(resolve(root, path), 'utf8')]));

for (const [path, text] of source) {
  if (/\b46[- ]modules?\b/i.test(text)) findings.push(`P8-DOC-COUNT|path=${path}|observed=46`);
}

const productionLog = source.get('production.md');
if (!productionLog.startsWith('# Architex OS — Historical Production Readiness Log\n\n**Status: historical and non-authoritative.**')) {
  findings.push('P8-DOC-PRODUCTION-STATUS|path=production.md|observed=not-historical');
}
if (/100\/100|full(?:y)? verified God Mode/i.test(productionLog)) findings.push('P8-DOC-PRODUCTION-CLAIM|path=production.md|observed=unsupported-total-or-completion');

const deployment = source.get('docs/DEPLOYMENT.md');
if (/also writes calculation records into the JSON store|JSON write path/i.test(deployment)) findings.push('P8-DOC-PERSISTENCE|path=docs/DEPLOYMENT.md|observed=dual-or-json-calculation-write');

const evidenceDocs = source.get('docs/MODULE_FUNCTIONALITY.md');
if (!/Status: partial \/ historical/i.test(evidenceDocs)) findings.push('P8-DOC-MODULE-STATUS|path=docs/MODULE_FUNCTIONALITY.md|observed=not-historical');

for (const finding of findings) console.error(finding);
console.log(`Documentation parity: ${targets.length} release-facing documents checked, ${findings.length} blockers`);
if (findings.length) process.exitCode = 1;
