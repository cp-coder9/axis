import { cp, access, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('.');
const sourceStatic = resolve(root, '.next/static');
const standalone = resolve(root, '.next/standalone');
const targetStatic = resolve(standalone, '.next/static');
const sourcePublic = resolve(root, 'public');
const targetPublic = resolve(standalone, 'public');

async function requireFile(path, label) {
  try {
    await access(path, constants.R_OK);
  } catch {
    throw new Error(`Release assembly missing ${label}: ${path}`);
  }
}

await requireFile(resolve(standalone, 'server.js'), 'standalone server.js');
await requireFile(sourceStatic, 'Next static assets');
await cp(sourceStatic, targetStatic, { recursive: true, force: true });

try {
  if ((await stat(sourcePublic)).isDirectory()) await cp(sourcePublic, targetPublic, { recursive: true, force: true });
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

await requireFile(targetStatic, 'assembled Next static assets');
console.log(`Release standalone assembly passed: ${standalone}`);
