#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const output = resolve(root, process.argv[2] || 'release/phase0-api');
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const paths = [
  'backend/config.php',
  'backend/public/index.php',
  'backend/public/.htaccess',
  'backend/generated/calculator_release.php',
  'backend/lib/db.php',
  'backend/data/foundation.json',
  'backend/data/modules.json',
  'backend/data/platform-policy.json',
];

for (const source of paths) {
  if (!existsSync(resolve(root, source))) throw new Error(`Missing Phase 0 API source: ${source}`);
}

rmSync(output, { recursive: true, force: true });
for (const source of paths) {
  const relative = source.replace(/^backend\//, '');
  const destination = resolve(output, 'phase0-backend', relative);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(resolve(root, source), destination);
}
cpSync(resolve(root, 'backend/deploy/api-root.htaccess'), resolve(output, '.htaccess'));
writeFileSync(resolve(output, 'phase0-deploy-info.json'), `${JSON.stringify({
  revision,
  manifestSha256: '0bd059e4afd23706503ee05ef12d99c6b6c7378ea8fb2347a0fdeb433300f09d',
  generatedPhpSha256: '2797719c2c9fd89c2425a04c774b1879fa68a0621b5a7e35f076b0e0f8016a02',
}, null, 2)}\n`);
console.log(`Packaged Phase 0 API revision ${revision} at ${output}`);
