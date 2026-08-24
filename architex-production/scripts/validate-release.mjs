import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const layers = [
  ['phase-evidence', ['run', 'validate:phases']],
  ['documentation', ['run', 'validate:docs']],
  ['registry', ['run', 'validate:registry']],
  ['calculator-outcomes', ['run', 'test:calculations:release-status']],
  ['api-boundary', ['run', 'test:api']],
  ['typecheck', ['run', 'typecheck']],
  ['build', ['run', 'build']],
];

for (const [name, args] of layers) {
  console.log(`RELEASE GATE LAYER: ${name}`);
  const result = spawnSync(npmCommand, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`RELEASE GATE BLOCKED: ${name}`);
    process.exit(result.status ?? 1);
  }
}

console.log('RELEASE GATE PASS');
