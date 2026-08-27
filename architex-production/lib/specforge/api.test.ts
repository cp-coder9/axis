import { beforeEach, describe, expect, it, vi } from 'vitest';

const authenticatedFetch = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth-session', () => ({ authenticatedFetch }));
vi.mock('@/lib/api', () => ({ API_BASE_URL: '/api/v1' }));

import { SpecForgeApiError, specForgeApi } from '@/lib/specforge/api';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('SpecForge API client', () => {
  beforeEach(() => {
    authenticatedFetch.mockReset();
  });

  it('delegates identity exclusively to authenticatedFetch', async () => {
    authenticatedFetch.mockResolvedValue(response({ workspace: {
      id: 'workspace-1', organization_id: 'org-1', project_id: 'project-1', project_name: 'Faerie Glen', profile: 'Residential', stage: 'Design', revision: 'P06', issue_status: 'draft', lock_version: 1, budget_reviewed_at: null,
      sections: [], items: [{ id: 'item-1', section_id: 'section-1', code: 'FIN-001', title: 'Tile', room: 'Lobby', package_name: 'Tiling', description: 'Tile', image_url: null, supplier: null, model: null, finish: null, dimensions: null, budget_allowance: '1000.00', estimated_cost: '1100.00', lead_time_days: 60, client_decision: true, owner_role: 'architect', reviewer_role: 'bep', approver_role: 'client', status: 'draft', source_revision: 'P06', superseded_by: null, lock_version: 1 }],
      approvals: [], drawing_findings: [], issues: [], commands: [],
    } }));

    const workspace = await specForgeApi.get('project-1');

    expect(workspace?.items[0]).toMatchObject({ packageName: 'Tiling', budgetAllowance: 1000, estimatedCost: 1100, clientDecision: true });
    const [, init] = authenticatedFetch.mock.calls[0];
    expect(new Headers(init.headers).has('Authorization')).toBe(false);
    expect(new Headers(init.headers).has('X-Architex-Role')).toBe(false);
    expect(new Headers(init.headers).has('X-Architex-User')).toBe(false);
  });

  it('adds concurrency and idempotency headers to mutations', async () => {
    authenticatedFetch
      .mockResolvedValueOnce(response({ item: { id: 'item-1' } }, 201))
      .mockResolvedValueOnce(response({ item: { id: 'item-1' } }));

    await specForgeApi.createItem('project-1', { title: 'Tile' } as never, 'create-key');
    await specForgeApi.updateItem('project-1', 'item-1', { title: 'Tile revised' }, 4);

    expect(new Headers(authenticatedFetch.mock.calls[0][1].headers).get('Idempotency-Key')).toBe('create-key');
    expect(new Headers(authenticatedFetch.mock.calls[1][1].headers).get('If-Match')).toBe('4');
  });

  it('returns an explicit empty workspace and preserves structured API failures', async () => {
    authenticatedFetch
      .mockResolvedValueOnce(response({ code: 'SPECFORGE_WORKSPACE_EMPTY' }, 404))
      .mockResolvedValueOnce(response({ error: 'Permission store unavailable' }, 503));

    await expect(specForgeApi.get('project-1')).resolves.toBeNull();
    await expect(specForgeApi.get('project-1')).rejects.toEqual(expect.objectContaining<Partial<SpecForgeApiError>>({ status: 503 }));
  });

  it('maps real downstream job status from the persistence API', async () => {
    authenticatedFetch.mockResolvedValue(response({ jobs: [{ id: 'job-1', job_type: 'specforge.messaging', status: 'integration_required', last_error: 'Messaging integration is not configured.' }] }));

    await expect(specForgeApi.listJobs('project-1', 'issue-1')).resolves.toEqual([
      { id: 'job-1', jobType: 'specforge.messaging', status: 'integration_required', lastError: 'Messaging integration is not configured.' },
    ]);
    expect(authenticatedFetch.mock.calls[0][0]).toContain('issue_id=issue-1');
  });
});
