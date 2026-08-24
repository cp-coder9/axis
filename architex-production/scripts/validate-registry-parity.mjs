import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const canonical = Object.keys(JSON.parse(readFileSync(resolve(root, '..', 'tools.json'), 'utf8')));
const backend = JSON.parse(readFileSync(resolve(root, 'backend/data/modules.json'), 'utf8')).map((row) => row.id);
const migration = JSON.parse(readFileSync(resolve(root, 'e2e/fixtures/v8-migration-manifest.json'), 'utf8')).waves.flatMap((wave) => wave.modules.map((module) => module.id));
const registry = [...readFileSync(resolve(root, 'lib/module-registry.tsx'), 'utf8').matchAll(/^\s{2}([a-z_]+): .*Module as/mg)].map((match) => match[1]);

const findings = [];
for (const [surface, ids, ordered] of [['backend', backend, true], ['migration', migration, false], ['module-registry', registry, false]]) {
  const matches = ordered
    ? JSON.stringify(ids) === JSON.stringify(canonical)
    : ids.length === canonical.length && new Set(ids).size === canonical.length && canonical.every((id) => ids.includes(id));
  if (!matches) findings.push(`P8-REGISTRY-${surface.toUpperCase()}-MISMATCH|surface=${surface}|expected=47|observed=${ids.length}`);
}
for (const [surface, path] of [['e2e-contracts', 'e2e/fixtures/module-contracts.ts'], ['documentation', 'docs/v8-remediation/MODULE_INVENTORY.md'], ['mariadb', 'docs/v8-remediation/evidence/MARIADB_MODULE_REGISTRY.json']]) {
  if (!existsSync(resolve(root, path))) findings.push(`P8-REGISTRY-${surface.toUpperCase()}-UNAVAILABLE|surface=${surface}|evidence=${path}`);
}
for (const finding of findings) console.error(finding);
console.log(`Registry parity: 7 surfaces checked, ${7 - findings.length} passed, ${findings.length} blockers`);
if (findings.length) process.exitCode = 1;
