import { describe, expect, it } from 'vitest';

import { SpecForgeApiError } from '@/lib/specforge/api';
import {
  initialSpecForgeWorkspaceState,
  specForgeWorkspaceReducer,
  stateFromSpecForgeError,
} from '@/components/modules/specforge/useSpecForgeWorkspace';

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
});
