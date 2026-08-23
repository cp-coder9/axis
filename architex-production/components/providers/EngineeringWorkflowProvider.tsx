'use client';

import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { CalculatorId } from '@/lib/calculations/types';
import { createEngineeringWorkflowState, engineeringWorkflowReducer, type EngineeringWorkflowEvent, type EngineeringWorkflowState } from '@/lib/engineering-workflow';

type EngineeringWorkflowContextValue = {
  state: EngineeringWorkflowState | null;
  activate: (calcId: CalculatorId, projectId: string | null) => void;
  dispatch: (event: EngineeringWorkflowEvent) => void;
};
const EngineeringWorkflowContext = createContext<EngineeringWorkflowContextValue | null>(null);
function sharedWorkflowReducer(state: EngineeringWorkflowState | null, event: EngineeringWorkflowEvent): EngineeringWorkflowState | null {
  if (event.type === 'activate') return createEngineeringWorkflowState(event.calcId, event.projectId);
  return state === null ? state : engineeringWorkflowReducer(state, event);
}

export function EngineeringWorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sharedWorkflowReducer, null as EngineeringWorkflowState | null);
  const activate = useCallback((calcId: CalculatorId, projectId: string | null) => dispatch({ type: 'activate', calcId, projectId }), []);
  const value = useMemo<EngineeringWorkflowContextValue>(() => ({ state, dispatch, activate }), [state, activate]);
  return <EngineeringWorkflowContext.Provider value={value}>{children}</EngineeringWorkflowContext.Provider>;
}

export function useEngineeringWorkflow(): EngineeringWorkflowContextValue {
  const context = useContext(EngineeringWorkflowContext);
  if (!context) throw new Error('EngineeringWorkflowProvider is required.');
  return context;
}

export function workflowFallback(calcId: CalculatorId, projectId: string | null): EngineeringWorkflowState {
  return createEngineeringWorkflowState(calcId, projectId);
}
