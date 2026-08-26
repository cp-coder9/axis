import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const origin = 'http://127.0.0.1:8092';
const secret = 'specforge-isolated-api-test-secret';
const database = process.env.SPECFORGE_TEST_DB ?? 'architex_specforge_api_test';
const projectId = 'proj-faerie-glen';

const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function token({ sub, role, org = 'org-demo', projects = [projectId], packageNames = [] }) {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ sub, role, org, projects, package_names: packageNames, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, type: 'access' });
  const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

const identities = {
  architect: token({ sub: 'user-demo-architect', role: 'architect' }),
  client: token({ sub: 'user-demo-client', role: 'client' }),
  qs: token({ sub: 'user-demo-bep', role: 'quantity_surveyor' }),
  supplier: token({ sub: 'user-demo-bep', role: 'supplier', packageNames: ['Tiling'] }),
  otherOrganization: token({ sub: 'user-demo-architect', role: 'architect', org: 'org-other' }),
};

async function request(method, path, identity, body, extraHeaders = {}) {
  const response = await fetch(`${origin}/api/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${identity}`,
      'Content-Type': 'application/json',
      Connection: 'close',
      ...extraHeaders,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  return { status: response.status, body: payload, headers: response.headers };
}

const server = spawn('php', ['-S', '127.0.0.1:8092', 'backend/public/index.php'], {
  cwd: root,
  env: {
    ...process.env,
    APP_ENV: 'test',
    ARCHITEX_DATA_MODE: 'prototype',
    DB_HOST: 'localhost',
    DB_NAME: database,
    DB_USER: process.env.SPECFORGE_TEST_DB_USER ?? 'root',
    DB_PASS: process.env.SPECFORGE_TEST_DB_PASS ?? '',
    JWT_SECRET: secret,
    CORS_ORIGIN: 'https://test.architex.co.za',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

let serverErrors = '';
server.stderr.on('data', chunk => { serverErrors += chunk.toString(); });

try {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(`${origin}/api/v1/health`)).status) break; } catch {}
    await delay(100);
  }

  const empty = await request('GET', `/projects/${projectId}/specforge`, identities.architect);
  assert.equal(empty.status, 200);
  assert.equal(empty.body.workspace, null);

  const workspace = await request('POST', `/projects/${projectId}/specforge`, identities.architect, {
    profile: 'Residential architectural', stage: 'Design', revision: 'P06', budget_reviewed_at: '2026-08-26 10:00:00',
  }, { 'Idempotency-Key': 'workspace-create-v1' });
  assert.equal(workspace.status, 201);

  const section = await request('POST', `/projects/${projectId}/specforge/sections`, identities.architect, {
    code: '12', title: 'Finishes', discipline: 'Architecture', owner_role: 'architect', reviewer_role: 'bep', status: 'approved', source_revision: 'P06',
  }, { 'Idempotency-Key': 'section-create-v1' });
  assert.equal(section.status, 201);

  async function createItem(key, overrides) {
    return request('POST', `/projects/${projectId}/specforge/items`, identities.architect, {
      section_id: section.body.section.id, code: key.toUpperCase(), title: key, room: 'Lobby', package_name: 'Tiling',
      description: `${key} specification`, image_url: null, supplier: null, model: null, finish: null, dimensions: null,
      budget_allowance: 1000, estimated_cost: 1000, lead_time_days: 14, client_decision: false,
      owner_role: 'architect', reviewer_role: 'bep', approver_role: 'architect', status: 'draft', source_revision: 'P06', superseded_by: null,
      ...overrides,
    }, { 'Idempotency-Key': `item-${key}-v1` });
  }

  const clientItem = await createItem('client', { client_decision: true });
  const tilingItem = await createItem('tiling', { status: 'issued' });
  await createItem('roofing', { package_name: 'Roofing', status: 'issued' });
  assert.equal(clientItem.status, 201);
  assert.equal(tilingItem.status, 201);

  const budgetReview = await request('PATCH', `/projects/${projectId}/specforge`, identities.qs, { budget_reviewed_at: '2026-08-26 11:00:00' }, { 'If-Match': '1' });
  assert.equal(budgetReview.status, 200);
  assert.equal(budgetReview.body.workspace.lock_version, 2);
  const sectionUpdate = await request('PATCH', `/projects/${projectId}/specforge/sections/${section.body.section.id}`, identities.architect, { title: 'Architectural finishes' }, { 'If-Match': '1' });
  assert.equal(sectionUpdate.status, 200);
  const duplicate = await request('POST', `/projects/${projectId}/specforge/items/${tilingItem.body.item.id}/duplicate`, identities.architect, {}, { 'Idempotency-Key': 'duplicate-tiling-v1' });
  assert.equal(duplicate.status, 201);
  assert.equal(duplicate.body.item.status, 'draft');

  const approvalRequest = await request('POST', `/projects/${projectId}/specforge/items/${clientItem.body.item.id}/approvals`, identities.architect, {
    approval_type: 'client_decision', requested_role: 'client', requested_user_id: 'user-demo-client', due_at: '2026-08-30 12:00:00',
  }, { 'Idempotency-Key': 'client-approval-v1' });
  assert.equal(approvalRequest.status, 201);
  const blockedValidation = await request('POST', `/projects/${projectId}/specforge/issues/validate`, identities.architect, {});
  assert.deepEqual(blockedValidation.body, { ready: false, codes: ['APPROVALS_PENDING'] });
  const approvalDecision = await request('POST', `/projects/${projectId}/specforge/approvals/${approvalRequest.body.approval.id}/decision`, identities.client, {
    decision: 'approved', decision_note: 'Approved for tender issue',
  }, { 'Idempotency-Key': 'client-approval-decision-v1' });
  assert.equal(approvalDecision.status, 201);
  assert.equal(approvalDecision.body.approval.status, 'approved');

  const updated = await request('PATCH', `/projects/${projectId}/specforge/items/${clientItem.body.item.id}`, identities.architect, { title: 'Client tile revised' }, { 'If-Match': '1' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.item.lock_version, 2);
  const stale = await request('PATCH', `/projects/${projectId}/specforge/items/${clientItem.body.item.id}`, identities.architect, { title: 'Stale overwrite' }, { 'If-Match': '1' });
  assert.equal(stale.status, 409);

  const clientView = await request('GET', `/projects/${projectId}/specforge`, identities.client);
  assert.equal(clientView.status, 200, JSON.stringify(clientView.body));
  assert.deepEqual(clientView.body.workspace.items.map(item => item.code), ['CLIENT']);
  const supplierView = await request('GET', `/projects/${projectId}/specforge`, identities.supplier);
  assert.equal(supplierView.status, 200, JSON.stringify(supplierView.body));
  assert.deepEqual(supplierView.body.workspace.items.map(item => item.code), ['TILING']);

  const isolated = await request('GET', `/projects/${projectId}/specforge`, identities.otherOrganization);
  assert.equal(isolated.status, 404);

  const forbiddenIssue = await request('POST', `/projects/${projectId}/specforge/issues`, identities.qs, { title: 'QS issue', audience: 'Tender' }, { 'Idempotency-Key': 'qs-issue-v1' });
  assert.equal(forbiddenIssue.status, 403);

  const validation = await request('POST', `/projects/${projectId}/specforge/issues/validate`, identities.architect, {});
  assert.equal(validation.status, 200);
  assert.equal(validation.body.ready, true);

  const issueBody = { title: 'Tender issue P06', audience: 'Tender' };
  const issued = await request('POST', `/projects/${projectId}/specforge/issues`, identities.architect, issueBody, { 'Idempotency-Key': 'issue-p06-v1' });
  assert.equal(issued.status, 201);
  const replay = await request('POST', `/projects/${projectId}/specforge/issues`, identities.architect, issueBody, { 'Idempotency-Key': 'issue-p06-v1' });
  assert.equal(replay.status, 200);
  assert.equal(replay.body.issue.id, issued.body.issue.id);
  assert.equal(replay.body.idempotent, true);

  const reload = await request('GET', `/projects/${projectId}/specforge`, identities.architect);
  assert.equal(reload.body.workspace.items.length, 4);
  assert.equal(reload.body.workspace.issues.length, 1);

  const audit = await request('GET', `/projects/${projectId}/specforge/audit`, identities.architect);
  assert.equal(audit.status, 200);
  assert(audit.body.events.some(event => event.action_key === 'specforge.issue.created'));

  console.log('SpecForge authenticated API contract passed.');
} finally {
  server.kill();
  if (process.env.SPECFORGE_TEST_DEBUG === '1' && serverErrors) process.stderr.write(serverErrors);
}
