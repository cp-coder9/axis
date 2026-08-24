import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const root = resolve('.');
const manifestPath = resolve(root, 'artifacts/release-evidence/manifest.json');
const evidenceFiles = [
  'package.json',
  'package-lock.json',
  'docs/v8-remediation/PHASE_8_VALIDATION_RELEASE.md',
  '.next/standalone/server.js',
  '.next/standalone/.next/static',
];

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function fingerprint(relativePath) {
  const absolutePath = resolve(root, relativePath);
  const details = await stat(absolutePath).catch(() => {
    throw new Error(`Release evidence input is missing: ${relativePath}`);
  });
  if (details.isFile()) {
    const content = await readFile(absolutePath);
    return { path: relativePath, sha256: sha256(content), bytes: content.length, entries: 1 };
  }
  if (!details.isDirectory()) {
    throw new Error(`Release evidence input is neither a file nor directory: ${relativePath}`);
  }

  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(target);
      else if (entry.isFile()) files.push(target);
    }
  }
  await visit(absolutePath);
  files.sort();
  const digests = await Promise.all(files.map(async (file) => {
    const content = await readFile(file);
    return { path: relative(absolutePath, file).replaceAll('\\', '/'), sha256: sha256(content), bytes: content.length };
  }));
  const content = Buffer.from(digests.map((entry) => `${entry.path}\0${entry.sha256}\0${entry.bytes}\n`).join(''));
  return {
    path: relativePath,
    sha256: sha256(content),
    bytes: digests.reduce((total, entry) => total + entry.bytes, 0),
    entries: digests.length,
  };
}

function revision() {
  return execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  }).trim();
}

async function collect() {
  const artifacts = await Promise.all(evidenceFiles.map(fingerprint));
  const manifest = {
    schemaVersion: 1,
    collectedAt: new Date().toISOString(),
    sourceRevision: revision(),
    environment: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
    },
    releaseReadiness: 'unverified',
    note: 'This manifest verifies observed artifact integrity only. It does not replace phase evidence, release rehearsal, or independent approvals.',
    artifacts,
  };

  await mkdir(resolve(root, 'artifacts/release-evidence'), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Release evidence collected: ${manifestPath}`);
  console.log(`Release readiness: ${manifest.releaseReadiness}`);
}

async function verify() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.releaseReadiness !== 'unverified' || !Array.isArray(manifest.artifacts)) {
    throw new Error('Release evidence manifest has an unsupported schema or readiness state');
  }

  for (const expected of manifest.artifacts) {
    const actual = await fingerprint(expected.path);
    if (actual.sha256 !== expected.sha256 || actual.bytes !== expected.bytes || actual.entries !== expected.entries) {
      throw new Error(`Release evidence hash mismatch: ${expected.path}`);
    }
  }
  console.log(`Release evidence integrity verified: ${manifest.artifacts.length} artifacts`);
  console.log('Release readiness remains unverified pending mandatory phase evidence and independent approvals.');
}

if (process.argv.includes('--verify')) {
  await verify();
} else {
  await collect();
}
