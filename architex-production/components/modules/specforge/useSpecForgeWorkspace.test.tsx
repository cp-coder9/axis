// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const specForgeApi = vi.hoisted(() => ({
  get: vi.fn(), createWorkspace: vi.fn(), createSection: vi.fn(), createItem: vi.fn(), updateItem: vi.fn(), duplicateItem: vi.fn(),
  requestApproval: vi.fn(), decideApproval: vi.fn(), validateIssue: vi.fn(), listJobs: vi.fn(), issue: vi.fn(), requestDrawingScan: vi.fn(),
}));

vi.mock('@/lib/specforge/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/specforge/api')>();
  return { ...actual, specForgeApi };
});

import { SpecForgeApiError } from '@/lib/specforge/api';
import type { SpecForgeAggregate, SpecForgeIssueResult } from '@/lib/specforge/types';
import {
  initialSpecForgeWorkspaceState,
  specForgeWorkspaceReducer,
  stateFromSpecForgeError,
  useSpecForgeWorkspace,
} from '@/components/modules/specforge/useSpecForgeWorkspace';

beforeEach(() => {
  vi.clearAllMocks();
  specForgeApi.get.mockResolvedValue(null);
});

describe('SpecForge workspace state', () => {
  it('maps access, conflict and retryable failures without local fallback records', () => {
    expect(stateFromSpecForgeError(new SpecForgeApiError(403, { error: 'Forbidden' }))).toMatchObject({ status: 'forbidden', workspace: null });
    expect(stateFromSpecForgeError(new SpecForgeApiError(409, { error: 'Stale' }))).toMatchObject({ status: 'conflict', workspace: null });
    expect(stateFromSpecForgeError(new SpecForgeApiError(503, { error: 'Unavailable' }))).toMatchObject({ status: 'error', retryable: true, workspace: null });
  });

  it('preserves draft input when a mutation conflicts', () => {
    const drafted = specForgeWorkspaceReducer(initialSpecForgeWorkspaceState, { type: 'draft', key: 'title', value: 'Unsaved tile choice' });
    const conflicted = specForgeWorkspaceReducer(drafted, { type: 'failure', error: new SpecForgeApiError(409, { error: 'Stale version' }) });
    expect(conflicted.status).toBe('conflict');
    expect(conflicted.drafts).toEqual({ title: 'Unsaved tile choice' });
    expect(conflicted.workspace).toBeNull();
  });

  it('represents a successful null load as an explicit empty state', () => {
    expect(specForgeWorkspaceReducer(initialSpecForgeWorkspaceState, { type: 'loaded', workspace: null })).toMatchObject({ status: 'empty', workspace: null, drafts: {} });
  });

  it('loads through the authenticated API without accepting caller identity', async () => {
    renderHook(() => useSpecForgeWorkspace('project-1'));
    await waitFor(() => expect(specForgeApi.get).toHaveBeenCalledWith('project-1'));
  });

  it('keeps a successful issue and its downstream result mounted without an eager reload', async () => {
    const workspace = {
      id: 'workspace-1', organizationId: 'org-1', projectId: 'project-1', projectName: 'Project One', profile: 'Architectural', stage: 'Design',
      revision: 'P03', issueStatus: 'draft', lockVersion: 4, budgetReviewedAt: '2026-08-27T00:00:00Z',
      sections: [], items: [], approvals: [], responsibilityConfirmations: [], drawingFindings: [], issues: [], commands: [],
    } satisfies SpecForgeAggregate;
    const issued = {
      issue: { id: 'issue-1', revision: 'P03', title: 'Specification issue P03', audience: 'Project team', status: 'issued', snapshotHash: 'hash', issuedAt: '2026-08-27T01:00:00Z' },
      downstream: [{ id: 'job-1', jobType: 'specforge.messaging', status: 'pending', lastError: null }],
      idempotent: false,
    } satisfies SpecForgeIssueResult;
    specForgeApi.get.mockResolvedValue(workspace);
    specForgeApi.issue.mockResolvedValue(issued);
    const { result } = renderHook(() => useSpecForgeWorkspace('project-1'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    specForgeApi.get.mockClear();

    await act(async () => { await result.current.actions.issue({ title: issued.issue.title, audience: issued.issue.audience }); });

    expect(specForgeApi.get).not.toHaveBeenCalled();
    expect(result.current.workspace?.issues).toEqual([issued.issue]);
    expect(result.current.workspace?.revision).toBe('P04');
  });
});
