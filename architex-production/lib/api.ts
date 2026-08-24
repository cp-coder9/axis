import type { CalculatorId, EngineeringCalculationPayloadV1 } from '@/lib/calculations/types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';

/**
 * Local-demo identity headers. The API accepts header identity only when
 * APP_ENV=local; production uses bearer JWTs issued by /auth/login.
 */
export function localIdentityHeaders(role: string, userId: string): Record<string, string> {
  return {
    'X-Architex-Role': role,
    'X-Architex-User': userId,
  };
}

/** Demo user IDs seeded in MariaDB (backend/database/seed.php). */
const DEMO_USERS: Record<string, string> = {
  architect: 'user-demo-architect',
  bep: 'user-demo-bep',
  client: 'user-demo-client',
  town_planner: 'user-demo-town-planner',
  energy_professional: 'user-demo-energy-professional',
};

/** Resolve a demo identity for the active role (local mode only). */
export function demoIdentity(role: string): { role: string; userId: string } {
  return { role, userId: DEMO_USERS[role] ?? 'user-demo-architect' };
}

export async function apiGet<T>(path: string, identity?: { role: string; userId: string }): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(identity ? localIdentityHeaders(identity.role, identity.userId) : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Architex API ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  identity?: { role: string; userId: string },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(identity ? localIdentityHeaders(identity.role, identity.userId) : {}),
  };
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Architex API ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

export type ApiHealth = {
  status: 'ok';
  service: string;
  version: string;
};

export type ApiFeedbackResponse = {
  id: string;
  status: string;
  message: string;
};

/* ---------- Project registry (MariaDB write path) ---------- */

export type ApiProject = {
  id: string;
  code: string;
  name: string;
  location: string;
  stage: 'Brief' | 'Appoint' | 'Design' | 'Comply' | 'Procure' | 'Build' | 'Pay' | 'Close-out';
  progress: number;
  client: string;
  professional: string;
  municipality: string;
  revision: string;
  budget: number | null;
};

export type CreateProjectPayload = {
  name: string;
  code: string;
  location?: string;
  stage?: ApiProject['stage'];
  progress?: number;
  client?: string;
  professional?: string;
  municipality?: string;
  revision?: string;
  budget?: number | null;
};

/* ---------- Foundation module endpoints (PRD §12) ---------- */

export type ApiPassport = {
  project_id: string;
  version: number;
  project_type: string;
  brief_summary: string;
  site_description: string;
  statutory_route: string;
  constraints: string[];
  required_professionals: string[];
  approval_requirements: string[];
  status: 'draft' | 'published';
  updated_by?: string;
  updated_at?: string;
  published_by?: string;
  published_at?: string;
};

export type ApiDocument = {
  id: string;
  project_id: string;
  number: string;
  title: string;
  type: string;
  discipline: string | null;
  revision: string;
  status: string;
  issue_purpose: string;
  updated_at: string;
};

export type ApiActionItem = {
  id: string;
  project_id: string;
  title: string;
  owner: string;
  due: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'blocked' | 'done' | 'cancelled';
  source: string;
};

export type ApiApprovalStep = { role: string; status: string };

export type ApiApproval = {
  id: string;
  project_id: string;
  title: string;
  entity_type: string;
  entity_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_by: string;
  requested_at: string;
  current_step: number;
  steps: ApiApprovalStep[];
};

export async function apiPatch<T>(
  path: string,
  body: unknown,
  identity?: { role: string; userId: string },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(identity ? localIdentityHeaders(identity.role, identity.userId) : {}),
  };
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Architex API ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

export const architexApi = {
  projects: {
    list: (identity?: { role: string; userId: string }) =>
      apiGet<{ projects: ApiProject[]; count: number }>('/projects', identity).then((r) => r.projects),
    get: (projectId: string, identity?: { role: string; userId: string }) =>
      apiGet<{ project: ApiProject }>(`/projects/${projectId}`, identity).then((r) => r.project),
    create: (body: CreateProjectPayload, identity: { role: string; userId: string }) =>
      apiPost<{ project: ApiProject }>('/projects', body, identity).then((r) => r.project),
    update: (projectId: string, body: Partial<CreateProjectPayload>, identity: { role: string; userId: string }) =>
      apiPatch<{ project: ApiProject }>(`/projects/${projectId}`, body, identity).then((r) => r.project),
  },
  passport: {
    get: (projectId: string, identity: { role: string; userId: string }) =>
      apiGet<{ passport: ApiPassport }>(`/projects/${projectId}/passport`, identity).then((r) => r.passport),
    draft: (projectId: string, body: Record<string, unknown>, identity: { role: string; userId: string }) =>
      apiPatch<{ passport: ApiPassport }>(`/projects/${projectId}/passport`, body, identity).then((r) => r.passport),
    publish: (projectId: string, identity: { role: string; userId: string }) =>
      apiPost<{ passport: ApiPassport }>(`/projects/${projectId}/passport/publish`, {}, identity).then((r) => r.passport),
  },
  documents: {
    list: (projectId: string, identity: { role: string; userId: string }) =>
      apiGet<{ documents: ApiDocument[] }>(`/documents?project=${projectId}`, identity).then((r) => r.documents),
    add: (body: Record<string, unknown>, identity: { role: string; userId: string }) =>
      apiPost<{ document: ApiDocument }>('/documents', body, identity).then((r) => r.document),
    update: (id: string, body: Record<string, unknown>, identity: { role: string; userId: string }) =>
      apiPatch<{ document: ApiDocument }>(`/documents/${id}`, body, identity).then((r) => r.document),
  },
  actions: {
    list: (projectId: string, identity: { role: string; userId: string }) =>
      apiGet<{ actions: ApiActionItem[] }>(`/action-items?project=${projectId}`, identity).then((r) => r.actions),
    update: (id: string, body: Record<string, unknown>, identity: { role: string; userId: string }) =>
      apiPatch<{ action: ApiActionItem }>(`/action-items/${id}`, body, identity).then((r) => r.action),
    create: (body: Pick<ApiActionItem, 'project_id' | 'title'> & { due?: string | null }, identity: { role: string; userId: string }) =>
      apiPost<{ action: ApiActionItem }>('/action-items', body, identity).then((r) => r.action),
  },
  approvals: {
    list: (projectId: string, identity: { role: string; userId: string }) =>
      apiGet<{ approvals: ApiApproval[] }>(`/approvals?project=${projectId}`, identity).then((r) => r.approvals),
    decide: (id: string, decision: 'approve' | 'reject', body: Record<string, unknown>, identity: { role: string; userId: string }) =>
      apiPost<{ approval: ApiApproval }>(`/approvals/${id}/${decision}`, body, identity).then((r) => r.approval),
  },
  meetings: {
    get: (meetingId: string, identity: { role: string; userId: string }) =>
      apiGet<{ meeting: ApiMeeting }>(`/meetings/${meetingId}`, identity).then((r) => r.meeting),
    decideOutcome: (meetingId: string, outcomeId: string, decision: 'accept' | 'reject', identity: { role: string; userId: string }) =>
      apiPost<{ outcome: ApiMeetingOutcome }>(`/meetings/${meetingId}/outcomes/${outcomeId}/${decision}`, {}, identity).then((r) => r.outcome),
    publish: (meetingId: string, identity: { role: string; userId: string }) =>
      apiPost<{ meeting: ApiMeeting; idempotent?: boolean; write_backs?: number }>(`/meetings/${meetingId}/publish`, {}, identity),
  },
};

export type ApiMeetingOutcome = {
  id: string;
  title: string;
  status: 'pending' | 'accepted' | 'rejected';
  destination: string | null;
  reviewed_by?: string;
  reviewed_at?: string;
};

export type ApiMeeting = {
  id: string;
  project_id: string;
  title: string;
  status: string;
  chair: string;
  chair_label?: string;
  published_revision: string | null;
  outcomes: ApiMeetingOutcome[];
  policy?: Record<string, unknown>;
  consent?: Record<string, unknown>;
};

/* ---------- Engineering Calculation Hub (v8) ---------- */

export type ApiCalculationRecord = EngineeringCalculationPayloadV1 & {
  id: string;
  organization_id: string;
  project_id: string | null;
  calc_type: CalculatorId;
  status: 'saved' | 'under_review' | 'approved';
  author_id: string;
  linked_drawing_ref: string | null;
  linked_meeting_id: string | null;
  linked_rfi_id: string | null;
  lock_version: number;
  created_at: string;
  updated_at: string;
};

export type CreateCalculationPayload = EngineeringCalculationPayloadV1 & {
  project_id: string | null;
  linked_drawing_ref?: string | null;
  linked_meeting_id?: string | null;
  linked_rfi_id?: string | null;
};

type ApiIdentity = { role: string; userId: string };

async function engineeringRequest<T>(path: string, method: 'GET' | 'POST' | 'PATCH', identity: ApiIdentity, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method, headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...localIdentityHeaders(identity.role, identity.userId), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`Architex API ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}

export const architexApiEngineering = {
  list: (projectId: string | null, identity: ApiIdentity) => engineeringRequest<{ calculations: ApiCalculationRecord[] }>(`/engineering/calculations${projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''}`, 'GET', identity).then((response) => response.calculations),
  create: (body: CreateCalculationPayload, identity: ApiIdentity, idempotencyKey = crypto.randomUUID()) => engineeringRequest<{ calculation: ApiCalculationRecord }>('/engineering/calculations', 'POST', identity, body, { 'Idempotency-Key': idempotencyKey }).then((response) => response.calculation),
  get: (id: string, identity: ApiIdentity) => engineeringRequest<{ calculation: ApiCalculationRecord }>(`/engineering/calculations/${id}`, 'GET', identity).then((response) => response.calculation),
  update: (id: string, body: CreateCalculationPayload, lockVersion: number, identity: ApiIdentity) => engineeringRequest<{ calculation: ApiCalculationRecord }>(`/engineering/calculations/${id}`, 'PATCH', identity, body, { 'If-Match': String(lockVersion) }).then((response) => response.calculation),
  derivation: (id: string, identity: ApiIdentity) => engineeringRequest<Pick<ApiCalculationRecord, 'id' | 'calc_type' | 'calculatorId' | 'formulaVersion' | 'results' | 'derivation' | 'assumptions' | 'limitations' | 'references' | 'lock_version' | 'updated_at'>>(`/engineering/calculations/${id}/derivation`, 'GET', identity),
  review: (id: string, action: 'submit' | 'approve' | 'return', lockVersion: number, identity: ApiIdentity, note?: string, idempotencyKey = crypto.randomUUID()) => engineeringRequest<{ calculation: ApiCalculationRecord }>(`/engineering/calculations/${id}/review`, 'POST', identity, { action, ...(note ? { note } : {}) }, { 'If-Match': String(lockVersion), 'Idempotency-Key': idempotencyKey }).then((response) => response.calculation),
};

/* ---------- User management (admin & platform_admin) ---------- */

export type ApiUserRecord = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'invited' | 'disabled';
  roles: string[];
  created_at: string;
};

export type ApiUpdateUserPayload = {
  name?: string;
  email?: string;
  status?: 'active' | 'invited' | 'disabled';
};

export const architexApiUsers = {
  list: (identity: ApiIdentity) =>
    apiGet<{ users: ApiUserRecord[] }>('/users', identity).then((r) => r.users),
  invite: (body: { name: string; email: string; role_key?: string }, identity: ApiIdentity) =>
    apiPost<{ user: ApiUserRecord }>('/users', body, identity).then((r) => r.user),
  update: (id: string, body: ApiUpdateUserPayload, identity: ApiIdentity) =>
    apiPatch<{ user: ApiUserRecord }>(`/users/${id}`, body, identity).then((r) => r.user),
  assignRole: (id: string, roleKey: string, identity: ApiIdentity) =>
    apiPost<{ user: ApiUserRecord }>(`/users/${id}/roles`, { role_key: roleKey }, identity).then((r) => r.user),
  removeRole: (id: string, roleKey: string, identity: ApiIdentity) =>
    apiPost<{ user: ApiUserRecord }>(`/users/${id}/roles/${roleKey}/remove`, {}, identity).then((r) => r.user),
};
