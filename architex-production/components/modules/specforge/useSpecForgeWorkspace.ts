'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';

import {
  SpecForgeApiError,
  specForgeApi,
  type CreateSpecForgeItemInput,
  type CreateSpecForgeSectionInput,
  type CreateSpecForgeWorkspaceInput,
} from '@/lib/specforge/api';
import type { SpecForgeAggregate } from '@/lib/specforge/types';

export type SpecForgeViewStatus = 'loading' | 'empty' | 'ready' | 'forbidden' | 'conflict' | 'error';

export interface SpecForgeWorkspaceState {
  status: SpecForgeViewStatus;
  workspace: SpecForgeAggregate | null;
  message: string | null;
  retryable: boolean;
  drafts: Record<string, unknown>;
}

export type SpecForgeWorkspaceAction =
  | { type: 'loading' }
  | { type: 'loaded'; workspace: SpecForgeAggregate | null }
  | { type: 'failure'; error: unknown }
  | { type: 'draft'; key: string; value: unknown }
  | { type: 'clear-drafts' };

export const initialSpecForgeWorkspaceState: SpecForgeWorkspaceState = {
  status: 'loading', workspace: null, message: null, retryable: false, drafts: {},
};

export function stateFromSpecForgeError(error: unknown, workspace: SpecForgeAggregate | null = null): Omit<SpecForgeWorkspaceState, 'drafts'> {
  if (error instanceof SpecForgeApiError) {
    if (error.status === 403) return { status: 'forbidden', workspace: null, message: error.message, retryable: false };
    if (error.status === 409) return { status: 'conflict', workspace, message: error.message, retryable: false };
    return { status: 'error', workspace: null, message: error.message, retryable: error.status === 503 || error.status >= 500 };
  }
  return { status: 'error', workspace: null, message: error instanceof Error ? error.message : 'SpecForge could not be loaded.', retryable: true };
}

export function specForgeWorkspaceReducer(state: SpecForgeWorkspaceState, action: SpecForgeWorkspaceAction): SpecForgeWorkspaceState {
  switch (action.type) {
    case 'loading': return { ...state, status: 'loading', message: null, retryable: false };
    case 'loaded': return { status: action.workspace ? 'ready' : 'empty', workspace: action.workspace, message: null, retryable: false, drafts: {} };
    case 'failure': return { ...stateFromSpecForgeError(action.error, state.workspace), drafts: state.drafts };
    case 'draft': return { ...state, drafts: { ...state.drafts, [action.key]: action.value } };
    case 'clear-drafts': return { ...state, drafts: {} };
  }
}

export function useSpecForgeWorkspace(projectId: string | null, enabled = true) {
  const [state, dispatch] = useReducer(specForgeWorkspaceReducer, initialSpecForgeWorkspaceState);

  const reload = useCallback(async () => {
    if (!enabled || !projectId) { dispatch({ type: 'loaded', workspace: null }); return null; }
    dispatch({ type: 'loading' });
    try {
      const workspace = await specForgeApi.get(projectId);
      dispatch({ type: 'loaded', workspace });
      return workspace;
    } catch (error) {
      dispatch({ type: 'failure', error });
      return null;
    }
  }, [enabled, projectId]);

  useEffect(() => { void reload(); }, [reload]);

  const mutate = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    try {
      const result = await operation();
      await reload();
      return result;
    } catch (error) {
      dispatch({ type: 'failure', error });
      throw error;
    }
  }, [reload]);

  const actions = useMemo(() => ({
    reload,
    setDraft: (key: string, value: unknown) => dispatch({ type: 'draft', key, value }),
    clearDrafts: () => dispatch({ type: 'clear-drafts' }),
    createWorkspace: (input: CreateSpecForgeWorkspaceInput) => projectId ? mutate(() => specForgeApi.createWorkspace(projectId, input)) : Promise.reject(new Error('Project context is required.')),
    createSection: (input: CreateSpecForgeSectionInput) => projectId ? mutate(() => specForgeApi.createSection(projectId, input)) : Promise.reject(new Error('Project context is required.')),
    createItem: (input: CreateSpecForgeItemInput) => projectId ? mutate(() => specForgeApi.createItem(projectId, input)) : Promise.reject(new Error('Project context is required.')),
    updateItem: (itemId: string, patch: Partial<CreateSpecForgeItemInput>, lockVersion: number) => projectId ? mutate(() => specForgeApi.updateItem(projectId, itemId, patch, lockVersion)) : Promise.reject(new Error('Project context is required.')),
    duplicateItem: (itemId: string) => projectId ? mutate(() => specForgeApi.duplicateItem(projectId, itemId)) : Promise.reject(new Error('Project context is required.')),
    requestApproval: (itemId: string, input: Parameters<typeof specForgeApi.requestApproval>[2]) => projectId ? mutate(() => specForgeApi.requestApproval(projectId, itemId, input)) : Promise.reject(new Error('Project context is required.')),
    decideApproval: (approvalId: string, decision: 'approved' | 'rejected', note: string | null) => projectId ? mutate(() => specForgeApi.decideApproval(projectId, approvalId, decision, note)) : Promise.reject(new Error('Project context is required.')),
    validateIssue: () => projectId ? specForgeApi.validateIssue(projectId) : Promise.reject(new Error('Project context is required.')),
    listJobs: (issueId: string) => projectId ? specForgeApi.listJobs(projectId, issueId) : Promise.reject(new Error('Project context is required.')),
    issue: (input: { title: string; audience: string }) => projectId ? mutate(() => specForgeApi.issue(projectId, input)) : Promise.reject(new Error('Project context is required.')),
    requestDrawingScan: (drawingRevisionId: string) => projectId ? mutate(() => specForgeApi.requestDrawingScan(projectId, { drawingRevisionId })) : Promise.reject(new Error('Project context is required.')),
  }), [mutate, projectId, reload]);

  return { ...state, actions };
}
