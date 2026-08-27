import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const port = await new Promise((resolvePort, reject) => {
  const probe = createServer();
  probe.unref();
  probe.on('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const address = probe.address();
    if (!address || typeof address === 'string') { probe.close(); reject(new Error('Could not allocate an isolated API port')); return; }
    probe.close(error => error ? reject(error) : resolvePort(address.port));
  });
});
const origin = `http://127.0.0.1:${port}`;
const secret = 'specforge-isolated-api-test-secret';
const database = process.env.SPECFORGE_TEST_DB;
const projectId = 'proj-camps-bay';

assert.ok(database, 'SPECFORGE_TEST_DB must be supplied by the disposable test harness');
assert.match(database, /^architex_specforge_[0-9]+_[a-f0-9]{12}_test$/, 'SpecForge API tests require a unique disposable schema');
assert(!readFileSync(resolve(root, 'backend/public/index.php'), 'utf8').includes('/specforge/seed'), 'the API must not expose a SpecForge seed route');

const databaseEnv = {
  ...process.env,
  APP_ENV: 'test',
  ARCHITEX_DATA_MODE: 'prototype',
  ARCHITEX_ENABLE_DEMO_SEED: '1',
  DB_HOST: process.env.SPECFORGE_TEST_DB_HOST ?? 'localhost',
  DB_NAME: database,
  DB_USER: process.env.SPECFORGE_TEST_DB_USER ?? 'root',
  DB_PASS: process.env.SPECFORGE_TEST_DB_PASS ?? '',
};

function runPhp(args, env = databaseEnv) {
  return spawnSync('php', args, { cwd: root, env, encoding: 'utf8', windowsHide: true });
}

function specForgeSeedCount() {
  const result = runPhp(['-r', '$c=require "backend/config.php"; $d=$c["database"]; $p=new PDO("mysql:host={$d[\'host\']};dbname={$d[\'name\']};charset=utf8mb4",$d["user"],$d["pass"]); echo $p->query("SELECT COUNT(*) FROM specforge_items WHERE workspace_id=\'specforge-workspace-faerie-glen\'")->fetchColumn();']);
  assert.equal(result.status, 0, result.stderr);
  return Number(result.stdout.trim());
}

function issueSnapshots(issueId) {
  const code = '$c=require "backend/config.php"; $d=$c["database"]; $p=new PDO("mysql:host={$d[\'host\']};dbname={$d[\'name\']};charset=utf8mb4",$d["user"],$d["pass"]); $s=$p->prepare("SELECT source_type,source_id,snapshot_json FROM specforge_issue_items WHERE organization_id=? AND issue_id=? ORDER BY ordinal,id"); $s->execute(["org-demo",$argv[1]]); echo json_encode($s->fetchAll(PDO::FETCH_ASSOC), JSON_THROW_ON_ERROR);';
  const result = runPhp(['-r', code, issueId]);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

const productionSeed = runPhp(['backend/database/seed.php'], { ...databaseEnv, APP_ENV: 'production', ARCHITEX_DATA_MODE: 'production' });
assert.notEqual(productionSeed.status, 0, 'production data mode must reject the prototype seeder');

const firstSeed = runPhp(['backend/database/seed.php']);
assert.equal(firstSeed.status, 0, firstSeed.stderr);
const firstSeedCount = specForgeSeedCount();
assert(firstSeedCount > 0, 'prototype seed must persist SpecForge records');
const secondSeed = runPhp(['backend/database/seed.php']);
assert.equal(secondSeed.status, 0, secondSeed.stderr);
assert.equal(specForgeSeedCount(), firstSeedCount, 'prototype seed must be idempotent');

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

async function authRequest(path, body, cookie = '') {
  const response = await fetch(`${origin}/api/v1${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Connection: 'close',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  return { status: response.status, body: payload, headers: response.headers };
}

const server = spawn('php', ['-S', `127.0.0.1:${port}`, 'backend/public/index.php'], {
  cwd: root,
  env: {
    ...process.env,
    ...databaseEnv,
    JWT_SECRET: secret,
    CORS_ORIGIN: 'https://test.architex.co.za',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

let serverErrors = '';
server.stderr.on('data', chunk => { serverErrors += chunk.toString(); });

try {
  let serverReady = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(`${origin}/api/v1/health`)).status) { serverReady = true; break; } } catch {}
    if (server.exitCode !== null) break;
    await delay(100);
  }
  assert.equal(serverReady, true, `isolated API server did not start on ${origin}: ${serverErrors}`);

  const supplierLogin = await authRequest('/auth/login', {
    email: 'supplier@architex-os.local',
    password: 'demo-user-demo-supplier',
  });
  assert.equal(supplierLogin.status, 200, JSON.stringify(supplierLogin.body));
  const supplierCookie = supplierLogin.headers.get('set-cookie')?.split(';', 1)[0] ?? '';
  assert.match(supplierCookie, /^architex_refresh=/, 'supplier login must establish a refresh session');
  const seededSupplierView = await request('GET', '/projects/proj-faerie-glen/specforge', supplierLogin.body.access_token);
  assert.equal(seededSupplierView.status, 200, JSON.stringify(seededSupplierView.body));
  assert.deepEqual(seededSupplierView.body.workspace.items.map(item => item.title), ['Issued porcelain floor tile']);

  const supplierRefresh = await authRequest('/auth/refresh', undefined, supplierCookie);
  assert.equal(supplierRefresh.status, 200, JSON.stringify(supplierRefresh.body));
  const refreshedSupplierView = await request('GET', '/projects/proj-faerie-glen/specforge', supplierRefresh.body.access_token);
  assert.equal(refreshedSupplierView.status, 200, JSON.stringify(refreshedSupplierView.body));
  assert.deepEqual(refreshedSupplierView.body.workspace.items.map(item => item.title), ['Issued porcelain floor tile']);

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

  const sourceRequest = await request('POST', `/projects/${projectId}/specforge/source-requests`, identities.architect, {
    source_method: 'supplier_url', source_reference: 'https://supplier.invalid/catalogue/item-1',
  }, { 'Idempotency-Key': 'source-supplier-url-v1' });
  assert.equal(sourceRequest.status, 201);
  assert.equal(sourceRequest.body.request.status, 'integration_required');
  const sourceReplay = await request('POST', `/projects/${projectId}/specforge/source-requests`, identities.architect, {
    source_method: 'supplier_url', source_reference: 'https://supplier.invalid/catalogue/item-1',
  }, { 'Idempotency-Key': 'source-supplier-url-v1' });
  assert.equal(sourceReplay.status, 200);
  assert.equal(sourceReplay.body.idempotent, true);

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
  const boqItem = await createItem('boq-line', {});
  await createItem('roofing', { package_name: 'Roofing', status: 'issued' });
  assert.equal(clientItem.status, 201);
  assert.equal(tilingItem.status, 201);
  assert.equal(boqItem.status, 201);

  const boqUpdate = await request('PATCH', `/projects/${projectId}/specforge/items/${boqItem.body.item.id}/boq-line`, identities.qs, {
    quantity: 12.5, unit: 'm²', unit_rate: 800, quantity_source_type: 'drawing', quantity_source_ref: 'A-420 P06', rate_source_type: 'supplier_quote', rate_source_ref: 'Q-1042',
  }, { 'If-Match': '1' });
  assert.equal(boqUpdate.status, 200, JSON.stringify(boqUpdate.body));
  assert.equal(boqUpdate.body.item.quantity, 12.5);
  assert.equal(boqUpdate.body.item.unit_rate, 800);
  assert.equal(boqUpdate.body.item.quantity_source_ref, 'A-420 P06');
  assert.equal(boqUpdate.body.item.rate_source_ref, 'Q-1042');
  assert.equal(boqUpdate.body.item.lock_version, 2);
  const staleBoqUpdate = await request('PATCH', `/projects/${projectId}/specforge/items/${boqItem.body.item.id}/boq-line`, identities.qs, {
    quantity: 13, unit: 'm²', unit_rate: 800, quantity_source_type: 'drawing', quantity_source_ref: 'A-420 P06', rate_source_type: 'supplier_quote', rate_source_ref: 'Q-1042',
  }, { 'If-Match': '1' });
  assert.equal(staleBoqUpdate.status, 409);
  const deniedBoqUpdate = await request('PATCH', `/projects/${projectId}/specforge/items/${boqItem.body.item.id}/boq-line`, identities.supplier, {
    quantity: 13, unit: 'm²', unit_rate: 800, quantity_source_type: 'drawing', quantity_source_ref: 'A-420 P06', rate_source_type: 'supplier_quote', rate_source_ref: 'Q-1042',
  }, { 'If-Match': '2' });
  assert.equal(deniedBoqUpdate.status, 403);

  const budgetReview = await request('PATCH', `/projects/${projectId}/specforge`, identities.qs, { budget_reviewed_at: '2026-08-26 11:00:00' }, { 'If-Match': '1' });
  assert.equal(budgetReview.status, 200);
  assert.equal(budgetReview.body.workspace.lock_version, 2);
  const sectionUpdate = await request('PATCH', `/projects/${projectId}/specforge/sections/${section.body.section.id}`, identities.architect, { title: 'Architectural finishes' }, { 'If-Match': '1' });
  assert.equal(sectionUpdate.status, 200);
  const duplicate = await request('POST', `/projects/${projectId}/specforge/items/${tilingItem.body.item.id}/duplicate`, identities.architect, {}, { 'Idempotency-Key': 'duplicate-tiling-v1' });
  assert.equal(duplicate.status, 201);
  assert.equal(duplicate.body.item.status, 'draft');

  const quoted = await request('POST', `/projects/${projectId}/specforge/items/${tilingItem.body.item.id}/procurement-transition`, identities.architect, {
    target_status: 'quoted', expected_version: 1,
  }, { 'Idempotency-Key': 'procurement-tiling-quoted-v1' });
  assert.equal(quoted.status, 201, JSON.stringify(quoted.body));
  assert.equal(quoted.body.transition.from_status, 'issued');
  assert.equal(quoted.body.transition.to_status, 'quoted');
  assert.equal(quoted.body.transition.connector_status, 'integration_required');
  assert.equal(quoted.body.item.status, 'quoted');
  const quotedReplay = await request('POST', `/projects/${projectId}/specforge/items/${tilingItem.body.item.id}/procurement-transition`, identities.architect, {
    target_status: 'quoted', expected_version: 1,
  }, { 'Idempotency-Key': 'procurement-tiling-quoted-v1' });
  assert.equal(quotedReplay.status, 200);
  assert.equal(quotedReplay.body.idempotent, true);
  const invalidProcurement = await request('POST', `/projects/${projectId}/specforge/items/${tilingItem.body.item.id}/procurement-transition`, identities.architect, {
    target_status: 'delivered', expected_version: 2,
  }, { 'Idempotency-Key': 'procurement-tiling-invalid-v1' });
  assert.equal(invalidProcurement.status, 409);

  const approvalRequest = await request('POST', `/projects/${projectId}/specforge/items/${clientItem.body.item.id}/approvals`, identities.architect, {
    approval_type: 'client_decision', requested_role: 'client', requested_user_id: 'user-demo-client', due_at: '2026-08-30 12:00:00',
  }, { 'Idempotency-Key': 'client-approval-v1' });
  assert.equal(approvalRequest.status, 201);
  const blockedValidation = await request('POST', `/projects/${projectId}/specforge/issues/validate`, identities.architect, {});
  assert.deepEqual(blockedValidation.body, { ready: false, codes: ['APPROVALS_PENDING', 'RESPONSIBILITY_PENDING'] });
  const approvalDecision = await request('POST', `/projects/${projectId}/specforge/approvals/${approvalRequest.body.approval.id}/decision`, identities.client, {
    decision: 'approved', decision_note: 'Approved for tender issue',
  }, { 'Idempotency-Key': 'client-approval-decision-v1' });
  assert.equal(approvalDecision.status, 201);
  assert.equal(approvalDecision.body.approval.status, 'approved');
  const responsibilityBlocked = await request('POST', `/projects/${projectId}/specforge/issues/validate`, identities.architect, {});
  assert.deepEqual(responsibilityBlocked.body, { ready: false, codes: ['RESPONSIBILITY_PENDING'] });
  const responsibility = await request('POST', `/projects/${projectId}/specforge/responsibility-confirmations`, identities.architect, {}, { 'Idempotency-Key': 'responsibility-p06-v1' });
  assert.equal(responsibility.status, 201);
  assert.equal(responsibility.body.confirmation.revision, 'P06');
  const responsibilityReplay = await request('POST', `/projects/${projectId}/specforge/responsibility-confirmations`, identities.architect, {}, { 'Idempotency-Key': 'responsibility-p06-v1' });
  assert.equal(responsibilityReplay.status, 200);
  assert.equal(responsibilityReplay.body.idempotent, true);

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
  assert.equal(issued.body.downstream.length, 7);
  assert.deepEqual(issued.body.downstream.map(job => job.job_type).sort(), [
    'specforge.action-centre', 'specforge.bom-sync', 'specforge.document', 'specforge.escrow',
    'specforge.messaging', 'specforge.programme', 'specforge.rfq',
  ]);
  assert(issued.body.downstream.every(job => job.status === 'pending'));
  const replay = await request('POST', `/projects/${projectId}/specforge/issues`, identities.architect, issueBody, { 'Idempotency-Key': 'issue-p06-v1' });
  assert.equal(replay.status, 200);
  assert.equal(replay.body.issue.id, issued.body.issue.id);
  assert.equal(replay.body.idempotent, true);
  const conflictingReplay = await request('POST', `/projects/${projectId}/specforge/issues`, identities.architect, { ...issueBody, audience: 'Contractor' }, { 'Idempotency-Key': 'issue-p06-v1' });
  assert.equal(conflictingReplay.status, 409);

  const snapshotsBeforeSuccessor = issueSnapshots(issued.body.issue.id);
  assert(snapshotsBeforeSuccessor.some(row => row.source_type === 'responsibility'));
  const issuedHashBeforeSuccessor = issued.body.issue.snapshot_hash;
  const successor = await request('PATCH', `/projects/${projectId}/specforge/items/${clientItem.body.item.id}`, identities.architect, { title: 'Client tile P07 draft' }, { 'If-Match': '2' });
  assert.equal(successor.status, 200, JSON.stringify(successor.body));
  assert.equal(successor.body.successor_created, true);
  assert.equal(successor.body.source_item_id, clientItem.body.item.id);
  assert.notEqual(successor.body.item.id, clientItem.body.item.id);
  assert.equal(successor.body.item.status, 'draft');
  assert.equal(successor.body.item.source_revision, 'P07');
  const staleIssuedEdit = await request('PATCH', `/projects/${projectId}/specforge/items/${clientItem.body.item.id}`, identities.architect, { title: 'Stale issued overwrite' }, { 'If-Match': '2' });
  assert.equal(staleIssuedEdit.status, 409);
  const successorReload = await request('GET', `/projects/${projectId}/specforge`, identities.architect);
  const issuedSource = successorReload.body.workspace.items.find(item => item.id === clientItem.body.item.id);
  assert.equal(issuedSource.title, 'Client tile revised');
  assert.equal(issuedSource.superseded_by, successor.body.item.id);
  assert.equal(successorReload.body.workspace.items.find(item => item.id === successor.body.item.id).title, 'Client tile P07 draft');
  assert.deepEqual(issueSnapshots(issued.body.issue.id), snapshotsBeforeSuccessor);
  assert.equal(successorReload.body.workspace.issues.find(issue => issue.id === issued.body.issue.id).snapshot_hash, issuedHashBeforeSuccessor);

  const drawingScan = await request('POST', `/projects/${projectId}/specforge/drawing-scans`, identities.architect, { drawing_revision_id: 'drawing-revision-p06' }, { 'Idempotency-Key': 'drawing-scan-p06-v1' });
  assert.equal(drawingScan.status, 202);
  assert.equal(drawingScan.body.job.job_type, 'ai_drawing_scan');

  const worker = runPhp(['backend/worker.php', '--batch=20', '--once']);
  assert.equal(worker.status, 0, worker.stderr || worker.stdout);
  const jobs = await request('GET', `/projects/${projectId}/specforge/jobs?issue_id=${issued.body.issue.id}`, identities.architect);
  assert.equal(jobs.status, 200);
  assert.equal(jobs.body.jobs.length, 7);
  if (!jobs.body.jobs.every(job => job.status === 'integration_required')) {
    console.error(JSON.stringify({ worker: { stdout: worker.stdout, stderr: worker.stderr }, jobs: jobs.body.jobs }, null, 2));
  }
  assert(jobs.body.jobs.every(job => job.status === 'integration_required'));
  assert(jobs.body.jobs.every(job => typeof job.last_error === 'string' && job.last_error.includes('not configured')));
  const clientJobs = await request('GET', `/projects/${projectId}/specforge/jobs?issue_id=${issued.body.issue.id}`, identities.client);
  assert.equal(clientJobs.status, 403, 'downstream operational jobs require issue capability');

  const reload = await request('GET', `/projects/${projectId}/specforge`, identities.architect);
  assert.equal(reload.body.workspace.items.length, 6);
  assert.deepEqual(
    Object.fromEntries(['quantity','unit','unit_rate','quantity_source_type','quantity_source_ref','rate_source_type','rate_source_ref'].map(field => [field, reload.body.workspace.items.find(item => item.id === boqItem.body.item.id)[field]])),
    { quantity: 12.5, unit: 'm²', unit_rate: 800, quantity_source_type: 'drawing', quantity_source_ref: 'A-420 P06', rate_source_type: 'supplier_quote', rate_source_ref: 'Q-1042' },
  );
  assert.equal(reload.body.workspace.issues.length, 1);
  assert.equal(reload.body.workspace.commands.find(command => command.route_key === 'source.request').status, 'integration_required');

  const audit = await request('GET', `/projects/${projectId}/specforge/audit`, identities.architect);
  assert.equal(audit.status, 200);
  assert(audit.body.events.some(event => event.action_key === 'specforge.issue.created'));
  assert(audit.body.events.some(event => event.action_key === 'specforge.source.integration_required'));
  assert(audit.body.events.some(event => event.action_key === 'specforge.boq.updated'));
  const denial = audit.body.events.find(event => event.action_key === 'specforge.authorization.denied' && event.actor_user_id === 'user-demo-bep');
  assert.equal(denial.after.project_id, projectId);
  assert.equal(denial.after.capability, 'issue');
  assert.equal(denial.after.reason, 'capability');
  assert.equal(JSON.stringify(denial.after).includes(clientItem.body.item.id), false);

  console.log('SpecForge authenticated API contract passed.');
} finally {
  server.kill();
  if (process.env.SPECFORGE_TEST_DEBUG === '1' && serverErrors) process.stderr.write(serverErrors);
}
