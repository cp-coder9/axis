'use client';

import React, { useState, useMemo } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { CALC_REGISTRY, CalcInputs, runCalculation, defaultInputs, CalcField } from '@/lib/engineering-calculations';
import { architexApiEngineering, demoIdentity } from '@/lib/api';
import { calculatorRelease } from '@/lib/engineering-safety';

interface EngineeringCalcModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey: string;
  isProjectMode: boolean;
  onNavigateTool?: (toolId: string) => void;
  onOpenWingman?: () => void;
}

const GROUPS = ['Structural', 'Civil', 'Mechanical / HVAC', 'Fire Engineering', 'Electrical', 'Wet Services', 'Utilities'];

function getCalcIdForTabKey(key: string): string {
  const map: Record<string, string> = {
    'steel': 'steel-beam', 'concrete': 'concrete-beam', 'timber': 'timber-beam', 'geotechnical': 'geo-bearing',
    'wind': 'wind-load', 'stormwater': 'stormwater-rational',
    'duct': 'duct-sizing', 'heat': 'heat-gain',
    'escape': 'travel-distance', 'fire_resistance': 'fire-resistance', 'hydrant': 'fire-water',
    'cable': 'cable-sizing', 'db': 'max-demand',
    'water': 'cold-water', 'drainage': 'drainage-fu', 'hotwater': 'geyser-sizing',
    'converter': 'unit-converter',
  };
  return map[key] || 'steel-beam';
}

export const EngineeringCalcModule: React.FC<EngineeringCalcModuleProps> = ({
  activeProject,
  currentRole,
  activeTabKey,
  isProjectMode,
}) => {
  const calcId = useMemo(() => getCalcIdForTabKey(activeTabKey), [activeTabKey]);
  const calcDef = useMemo(() => CALC_REGISTRY[calcId], [calcId]);
  const release = useMemo(() => calculatorRelease(calcId), [calcId]);
  const [inputs, setInputs] = useState<CalcInputs>(() => defaultInputs(calcId));
  const [output, setOutput] = useState<ReturnType<typeof runCalculation> | null>(null);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'review' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showDerivation, setShowDerivation] = useState(false);

  const handleInputChange = (key: string, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    setOutput(runCalculation(calcId, inputs));
    setShowDerivation(false);
  };

  /** Persist only calculations released by the generated server/client policy. */
  const persistRecord = async () => {
    if (!output) return null;
    const identity = demoIdentity(currentRole);
    const results: Record<string, string | number> = {};
    output.results.forEach((r) => {
      results[r.label] = `${r.value.toFixed(2)} ${r.unit}${r.passes === true ? ' · PASS' : r.passes === false ? ' · FAIL' : ''}`;
    });
    const record = await architexApiEngineering.create(
      {
        project_id: isProjectMode ? activeProject.id : null,
        calc_type: calcId,
        inputs,
        results,
        derivation: output.derivation,
      },
      identity,
    );
    setSavedRecordId(record.id);
    return record;
  };

  const handleSave = async (sendToReview: boolean) => {
    if (!output) return;
    setSaveState('saving');
    setSaveMessage(null);
    const identity = demoIdentity(currentRole);
    try {
      let recordId = savedRecordId;
      if (!recordId) {
        const record = await persistRecord();
        if (!record) throw new Error('Could not save the calculation record.');
        recordId = record.id;
      }
      if (sendToReview) {
        await architexApiEngineering.sendToReview(recordId, identity);
        setSaveState('review');
        setSaveMessage('Calculation record sent to professional review.');
      } else {
        setSaveState('idle');
        setSaveMessage('Calculation saved as a controlled working record.');
      }
    } catch (err) {
      setSaveState('error');
      const detail = err instanceof Error ? err.message : 'Could not save the calculation record.';
      setSaveMessage(detail.replace(/^Architex API \d+: /, ''));
    }
  };

  const resetInputs = () => {
    setInputs(defaultInputs(calcId));
    setOutput(null);
    setSavedRecordId(null);
    setSaveState('idle');
    setSaveMessage(null);
  };

  return (
    <div className="space-y-4">
      {/* Workflow Ribbon */}
      <div className="flex items-center flex-wrap gap-2 text-[11px] text-[#657287] bg-[#f2f7f6] border border-[#102033]/10 rounded-xl px-4 py-2.5">
        <span className="font-bold text-[#167E79]">Engineering workflow</span>
        {[
          { icon: 'project_passport', label: 'Project context' },
          { icon: 'engineering_hub', label: 'Calculation' },
          { icon: 'document', label: 'Calculation record' },
          { icon: 'drawing', label: 'Drawing / RFI / Meeting' },
          { icon: 'workflow', label: 'Professional review' },
        ].map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 && <span className="text-[#102033]/20">→</span>}
            <span className="flex items-center gap-1">
              <OrigamiIcon name={step.icon} size={13} />
              <span className={i === 1 ? 'font-bold text-[#102033]' : 'text-[#657287]'}>{step.label}</span>
            </span>
          </React.Fragment>
        ))}
        <span className="ml-auto text-[10px] text-[#96a0ad]">
          {isProjectMode ? `${activeProject.name} · ${activeProject.stage}` : 'Unassigned / portfolio'}
        </span>
      </div>

      {/* Tool Banner */}
      <div className="flex items-center gap-2 text-[11px] text-[#657287] bg-white/80 border border-[#102033]/10 rounded-xl px-4 py-2">
        <OrigamiIcon name={calcDef?.icon || 'engineering_hub'} size={16} />
        <span className="font-bold text-[#102033]">{calcDef?.title || 'Calculator'}</span>
        <span className="text-[#96a0ad]">·</span>
        <span>{calcDef?.standard || 'Engineering reference'}</span>
        <span className="flex-1" />
        <span className="text-[10px] bg-[#DFF5F2] text-[#167E79] px-2 py-0.5 rounded-full">
          Advisory calculation · professional verification required
        </span>
      </div>

      {!release.recordable && (
        <div
          data-testid="calculator-containment"
          role="status"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12px] font-medium text-amber-900"
        >
          {release.message}
        </div>
      )}

      {/* Calculator Workspace */}
      {calcDef ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Input Panel */}
          <div className="lg:col-span-2 bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <OrigamiIcon name={calcDef.icon || 'engineering_hub'} size={20} />
              <h3 className="text-sm font-bold text-[#102033]">{calcDef.title}</h3>
              <span className="text-[10px] text-[#657287] ml-auto">{calcDef.standard}</span>
            </div>
            <div className="space-y-3">
              {calcDef.fields.map((field: CalcField) => (
                <div key={field.key}>
                  <label className="block text-[11px] font-medium text-[#657287] mb-1">
                    {field.label} <span className="text-[10px] text-[#96a0ad]">({field.unit})</span>
                  </label>
                  <input
                    type="number"
                    value={inputs[field.key] ?? field.default}
                    onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#102033]/15 rounded-lg text-[13px] text-[#102033] bg-white focus:outline-none focus:border-[#19B7B0] focus:ring-2 focus:ring-[#19B7B0]/15"
                    min={field.min}
                    max={field.max}
                    step="any"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCalculate}
                className="flex-1 px-4 py-2.5 bg-[#167E79] text-white text-[12px] font-bold rounded-xl hover:bg-[#116d68] transition-colors"
              >
                <OrigamiIcon name="engineering_hub" size={14} /> Calculate
              </button>
              <button
                onClick={resetInputs}
                className="px-4 py-2.5 bg-white border border-[#102033]/15 text-[#657287] text-[12px] font-medium rounded-xl hover:bg-[#f3f8f7] transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4">
            {output ? (
              <>
                <h3 className="text-sm font-bold text-[#102033]">Results</h3>
                <div className="space-y-2">
                  {output.results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#102033]/5">
                      <div>
                        <span className="text-[12px] text-[#657287]">{r.label}</span>
                        <span className="text-[10px] text-[#96a0ad] ml-2">({r.reference})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#102033]">{r.value.toFixed(2)}</span>
                        <span className="text-[11px] text-[#657287]">{r.unit}</span>
                        {r.passes !== null && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.passes ? 'bg-green-50 text-[#218956]' : 'bg-red-50 text-[#b34b3e]'
                          }`}>
                            {r.passes ? 'PASS' : 'FAIL'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Derivation */}
                <button
                  onClick={() => setShowDerivation(!showDerivation)}
                  className="text-[11px] text-[#167E79] font-medium hover:underline"
                >
                  {showDerivation ? 'Hide derivation' : 'Show derivation'}
                </button>
                {showDerivation && (
                  <div className="p-3 bg-[#f4f8f7] border-l-2 border-[#19B7B0] rounded-r-lg text-[11px] text-[#167E79] font-mono whitespace-pre-line">
                    {output.derivation}
                  </div>
                )}

                {/* Disclaimers */}
                {output.disclaimers.map((d, i) => (
                  <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                    ⚠ {d}
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-[#96a0ad]">
                <OrigamiIcon name="engineering_hub" size={48} />
                <p className="mt-3 text-[13px]">Enter inputs and click Calculate to see results.</p>
                <p className="text-[11px] mt-1">Calculation results are advisory working evidence.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#102033]/10 rounded-2xl p-8 text-center text-[#657287]">
          <p className="text-[13px]">Select a calculator from the navigator.</p>
        </div>
      )}

      {/* Save / Review Actions */}
      {output && release.recordable && (
        <div className="flex items-center gap-3 bg-white/80 border border-[#102033]/10 rounded-xl px-4 py-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saveState === 'saving'}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#102033]/15 text-[#657287] text-[11px] font-medium rounded-xl hover:bg-[#f3f8f7] transition-colors disabled:opacity-50"
          >
            <OrigamiIcon name="document" size={14} /> {saveState === 'saving' ? 'Saving…' : 'Save calculation'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saveState === 'saving'}
            className="flex items-center gap-2 px-4 py-2 bg-[#167E79] text-white text-[11px] font-bold rounded-xl hover:bg-[#116d68] transition-colors disabled:opacity-50"
          >
            <OrigamiIcon name="workflow" size={14} /> Send to review
          </button>
          {saveMessage && (
            <span className={`text-[11px] font-medium ml-auto ${saveState === 'error' ? 'text-[#b34b3e]' : 'text-[#218956]'}`}>
              {saveState === 'error' ? '✕ ' : '✓ '}{saveMessage}{savedRecordId ? ` · ${savedRecordId}` : ''}
            </span>
          )}
          {!saveMessage && (
            <span className="ml-auto text-[10px] text-[#96a0ad]">
              {isProjectMode ? `${activeProject.name} · ${activeProject.stage}` : 'Standalone engineering'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
