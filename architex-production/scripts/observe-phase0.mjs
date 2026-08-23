#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const durationSeconds = Number(process.argv[2] || 300);
const intervalSeconds = Number(process.argv[3] || 30);
const output = resolve(process.argv[4] || 'docs/v8-remediation/evidence/phase0-observation.json');
const origin = 'https://api.architex.co.za';
const headers = {
  'Content-Type': 'application/json',
  'X-Architex-Role': 'platform_admin',
  'X-Architex-User': 'phase0-observation-probe',
};

async function request(path, init = {}) {
  const started = Date.now();
  const response = await fetch(origin + path, { ...init, headers: { ...headers, ...init.headers } });
  const body = await response.json();
  return { status: response.status, body, elapsedMs: Date.now() - started };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const startedAt = new Date().toISOString();
const deadline = Date.now() + durationSeconds * 1000;
const samples = [];

do {
  const sampledAt = new Date().toISOString();
  const legacy = await request('/api/health');
  const candidate = await request('/api/v1/health');
  const before = await request('/api/v1/engineering/calculations');
  const auditBefore = await request('/api/v1/audit-log');
  const contained = await request('/api/v1/engineering/calculations', {
    method: 'POST',
    body: JSON.stringify({ calc_type: 'steel-beam', inputs: {}, results: {} }),
  });
  const after = await request('/api/v1/engineering/calculations');
  const auditAfter = await request('/api/v1/audit-log');
  assert(legacy.status === 200, `legacy health returned ${legacy.status}`);
  assert(candidate.status === 200, `candidate health returned ${candidate.status}`);
  assert(contained.status === 503 && contained.body.code === 'CALCULATOR_CONTAINED', 'containment rejection failed');
  assert(before.body.count === after.body.count, 'calculation count changed');
  assert(auditBefore.body.count === auditAfter.body.count, 'audit count changed');
  const sample = {
    sampledAt,
    legacyHealth: legacy.status,
    candidateHealth: candidate.status,
    containedCreate: contained.status,
    containmentCode: contained.body.code,
    calculationCount: after.body.count,
    auditCount: auditAfter.body.count,
    maxElapsedMs: Math.max(legacy.elapsedMs, candidate.elapsedMs, contained.elapsedMs),
  };
  samples.push(sample);
  console.log(JSON.stringify(sample));
  if (Date.now() < deadline) await delay(Math.min(intervalSeconds * 1000, Math.max(0, deadline - Date.now())));
} while (Date.now() < deadline);

const evidence = {
  schemaVersion: 1,
  revision: '94c6a5213bfd14eb51a77413b7edcf2ad91490c3',
  manifestSha256: '0bd059e4afd23706503ee05ef12d99c6b6c7378ea8fb2347a0fdeb433300f09d',
  startedAt,
  completedAt: new Date().toISOString(),
  durationSeconds,
  intervalSeconds,
  sampleCount: samples.length,
  result: 'PASS',
  samples,
};
writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Phase 0 observation PASS: ${samples.length} samples written to ${output}`);
