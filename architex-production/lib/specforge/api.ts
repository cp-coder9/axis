import { authenticatedFetch } from '@/lib/auth-session';
import { API_BASE_URL } from '@/lib/api';
import type {
  SpecForgeAggregate,
  SpecForgeApproval,
  SpecForgeCommand,
  SpecForgeDrawingFinding,
  SpecForgeDownstreamJob,
  SpecForgeIssue,
  SpecForgeIssueResult,
  SpecForgeItem,
  SpecForgeProcurementResult,
  SpecForgeProcurementTarget,
  SpecForgeResponsibilityConfirmation,
  SpecForgeSection,
  UpdateSpecForgeBoqLineInput,
} from '@/lib/specforge/types';
import type { RoleKey, StageKey } from '@/lib/types';

export class SpecForgeApiError extends Error {
  constructor(readonly status: number, readonly body: Record<string, unknown>) {
    super(typeof body.error === 'string' ? body.error : `SpecForge API ${status}`);
    this.name = 'SpecForgeApiError';
  }
}

type ApiRecord = Record<string, unknown>;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await authenticatedFetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new SpecForgeApiError(response.status, body);
  return body as T;
}

const stringValue = (value: unknown, fallback = ''): string => typeof value === 'string' ? value : fallback;
const nullableString = (value: unknown): string | null => typeof value === 'string' ? value : null;
const numberValue = (value: unknown): number => typeof value === 'number' ? value : Number(value ?? 0);

function mapSection(row: ApiRecord): SpecForgeSection {
  return {
    id: stringValue(row.id), code: stringValue(row.code), title: stringValue(row.title), discipline: stringValue(row.discipline),
    ownerRole: stringValue(row.owner_role) as RoleKey, reviewerRole: nullableString(row.reviewer_role) as RoleKey | null,
    status: stringValue(row.status) as SpecForgeSection['status'], lockVersion: numberValue(row.lock_version),
  };
}

function mapItem(row: ApiRecord): SpecForgeItem {
  return {
    id: stringValue(row.id), sectionId: stringValue(row.section_id), code: stringValue(row.code), title: stringValue(row.title),
    room: stringValue(row.room), packageName: stringValue(row.package_name), description: stringValue(row.description),
    imageUrl: nullableString(row.image_url), supplier: nullableString(row.supplier), model: nullableString(row.model),
    finish: nullableString(row.finish), dimensions: nullableString(row.dimensions), budgetAllowance: numberValue(row.budget_allowance),
    estimatedCost: numberValue(row.estimated_cost), leadTimeDays: numberValue(row.lead_time_days),
    quantity: row.quantity === null || row.quantity === undefined ? null : numberValue(row.quantity), unit: nullableString(row.unit),
    unitRate: row.unit_rate === null || row.unit_rate === undefined ? null : numberValue(row.unit_rate),
    quantitySourceType: nullableString(row.quantity_source_type) as SpecForgeItem['quantitySourceType'], quantitySourceRef: nullableString(row.quantity_source_ref),
    rateSourceType: nullableString(row.rate_source_type) as SpecForgeItem['rateSourceType'], rateSourceRef: nullableString(row.rate_source_ref), clientDecision: Boolean(row.client_decision),
    ownerRole: stringValue(row.owner_role) as RoleKey, reviewerRole: nullableString(row.reviewer_role) as RoleKey | null,
    approverRole: nullableString(row.approver_role) as RoleKey | null, status: stringValue(row.status) as SpecForgeItem['status'],
    sourceRevision: stringValue(row.source_revision), supersededBy: nullableString(row.superseded_by), lockVersion: numberValue(row.lock_version),
  };
}

function mapApproval(row: ApiRecord): SpecForgeApproval {
  return {
    id: stringValue(row.id), itemId: stringValue(row.item_id), approvalType: stringValue(row.approval_type),
    requestedRole: stringValue(row.requested_role) as RoleKey, requestedUserId: nullableString(row.requested_user_id),
    status: stringValue(row.status) as SpecForgeApproval['status'], decisionNote: nullableString(row.decision_note), dueAt: nullableString(row.due_at),
  };
}

function mapFinding(row: ApiRecord): SpecForgeDrawingFinding {
  return {
    id: stringValue(row.id), itemId: nullableString(row.item_id), drawingRevisionId: stringValue(row.drawing_revision_id),
    severity: stringValue(row.severity) as SpecForgeDrawingFinding['severity'], finding: stringValue(row.finding),
    status: stringValue(row.status) as SpecForgeDrawingFinding['status'],
  };
}

function mapIssue(row: ApiRecord): SpecForgeIssue {
  return {
    id: stringValue(row.id), revision: stringValue(row.revision), title: stringValue(row.title), audience: stringValue(row.audience),
    status: stringValue(row.status) as SpecForgeIssue['status'], snapshotHash: stringValue(row.snapshot_hash), issuedAt: nullableString(row.issued_at),
  };
}

function mapCommand(row: ApiRecord): SpecForgeCommand {
  return {
    id: stringValue(row.id), commandType: stringValue(row.route_key), status: stringValue(row.status) as SpecForgeCommand['status'],
    lastError: nullableString(row.last_error),
  };
}

function mapResponsibility(row: ApiRecord): SpecForgeResponsibilityConfirmation {
  return { id: stringValue(row.id), revision: stringValue(row.revision), professionalRole: stringValue(row.professional_role) as RoleKey, statementText: stringValue(row.statement_text), confirmedBy: stringValue(row.confirmed_by), confirmedAt: stringValue(row.confirmed_at) };
}

function mapDownstreamJob(row: ApiRecord): SpecForgeDownstreamJob {
  return {
    id: stringValue(row.id), jobType: stringValue(row.job_type), status: stringValue(row.status) as SpecForgeDownstreamJob['status'],
    lastError: nullableString(row.last_error),
  };
}

export function mapSpecForgeAggregate(row: ApiRecord): SpecForgeAggregate {
  return {
    id: stringValue(row.id), organizationId: stringValue(row.organization_id), projectId: stringValue(row.project_id),
    projectName: stringValue(row.project_name), profile: stringValue(row.profile), stage: stringValue(row.stage) as StageKey,
    revision: stringValue(row.revision), issueStatus: stringValue(row.issue_status) as SpecForgeAggregate['issueStatus'],
    lockVersion: numberValue(row.lock_version), budgetReviewedAt: nullableString(row.budget_reviewed_at),
    sections: Array.isArray(row.sections) ? row.sections.map(value => mapSection(value as ApiRecord)) : [],
    items: Array.isArray(row.items) ? row.items.map(value => mapItem(value as ApiRecord)) : [],
    approvals: Array.isArray(row.approvals) ? row.approvals.map(value => mapApproval(value as ApiRecord)) : [],
    responsibilityConfirmations: Array.isArray(row.responsibility_confirmations) ? row.responsibility_confirmations.map(value => mapResponsibility(value as ApiRecord)) : [],
    drawingFindings: Array.isArray(row.drawing_findings) ? row.drawing_findings.map(value => mapFinding(value as ApiRecord)) : [],
    issues: Array.isArray(row.issues) ? row.issues.map(value => mapIssue(value as ApiRecord)) : [],
    commands: Array.isArray(row.commands) ? row.commands.map(value => mapCommand(value as ApiRecord)) : [],
  };
}

export type CreateSpecForgeWorkspaceInput = {
  profile: string;
  stage: StageKey;
  revision: string;
  budgetReviewedAt?: string | null;
};

export type CreateSpecForgeSectionInput = Omit<SpecForgeSection, 'id' | 'lockVersion'> & {
  standardSource?: string | null;
  sourceRevision?: string | null;
};

export type CreateSpecForgeItemInput = Omit<SpecForgeItem, 'id' | 'lockVersion'>;
export type UpdateSpecForgeItemResult = {
  item: SpecForgeItem;
  successorCreated: boolean;
  sourceItemId: string;
};
export type SpecForgeIssueReadiness = { ready: boolean; codes: string[] };
export type SpecForgeSourceMethod = 'supplier_url' | 'image' | 'practice_library';
export type SpecForgeSourceRequestResult = { id: string; sourceMethod: SpecForgeSourceMethod; status: 'integration_required'; message: string; idempotent: boolean };

const commandKey = (): string => globalThis.crypto?.randomUUID?.() ?? `specforge-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const json = (value: unknown): string => JSON.stringify(value);

function sectionBody(input: CreateSpecForgeSectionInput): ApiRecord {
  return {
    code: input.code, title: input.title, discipline: input.discipline, owner_role: input.ownerRole, reviewer_role: input.reviewerRole,
    status: input.status, standard_source: input.standardSource ?? null, source_revision: input.sourceRevision ?? null,
  };
}

function itemBody(input: Partial<CreateSpecForgeItemInput>): ApiRecord {
  const names: Array<[keyof CreateSpecForgeItemInput, string]> = [
    ['sectionId','section_id'], ['code','code'], ['title','title'], ['room','room'], ['packageName','package_name'], ['description','description'],
    ['imageUrl','image_url'], ['supplier','supplier'], ['model','model'], ['finish','finish'], ['dimensions','dimensions'],
    ['budgetAllowance','budget_allowance'], ['estimatedCost','estimated_cost'], ['leadTimeDays','lead_time_days'], ['clientDecision','client_decision'],
    ['ownerRole','owner_role'], ['reviewerRole','reviewer_role'], ['approverRole','approver_role'], ['status','status'],
    ['sourceRevision','source_revision'], ['supersededBy','superseded_by'],
  ];
  return Object.fromEntries(names.filter(([key]) => key in input).map(([key, apiName]) => [apiName, input[key]]));
}

export const specForgeApi = {
  async get(projectId: string): Promise<SpecForgeAggregate | null> {
    try {
      const result = await request<{ workspace: ApiRecord | null }>(`/projects/${encodeURIComponent(projectId)}/specforge`);
      return result.workspace ? mapSpecForgeAggregate(result.workspace) : null;
    } catch (error) {
      if (error instanceof SpecForgeApiError && error.status === 404 && error.body.code === 'SPECFORGE_WORKSPACE_EMPTY') return null;
      throw error;
    }
  },
  createWorkspace: (projectId: string, input: CreateSpecForgeWorkspaceInput, idempotencyKey = commandKey()) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json({ profile: input.profile, stage: input.stage, revision: input.revision, budget_reviewed_at: input.budgetReviewedAt ?? null }) }),
  updateWorkspace: (projectId: string, patch: Partial<Pick<CreateSpecForgeWorkspaceInput, 'profile' | 'stage' | 'budgetReviewedAt'>>, lockVersion: number) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge`, { method: 'PATCH', headers: { 'If-Match': String(lockVersion) }, body: json({ ...patch, ...(Object.hasOwn(patch, 'budgetReviewedAt') ? { budget_reviewed_at: patch.budgetReviewedAt } : {}), budgetReviewedAt: undefined }) }),
  createSection: (projectId: string, input: CreateSpecForgeSectionInput, idempotencyKey = commandKey()) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge/sections`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json(sectionBody(input)) }),
  updateSection: (projectId: string, sectionId: string, patch: Partial<CreateSpecForgeSectionInput>, lockVersion: number) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge/sections/${encodeURIComponent(sectionId)}`, { method: 'PATCH', headers: { 'If-Match': String(lockVersion) }, body: json(sectionBody(patch as CreateSpecForgeSectionInput)) }),
  createItem: (projectId: string, input: CreateSpecForgeItemInput, idempotencyKey = commandKey()) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge/items`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json(itemBody(input)) }),
  updateItem: async (projectId: string, itemId: string, patch: Partial<CreateSpecForgeItemInput>, lockVersion: number): Promise<UpdateSpecForgeItemResult> => {
    const result = await request<{ item: ApiRecord; successor_created: boolean; source_item_id: string }>(`/projects/${encodeURIComponent(projectId)}/specforge/items/${encodeURIComponent(itemId)}`, { method: 'PATCH', headers: { 'If-Match': String(lockVersion) }, body: json(itemBody(patch)) });
    return { item: mapItem(result.item), successorCreated: result.successor_created, sourceItemId: result.source_item_id };
  },
  updateBoqLine: async (projectId: string, itemId: string, input: UpdateSpecForgeBoqLineInput, lockVersion: number): Promise<UpdateSpecForgeItemResult> => {
    const result = await request<{ item: ApiRecord; successor_created: boolean; source_item_id: string }>(`/projects/${encodeURIComponent(projectId)}/specforge/items/${encodeURIComponent(itemId)}/boq-line`, { method: 'PATCH', headers: { 'If-Match': String(lockVersion) }, body: json({ quantity: input.quantity, unit: input.unit, unit_rate: input.unitRate, quantity_source_type: input.quantitySourceType, quantity_source_ref: input.quantitySourceRef, rate_source_type: input.rateSourceType, rate_source_ref: input.rateSourceRef }) });
    return { item: mapItem(result.item), successorCreated: result.successor_created, sourceItemId: result.source_item_id };
  },
  duplicateItem: (projectId: string, itemId: string, idempotencyKey = commandKey()) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge/items/${encodeURIComponent(itemId)}/duplicate`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: '{}' }),
  transitionProcurement: async (projectId: string, itemId: string, targetStatus: SpecForgeProcurementTarget, expectedVersion: number, idempotencyKey = commandKey()): Promise<SpecForgeProcurementResult> => {
    const result = await request<{ item: ApiRecord; transition: ApiRecord; idempotent: boolean }>(`/projects/${encodeURIComponent(projectId)}/specforge/items/${encodeURIComponent(itemId)}/procurement-transition`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json({ target_status: targetStatus, expected_version: expectedVersion }) });
    return { item: mapItem(result.item), transition: { id: stringValue(result.transition.id), itemId: stringValue(result.transition.item_id), fromStatus: stringValue(result.transition.from_status) as SpecForgeItem['status'], toStatus: stringValue(result.transition.to_status) as SpecForgeProcurementTarget, sourceLockVersion: numberValue(result.transition.source_lock_version), connectorStatus: stringValue(result.transition.connector_status) as SpecForgeProcurementResult['transition']['connectorStatus'], connectorError: nullableString(result.transition.connector_error) }, idempotent: Boolean(result.idempotent) };
  },
  requestSource: async (projectId: string, sourceMethod: SpecForgeSourceMethod, sourceReference: string | null = null, idempotencyKey = commandKey()): Promise<SpecForgeSourceRequestResult> => {
    const result = await request<{ request: ApiRecord; idempotent: boolean }>(`/projects/${encodeURIComponent(projectId)}/specforge/source-requests`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json({ source_method: sourceMethod, source_reference: sourceReference }) });
    return { id: stringValue(result.request.id), sourceMethod: stringValue(result.request.source_method) as SpecForgeSourceMethod, status: 'integration_required', message: stringValue(result.request.message), idempotent: Boolean(result.idempotent) };
  },
  confirmResponsibility: async (projectId: string, idempotencyKey = commandKey()): Promise<SpecForgeResponsibilityConfirmation> => {
    const result = await request<{ confirmation: ApiRecord }>(`/projects/${encodeURIComponent(projectId)}/specforge/responsibility-confirmations`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: '{}' });
    return mapResponsibility(result.confirmation);
  },
  requestApproval: (projectId: string, itemId: string, input: { approvalType: string; requestedRole: RoleKey; requestedUserId?: string | null; dueAt?: string | null }, idempotencyKey = commandKey()) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge/items/${encodeURIComponent(itemId)}/approvals`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json({ approval_type: input.approvalType, requested_role: input.requestedRole, requested_user_id: input.requestedUserId ?? null, due_at: input.dueAt ?? null }) }),
  decideApproval: (projectId: string, approvalId: string, decision: 'approved' | 'rejected', decisionNote: string | null, idempotencyKey = commandKey()) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge/approvals/${encodeURIComponent(approvalId)}/decision`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json({ decision, decision_note: decisionNote }) }),
  validateIssue: (projectId: string) =>
    request<SpecForgeIssueReadiness>(`/projects/${encodeURIComponent(projectId)}/specforge/issues/validate`, { method: 'POST', body: '{}' }),
  listJobs: async (projectId: string, issueId: string): Promise<SpecForgeDownstreamJob[]> => {
    const result = await request<{ jobs: ApiRecord[] }>(`/projects/${encodeURIComponent(projectId)}/specforge/jobs?issue_id=${encodeURIComponent(issueId)}`);
    return result.jobs.map(mapDownstreamJob);
  },
  issue: async (projectId: string, input: { title: string; audience: string }, idempotencyKey = commandKey()): Promise<SpecForgeIssueResult> => {
    const result = await request<{ issue: ApiRecord; downstream: ApiRecord[]; idempotent: boolean }>(`/projects/${encodeURIComponent(projectId)}/specforge/issues`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json(input) });
    return { issue: mapIssue(result.issue), downstream: result.downstream.map(mapDownstreamJob), idempotent: result.idempotent };
  },
  requestDrawingScan: (projectId: string, input: { drawingRevisionId: string }, idempotencyKey = commandKey()) =>
    request(`/projects/${encodeURIComponent(projectId)}/specforge/drawing-scans`, { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: json({ drawing_revision_id: input.drawingRevisionId }) }),
};
