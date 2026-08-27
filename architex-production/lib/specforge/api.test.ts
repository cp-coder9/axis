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
      sections: [], items: [{ id: 'item-1', section_id: 'section-1', code: 'FIN-001', title: 'Tile', room: 'Lobby', package_name: 'Tiling', description: 'Tile', image_url: null, supplier: null, model: null, finish: null, dimensions: null, budget_allowance: '1000.00', estimated_cost: '1100.00', lead_time_days: 60, quantity: '12.5000', unit: 'm²', unit_rate: '800.00', quantity_source_type: 'drawing', quantity_source_ref: 'A-420 P06', rate_source_type: 'supplier_quote', rate_source_ref: 'Q-1042', client_decision: true, owner_role: 'architect', reviewer_role: 'bep', approver_role: 'client', status: 'draft', source_revision: 'P06', superseded_by: null, lock_version: 1 }],
      approvals: [], drawing_findings: [], issues: [], commands: [],
    } }));

    const workspace = await specForgeApi.get('project-1');

    expect(workspace?.items[0]).toMatchObject({ packageName: 'Tiling', budgetAllowance: 1000, estimatedCost: 1100, quantity: 12.5, unitRate: 800, quantitySourceRef: 'A-420 P06', rateSourceRef: 'Q-1042', clientDecision: true });
    const [, init] = authenticatedFetch.mock.calls[0];
    expect(new Headers(init.headers).has('Authorization')).toBe(false);
    expect(new Headers(init.headers).has('X-Architex-Role')).toBe(false);
    expect(new Headers(init.headers).has('X-Architex-User')).toBe(false);
  });

  it('adds concurrency and idempotency headers to mutations', async () => {
    authenticatedFetch
      .mockResolvedValueOnce(response({ item: { id: 'item-1' } }, 201))
      .mockResolvedValueOnce(response({ item: { id: 'item-2', section_id: 'section-1', code: 'FIN-001', title: 'Tile revised', status: 'draft', source_revision: 'P07', lock_version: 1 }, successor_created: true, source_item_id: 'item-1' }));

    await specForgeApi.createItem('project-1', { title: 'Tile' } as never, 'create-key');
    const update = await specForgeApi.updateItem('project-1', 'item-1', { title: 'Tile revised' }, 4);

    expect(new Headers(authenticatedFetch.mock.calls[0][1].headers).get('Idempotency-Key')).toBe('create-key');
    expect(new Headers(authenticatedFetch.mock.calls[1][1].headers).get('If-Match')).toBe('4');
    expect(update).toMatchObject({ successorCreated: true, sourceItemId: 'item-1', item: { id: 'item-2', sourceRevision: 'P07' } });
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

  it('maps an audited integration-required source request without local identity headers', async () => {
    authenticatedFetch.mockResolvedValue(response({ request: { id: 'source-1', source_method: 'supplier_url', status: 'integration_required', message: 'Supplier catalogue integration is required.' }, idempotent: false }, 201));
    await expect(specForgeApi.requestSource('project-1', 'supplier_url', 'https://supplier.invalid/item', 'source-key')).resolves.toMatchObject({ status: 'integration_required', sourceMethod: 'supplier_url' });
    const [url, init] = authenticatedFetch.mock.calls[0];
    expect(url).toContain('/source-requests');
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe('source-key');
    expect(new Headers(init.headers).has('X-Architex-Role')).toBe(false);
  });

  it('updates a governed BoQ line with optimistic concurrency', async () => {
    authenticatedFetch.mockResolvedValue(response({ item: { id: 'item-1', section_id: 'section-1', code: 'FIN-001', title: 'Tile', status: 'draft', source_revision: 'P06', quantity: '14.0000', unit: 'm²', unit_rate: '800.00', quantity_source_type: 'drawing', quantity_source_ref: 'A-420 P06', rate_source_type: 'supplier_quote', rate_source_ref: 'Q-1042', lock_version: 2 }, successor_created: false, source_item_id: 'item-1' }));
    const result = await specForgeApi.updateBoqLine('project-1', 'item-1', { quantity: 14, unit: 'm²', unitRate: 800, quantitySourceType: 'drawing', quantitySourceRef: 'A-420 P06', rateSourceType: 'supplier_quote', rateSourceRef: 'Q-1042' }, 1);
    const [url, init] = authenticatedFetch.mock.calls[0];
    expect(url).toContain('/items/item-1/boq-line');
    expect(new Headers(init.headers).get('If-Match')).toBe('1');
    expect(result.item).toMatchObject({ quantity: 14, unitRate: 800, lockVersion: 2 });
  });
});
