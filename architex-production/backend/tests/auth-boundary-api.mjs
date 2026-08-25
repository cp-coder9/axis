import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const origin = 'http://127.0.0.1:8092';
const source = readFileSync(resolve(root, 'backend/public/index.php'), 'utf8');
const sourceAssert = (condition, message) => { if (!condition) throw new Error(message); };
sourceAssert(source.includes("require_once dirname(__DIR__) . '/lib/environment_policy.php';"), 'API must load the environment policy');
sourceAssert(source.includes('architex_demo_data_allowed($config)'), 'API fallbacks must be guarded by the environment policy');
sourceAssert(source.includes("json_response(['error' => 'Permission store unavailable'], 503)"), 'permissions must fail closed');
sourceAssert(source.includes("json_response(['error' => 'Project store unavailable'], 503)"), 'projects must fail closed');
sourceAssert(/if \(architex_demo_data_allowed\(\$config\)\) \{\s*ProjectsCache::set\(FALLBACK_PROJECTS\);\s*return FALLBACK_PROJECTS;\s*\}/.test(source), 'project fixtures must be guarded by the environment policy');
const server = spawn('php', ['-S', '127.0.0.1:8092', 'backend/public/index.php'], {
  cwd: root,
  stdio: 'ignore',
  windowsHide: true,
  env: { ...process.env, APP_ENV: 'production', ARCHITEX_DATA_MODE: 'production', JWT_SECRET: 'p3-auth-boundary-test-secret' },
});

const assert = (condition, message) => { if (!condition) throw new Error(message); };
async function request(headers = {}) {
  const response = await fetch(`${origin}/api/v1/engineering/calculations`, { headers });
  return { response, body: await response.json() };
}

try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try { if ((await fetch(`${origin}/api/v1/engineering/calculations`)).status) break; } catch {}
    await delay(100);
  }

  const demoHeaders = await request({ 'X-Architex-Role': 'engineer', 'X-Architex-User': 'demo-user' });
  assert(demoHeaders.response.status === 401, `production accepted demo headers with ${demoHeaders.response.status}`);
  assert(demoHeaders.body.error === 'Bearer token required', 'production demo-header rejection must require a bearer token');

  const malformed = await request({ Authorization: 'Bearer malformed' });
  assert(malformed.response.status === 401, `malformed bearer returned ${malformed.response.status}`);
  assert(malformed.body.error === 'Malformed bearer token', 'malformed bearer rejection must be explicit');

  const invalidSignature = await request({ Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vIn0.invalid' });
  assert(invalidSignature.response.status === 401, `invalid signature returned ${invalidSignature.response.status}`);
  assert(invalidSignature.body.error === 'Invalid bearer token', 'invalid signature rejection must be explicit');

  console.log('V8-P3 auth boundary test passed: production rejects demo headers, malformed bearer tokens, and invalid signatures.');
} finally {
  server.kill();
}
