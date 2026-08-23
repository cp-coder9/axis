'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { calculatorIdForTab, runCalculation } from '@/lib/calculations/core';
import { CALC_REGISTRY } from '@/lib/calculations/registry';
import type { CalculationRun } from '@/lib/calculations/types';
import { calculatorRelease } from '@/lib/engineering-safety';
import { useEngineeringWorkflow, workflowFallback } from '@/components/providers/EngineeringWorkflowProvider';

interface EngineeringCalcModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey: string;
  isProjectMode: boolean;
  onNavigateTool?: (toolId: string) => void;
  onOpenWingman?: () => void;
}

export const EngineeringCalcModule: React.FC<EngineeringCalcModuleProps> = ({ activeProject, activeTabKey, isProjectMode }) => {
  const calcId = useMemo(() => calculatorIdForTab(activeTabKey), [activeTabKey]);
  const calcDef = CALC_REGISTRY[calcId];
  const release = useMemo(() => calculatorRelease(calcId), [calcId]);
  const workflowContext = useEngineeringWorkflow();
  const { activate } = workflowContext;
  const workflow = workflowContext.state?.calcId === calcId ? workflowContext.state : workflowFallback(calcId, isProjectMode ? activeProject.id : null);
  const dispatchWorkflow = workflowContext.dispatch;
  const inputs = workflow.inputs;
  const [output, setOutput] = useState<CalculationRun | null>(null);
  const [showDerivation, setShowDerivation] = useState(false);

  // Calculator-specific state is reset atomically on every navigator transition.
  useEffect(() => {
    activate(calcId, isProjectMode ? activeProject.id : null);
    setOutput(null);
    setShowDerivation(false);
  }, [calcId, activeProject.id, isProjectMode, activate]);

  const updateInput = (key: string, rawValue: string) => {
    setOutput(null);
    setShowDerivation(false);
    const field = calcDef.fields.find((candidate) => candidate.key === key);
    if (!field) return;
    if (rawValue === '') { dispatchWorkflow({ type: 'input_cleared', key }); return; }
    dispatchWorkflow({ type: 'input_changed', key, quantity: { value: Number(rawValue), unit: field.canonicalUnit } });
  };

  const payload = output?.ok ? output.payload : null;
  const issues = output && !output.ok ? output.issues : [];

  return (
    <div className="space-y-4" data-testid="engineering-calculation" data-calculator-id={calcId}>
      <div className="flex items-center gap-2 text-[11px] text-[#657287] bg-[#f2f7f6] border border-[#102033]/10 rounded-xl px-4 py-2.5">
        <OrigamiIcon name="engineering_hub" size={16} />
        <span className="font-bold text-[#102033]">{calcDef.title}</span>
        <span className="ml-auto text-[10px]">{isProjectMode ? `${activeProject.name} · ${activeProject.stage}` : 'Unassigned / portfolio'}</span>
      </div>

      {!release.recordable && <div data-testid="calculator-containment" role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12px] font-medium text-amber-900">{release.message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <section className="lg:col-span-2 bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4" aria-label="Calculation inputs">
          <div className="flex items-center gap-2"><OrigamiIcon name={calcDef.icon} size={20} /><h3 className="text-sm font-bold text-[#102033]">{calcDef.title}</h3></div>
          {calcDef.fields.map((field) => (
            <label key={field.key} className="block text-[11px] font-medium text-[#657287]">
              {field.label} <span className="text-[#96a0ad]">({field.canonicalUnit})</span>
              <input aria-label={field.label} type="number" value={inputs[field.key]?.value ?? ''} min={field.min.value} max={field.max.value} step="any" onChange={(event) => updateInput(field.key, event.target.value)} className="mt-1 w-full px-3 py-2 border border-[#102033]/15 rounded-lg text-[13px] text-[#102033]" />
            </label>
          ))}
          <div className="flex gap-2">
            <button onClick={() => { const next = runCalculation(calcId, inputs); setOutput(next); if (next.ok) dispatchWorkflow({ type: 'calculated', output: next.payload }); }} className="flex-1 px-4 py-2.5 bg-[#167E79] text-white text-[12px] font-bold rounded-xl">Calculate</button>
            <button onClick={() => { dispatchWorkflow({ type: 'activate', calcId, projectId: isProjectMode ? activeProject.id : null }); setOutput(null); setShowDerivation(false); }} className="px-4 py-2.5 bg-white border border-[#102033]/15 text-[#657287] text-[12px] font-medium rounded-xl">Reset</button>
          </div>
        </section>

        <section className="lg:col-span-3 bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4" aria-label="Calculation results">
          {issues.length > 0 && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-800">{issues.map((issue) => <div key={`${issue.field}-${issue.code}`}>{issue.message}</div>)}</div>}
          {payload ? <>
            <div className="flex items-center gap-2"><h3 className="text-sm font-bold text-[#102033]">Results</h3><span className="text-[10px] text-[#657287]">{payload.formulaVersion}</span></div>
            {payload.results.map((result) => <div key={result.key} className="flex items-center justify-between py-2.5 border-b border-[#102033]/5"><span className="text-[12px] text-[#657287]">{result.label} <span className="text-[10px] text-[#96a0ad]">({result.criterion ?? '—'})</span></span><span className="text-[14px] font-bold text-[#102033]">{result.quantity.value.toFixed(2)} <small className="text-[11px] text-[#657287]">{result.quantity.unit}</small>{result.passes !== null && <small className={result.passes ? 'ml-2 text-[#218956]' : 'ml-2 text-[#b34b3e]'}>{result.passes ? 'PASS' : 'FAIL'}</small>}</span></div>)}
            <button onClick={() => setShowDerivation((visible) => !visible)} className="text-[11px] text-[#167E79] font-medium">{showDerivation ? 'Hide derivation' : 'Show derivation'}</button>
            {showDerivation && <div className="p-3 bg-[#f4f8f7] border-l-2 border-[#19B7B0] rounded-r-lg text-[11px] text-[#167E79] font-mono">{payload.derivation.map((line) => <div key={line}>{line}</div>)}</div>}
            <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{payload.limitations.map((limitation) => <div key={limitation}>⚠ {limitation}</div>)}</div>
          </> : issues.length === 0 && <div className="flex flex-col items-center justify-center h-48 text-[#96a0ad]"><OrigamiIcon name="engineering_hub" size={48} /><p className="mt-3 text-[13px]">Enter inputs and click Calculate to see results.</p></div>}
        </section>
      </div>
    </div>
  );
};
