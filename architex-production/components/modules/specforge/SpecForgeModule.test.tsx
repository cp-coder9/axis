// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ALL_PROJECTS } from '@/lib/data';
import type { SpecForgeAggregate } from '@/lib/specforge/types';

const useSpecForgeWorkspace = vi.hoisted(() => vi.fn());
vi.mock('@/components/modules/specforge/useSpecForgeWorkspace', () => ({ useSpecForgeWorkspace }));

import { SpecForgeModule } from '@/components/modules/SpecForgeModule';

const actions = {
  reload: vi.fn(), setDraft: vi.fn(), clearDrafts: vi.fn(), createWorkspace: vi.fn(), createSection: vi.fn(), createItem: vi.fn(),
  updateItem: vi.fn(), duplicateItem: vi.fn(), requestApproval: vi.fn(), decideApproval: vi.fn(), validateIssue: vi.fn(), issue: vi.fn(), listJobs: vi.fn(), requestDrawingScan: vi.fn(),
};

const workspace: SpecForgeAggregate = {
  id: 'workspace-1', organizationId: 'org-1', projectId: ALL_PROJECTS[0].id, projectName: ALL_PROJECTS[0].name,
  profile: 'Residential architectural', stage: 'Design', revision: 'P06', issueStatus: 'draft', lockVersion: 2,
  budgetReviewedAt: '2026-08-26T10:00:00Z',
  sections: [{ id: 'section-1', code: '12', title: 'Finishes', discipline: 'Architecture', ownerRole: 'architect', reviewerRole: 'bep', status: 'approved', lockVersion: 1 }],
  items: [{ id: 'item-1', sectionId: 'section-1', code: 'FIN-001', title: 'Warm limestone porcelain tile', room: 'Lobby', packageName: 'Tiling', description: 'Rectified wall tile', imageUrl: null, supplier: 'Tile Co', model: 'L600', finish: 'Warm limestone', dimensions: '600x1200', budgetAllowance: 100_000, estimatedCost: 112_000, leadTimeDays: 60, clientDecision: true, ownerRole: 'architect', reviewerRole: 'bep', approverRole: 'client', status: 'approved', sourceRevision: 'P06', supersededBy: null, lockVersion: 1 }],
  approvals: [], drawingFindings: [], issues: [], commands: [],
};

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  actions.validateIssue.mockResolvedValue({ ready: true, codes: [] });
  actions.issue.mockResolvedValue({
    issue: { id: 'issue-1', revision: 'P06', title: 'Specification issue P06', audience: 'Project team', status: 'issued', snapshotHash: 'hash', issuedAt: '2026-08-26T12:00:00Z' },
    downstream: [
      { id: 'job-1', jobType: 'specforge.action-centre', status: 'pending', lastError: null },
      { id: 'job-2', jobType: 'specforge.messaging', status: 'pending', lastError: null },
    ],
    idempotent: false,
  });
  actions.listJobs.mockResolvedValue([
    { id: 'job-1', jobType: 'specforge.action-centre', status: 'integration_required', lastError: 'Action Centre integration is not configured.' },
    { id: 'job-2', jobType: 'specforge.messaging', status: 'integration_required', lastError: 'Messaging integration is not configured.' },
  ]);
  useSpecForgeWorkspace.mockReturnValue({ status: 'ready', workspace, message: null, retryable: false, drafts: {}, actions });
});

describe('SpecForge V8 workspace', () => {
  it('renders persisted project records, semantic identity and v1.1', () => {
    render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" />);
    expect(screen.getByRole('heading', { name: 'SpecForge V2' })).toBeTruthy();
    expect(screen.getByText('v1.1')).toBeTruthy();
    expect(screen.getByText('Warm limestone porcelain tile')).toBeTruthy();
    expect(screen.getAllByText(/R 112[,\s]000/).length).toBeGreaterThan(0);
  });

  it('shows an authorized production empty state without fabricated records', () => {
    useSpecForgeWorkspace.mockReturnValue({ status: 'empty', workspace: null, message: null, retryable: false, drafts: {}, actions });
    render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" />);
    fireEvent.click(screen.getByRole('button', { name: 'Create specification workspace' }));
    expect(actions.createWorkspace).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Warm limestone porcelain tile')).toBeNull();
  });

  it('renders access and conflict states without role-hidden authoring actions', () => {
    useSpecForgeWorkspace.mockReturnValue({ status: 'forbidden', workspace: null, message: 'Forbidden', retryable: false, drafts: {}, actions });
    const { rerender } = render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="client" />);
    expect(screen.getByText(/not available for this project scope/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /add specification/i })).toBeNull();

    useSpecForgeWorkspace.mockReturnValue({ status: 'conflict', workspace, message: 'Stale version', retryable: false, drafts: { title: 'Unsaved choice' }, actions });
    rerender(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" />);
    expect(screen.getByText(/newer version exists/i)).toBeTruthy();
    expect(screen.getByText(/Unsaved choice/i)).toBeTruthy();
  });

  it('uses the authorization role for presentation capabilities when God Mode changes the viewing lens', () => {
    render(
      <SpecForgeModule
        activeProject={ALL_PROJECTS[0]}
        currentRole="architect"
        authorizationRole="supplier"
        activeTabKey="products"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Product register' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add specification' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /prepare issue/i })).toBeNull();
  });

  it('honours controlled V8 tabs and offers a manual smart-add confirmation', () => {
    render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" activeTabKey="products" />);
    expect(screen.getByRole('heading', { name: 'Product register' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Add specification' }));
    fireEvent.change(screen.getByLabelText('Describe a product or specification'), { target: { value: 'Acoustic oak wall panel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Review draft' }));
    expect(screen.getByText('Acoustic oak wall panel')).toBeTruthy();
    expect(screen.getByText(/manual draft/i)).toBeTruthy();
  });

  it.each(['engineer', 'energy_professional', 'fire_engineer'] as const)('allows technical author %s to open Smart Add', role => {
    render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole={role} activeTabKey="products" />);
    expect(screen.getByRole('button', { name: 'Add specification' })).toBeTruthy();
  });

  it.each([
    ['Paste supplier URL', 'Supplier catalogue integration is required'],
    ['Upload product image', 'Product image intelligence integration is required'],
    ['Search practice library', 'Practice library integration is required'],
  ] as const)('reports an honest unavailable source for %s', (button, expected) => {
    render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add specification' }));
    fireEvent.click(screen.getByRole('button', { name: button }));
    expect(screen.getByRole('status').textContent).toContain(expected);
    expect(actions.createItem).not.toHaveBeenCalled();
  });

  it('submits a real drawing scan request from Smart Add', async () => {
    actions.requestDrawingScan.mockResolvedValue({ id: 'job-1' });
    render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add specification' }));
    fireEvent.click(screen.getByRole('button', { name: 'Read project drawings' }));
    fireEvent.change(screen.getByLabelText('Drawing revision'), { target: { value: 'drawing-rev-42' } });
    fireEvent.click(screen.getByRole('button', { name: 'Request drawing scan' }));
    await waitFor(() => expect(actions.requestDrawingScan).toHaveBeenCalledWith('drawing-rev-42'));
    expect(screen.getByRole('status').textContent).toContain('Drawing scan queued');
  });

  it('lists exact issue blockers and reports only real downstream job states', async () => {
    const blockedWorkspace: SpecForgeAggregate = {
      ...workspace,
      budgetReviewedAt: null,
      approvals: [{ id: 'approval-1', itemId: 'item-1', approvalType: 'client_decision', requestedRole: 'client', requestedUserId: null, status: 'pending', decisionNote: null, dueAt: null }],
    };
    useSpecForgeWorkspace.mockReturnValue({ status: 'ready', workspace: blockedWorkspace, message: null, retryable: false, drafts: {}, actions });
    const { rerender } = render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" activeTabKey="issue" />);
    expect(screen.getByText('approvals pending')).toBeTruthy();
    expect(screen.getByText('budget review pending')).toBeTruthy();

    useSpecForgeWorkspace.mockReturnValue({ status: 'ready', workspace, message: null, retryable: false, drafts: {}, actions });
    rerender(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" activeTabKey="issue" />);
    fireEvent.click(screen.getByRole('button', { name: 'Validate and issue P06' }));
    await waitFor(() => expect(actions.issue).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Action centre')).toBeTruthy();
    expect(screen.getByText('Messaging')).toBeTruthy();
    expect(screen.getAllByText('Queued')).toHaveLength(2);
    expect(screen.queryByText(/distributed/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh statuses' }));
    await waitFor(() => expect(actions.listJobs).toHaveBeenCalledWith('issue-1'));
    expect(screen.getAllByText('Integration required')).toHaveLength(2);
  });

  it.each([
    ['planning', 'Specification planning', 'Procure: Warm limestone porcelain tile'],
    ['procurement', 'Procurement pipeline', 'RFQ Pending'],
    ['closeout', 'Closeout readiness', 'Approved items'],
    ['integration', 'Connected services', 'Integration required'],
  ] as const)('renders the persisted %s reference view', (tab, heading, evidence) => {
    render(<SpecForgeModule activeProject={ALL_PROJECTS[0]} currentRole="architect" activeTabKey={tab} />);
    expect(screen.getByRole('heading', { name: heading })).toBeTruthy();
    expect(screen.getAllByText(evidence, { exact: false }).length).toBeGreaterThan(0);
    expect(screen.queryByText('Workspace view unavailable')).toBeNull();
  });
});
