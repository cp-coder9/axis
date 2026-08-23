import { describe, expect, it } from 'vitest';
import { createEngineeringWorkflowState, engineeringWorkflowReducer } from '@/lib/engineering-workflow';

describe('V8-P4-T01/T02 engineering workflow reducer', () => {
  it('replaces all calculator-owned state on calculator activation (V8-H01)', () => {
    const active = createEngineeringWorkflowState('steel-beam', 'project-a');
    const calculated = engineeringWorkflowReducer(active, { type: 'calculated', output: { schemaVersion: 'engineering-calculation/v1', calculatorId: 'steel-beam', formulaVersion: 'steel-beam/1.0.0', inputs: active.inputs, results: [], derivation: [], references: [], assumptions: [], limitations: [] } });
    const saved = engineeringWorkflowReducer(calculated, { type: 'saved', record: { id: 'record-a', status: 'saved', lock_version: 1 } });
    const switched = engineeringWorkflowReducer(saved, { type: 'activate', calcId: 'concrete-beam', projectId: 'project-a' });
    expect(switched.calcId).toBe('concrete-beam');
    expect(switched.output).toBeNull();
    expect(switched.record).toBeNull();
    expect(switched.dirty).toBe(false);
    expect(switched.inputs).toHaveProperty('b_mm');
    expect(switched.inputs).not.toHaveProperty('span_m');
  });

  it('invalidates output and controlled eligibility after every input mutation (V8-H02)', () => {
    const initial = createEngineeringWorkflowState('steel-beam', null);
    const calculated = engineeringWorkflowReducer(initial, { type: 'calculated', output: { schemaVersion: 'engineering-calculation/v1', calculatorId: 'steel-beam', formulaVersion: 'steel-beam/1.0.0', inputs: initial.inputs, results: [], derivation: [], references: [], assumptions: [], limitations: [] } });
    const changed = engineeringWorkflowReducer(calculated, { type: 'input_changed', key: 'span_m', quantity: { value: 7, unit: 'm' } });
    expect(changed.output).toBeNull();
    expect(changed.dirty).toBe(true);
    expect(changed.phase).toBe('editing');
    expect(changed.inputs.span_m).toEqual({ value: 7, unit: 'm' });
  });
});
