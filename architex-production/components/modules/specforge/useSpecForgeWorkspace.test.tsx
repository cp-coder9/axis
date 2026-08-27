// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
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
});
