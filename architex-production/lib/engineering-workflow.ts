import { defaultInputs } from './calculations/core';
import type { CalculatorId, EngineeringCalculationPayloadV1, Quantity } from './calculations/types';

export type EngineeringWorkflowPhase = 'editing' | 'calculated' | 'saving' | 'saved' | 'submitting_review' | 'under_review' | 'approved' | 'conflict' | 'error';
export type WorkflowRecord = { id: string; status: 'saved' | 'under_review' | 'approved'; lock_version: number };
export type EngineeringWorkflowState = {
  calcId: CalculatorId;
  inputs: Record<string, Quantity>;
  output: EngineeringCalculationPayloadV1 | null;
  dirty: boolean;
  record: WorkflowRecord | null;
  projectId: string | null;
  phase: EngineeringWorkflowPhase;
  message: string | null;
};

export type EngineeringWorkflowEvent =
  | { type: 'activate'; calcId: CalculatorId; projectId: string | null }
  | { type: 'input_changed'; key: string; quantity: Quantity }
  | { type: 'input_cleared'; key: string }
  | { type: 'calculated'; output: EngineeringCalculationPayloadV1 }
  | { type: 'saved'; record: WorkflowRecord }
  | { type: 'failed'; message: string };

export function createEngineeringWorkflowState(calcId: CalculatorId, projectId: string | null): EngineeringWorkflowState {
  return { calcId, projectId, inputs: defaultInputs(calcId), output: null, dirty: false, record: null, phase: 'editing', message: null };
}

export function engineeringWorkflowReducer(state: EngineeringWorkflowState, event: EngineeringWorkflowEvent): EngineeringWorkflowState {
  switch (event.type) {
    case 'activate': return createEngineeringWorkflowState(event.calcId, event.projectId);
    case 'input_changed': return { ...state, inputs: { ...state.inputs, [event.key]: event.quantity }, output: null, dirty: true, phase: 'editing', message: null };
    case 'input_cleared': { const { [event.key]: _cleared, ...inputs } = state.inputs; return { ...state, inputs, output: null, dirty: true, phase: 'editing', message: null }; }
    case 'calculated': return { ...state, output: event.output, phase: 'calculated', message: null };
    case 'saved': return { ...state, record: event.record, dirty: false, phase: event.record.status, message: null };
    case 'failed': return { ...state, phase: 'error', message: event.message };
  }
}
