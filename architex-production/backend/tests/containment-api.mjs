import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const origin = 'http://127.0.0.1:8091';
const headers = { 'Content-Type': 'application/json', 'X-Architex-Role': 'bep', 'X-Architex-User': 'user-demo-bep' };
const server = spawn('php', ['-S', '127.0.0.1:8091', 'backend/public/index.php'], { cwd: root, stdio: 'ignore', windowsHide: true });
const payload = {
  project_id: null, calc_type: 'steel-beam', schemaVersion: 'engineering-calculation/v1', calculatorId: 'steel-beam', formulaVersion: 'steel-beam/1.0.0',
  inputs: { span_m: { value: 6, unit: 'm' } }, results: [{ key: 'moment', label: 'Moment', quantity: { value: 54, unit: 'kN' }, passes: null, criterion: null }],
  derivation: ['M = wL2/8'], references: [{ id: 'advisory', title: 'Advisory', edition: 'unverified', clause: null, url: null }], assumptions: ['Test only'], limitations: ['Contained test only'],
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
async function request(path, init = {}) { const response = await fetch(`${origin}${path}`, { ...init, headers: { ...headers, ...init.headers } }); return { response, body: await response.json() }; }
try {
  for (let attempt = 0; attempt < 50; attempt++) { try { if ((await fetch(`${origin}/api/v1/engineering/calculations`, { headers })).status) break; } catch {} await delay(100); }
  const before = await request('/api/v1/engineering/calculations'); assert(before.response.status === 200, `list-before returned ${before.response.status}`);
  const create = await request('/api/v1/engineering/calculations', { method: 'POST', headers: { 'Idempotency-Key': 'contained-api-test-v1' }, body: JSON.stringify(payload) });
  assert(create.response.status === 503, `contained create returned ${create.response.status}`); assert(create.body.code === 'CALCULATOR_CONTAINED', 'contained create missing CALCULATOR_CONTAINED');
  const unknown = await request('/api/v1/engineering/calculations', { method: 'POST', headers: { 'Idempotency-Key': 'unknown-api-test-v1' }, body: JSON.stringify({ ...payload, calc_type: 'not-a-calculator', calculatorId: 'not-a-calculator' }) });
  assert(unknown.response.status === 422, `unknown calculator returned ${unknown.response.status}`);
  const after = await request('/api/v1/engineering/calculations'); assert(after.response.status === 200, `list-after returned ${after.response.status}`); assert(after.body.count === before.body.count, `record count changed from ${before.body.count} to ${after.body.count}`);
  console.log('V8-P3 contained API test passed: valid contained create 503, malformed type 422, MariaDB count unchanged.');
} finally { server.kill(); }
