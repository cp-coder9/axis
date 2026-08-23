import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const origin = 'http://127.0.0.1:8081';
const headers = {
  'Content-Type': 'application/json',
  'X-Architex-Role': 'platform_admin',
  'X-Architex-User': 'containment-test-user',
};
let diagnostics = '';
const server = spawn('php', ['-S', '127.0.0.1:8081', '-t', 'backend/public'], {
  cwd: root,
  stdio: ['ignore', 'ignore', 'pipe'],
  windowsHide: true,
});
server.stderr.on('data', (chunk) => { diagnostics += String(chunk); });

async function request(path, init = {}) {
  const response = await fetch(`${origin}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const body = await response.json();
  return { response, body };
}

async function waitForReadiness() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/api/v1/health`);
      if (response.status === 200) return;
    } catch {}
    await delay(100);
  }
  throw new Error(`PHP server did not become ready. ${diagnostics}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await waitForReadiness();
  const before = await request('/api/v1/engineering/calculations');
  assert(before.response.status === 200, `list-before returned ${before.response.status}`);
  const beforeCount = before.body.count;
  const historical = before.body.calculations?.[0];
  assert(historical?.id, 'containment direct test requires one historical calculation fixture');
  assert(historical.evidence_state === 'unverified', 'historical record was not response-labeled unverified');
  assert(typeof historical.safety_message === 'string', 'historical record is missing its response-only safety message');

  const create = await request('/api/v1/engineering/calculations', {
    method: 'POST',
    body: JSON.stringify({ calc_type: 'steel-beam', inputs: { span: 6 }, results: { moment: 54 } }),
  });
  assert(create.response.status === 503, `contained create returned ${create.response.status}`);
  assert(create.body.code === 'CALCULATOR_CONTAINED', 'contained create did not return CALCULATOR_CONTAINED');

  const unknownCreate = await request('/api/v1/engineering/calculations', {
    method: 'POST',
    body: JSON.stringify({ calc_type: 'unknown-calculator', inputs: {}, results: {} }),
  });
  assert(unknownCreate.response.status === 503, `unknown create returned ${unknownCreate.response.status}`);
  assert(unknownCreate.body.code === 'CALCULATOR_CONTAINED', 'unknown create did not fail closed');

  const review = await request(`/api/v1/engineering/calculations/${historical.id}/review`, {
    method: 'POST',
    body: '{}',
  });
  assert(review.response.status === 503, `contained review returned ${review.response.status}`);
  assert(review.body.code === 'CALCULATOR_CONTAINED', 'contained review did not return CALCULATOR_CONTAINED');

  const after = await request('/api/v1/engineering/calculations');
  assert(after.response.status === 200, `list-after returned ${after.response.status}`);
  assert(after.body.count === beforeCount, `record count changed from ${beforeCount} to ${after.body.count}`);
  console.log('P0-E04 direct containment API test passed: create/review 503 and record count unchanged.');
} finally {
  server.kill();
  await Promise.race([
    new Promise((resolveExit) => server.once('exit', resolveExit)),
    delay(2_000),
  ]);
}
