'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'refuse', label:'Refuse Area Calculator', group:'Calculator', icon:'refuse_calculator' },
  { key:'dimensions', label:'Dimension Inputs', group:'Calculator', icon:'detail' },
  { key:'results', label:'Results & Report', group:'Calculator', icon:'document' },
];

export function RefuseCalculatorModule({ activeProject, currentRole, activeTabKey = 'refuse', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [units, setUnits] = useState(24);
  const [occupantsPerUnit, setOccupantsPerUnit] = useState(3);
  const [collectionFreq, setCollectionFreq] = useState(2);

  // SANS 10400 Part A / municipal by-law: refuse storage calculation
  const totalOccupants = units * occupantsPerUnit;
  const dailyVolume = totalOccupants * 25; // 25 L/person/day (typical municipal standard)
  const storageDays = 7 / collectionFreq; // days between collections
  const requiredVolume = Math.ceil((dailyVolume * storageDays) / 1000); // litres → m³
  const containerCount = Math.max(1, Math.ceil(requiredVolume / 1.1)); // 1.1 m³ wheelie bins
  const areaPerContainer = 2.0; // m² incl. access
  const requiredArea = containerCount * areaPerContainer;
  const compliant = requiredArea <= 12;

  return <section className="space-y-4" aria-label="Refuse Area Calculator">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="refuse_calculator" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">SANS 10400 · municipal by-law</p><h1 className="text-xl font-bold">Refuse Area Calculator</h1><p className="text-xs text-[#657287]">{activeProject.code} · statutory refuse storage sizing</p></div></div>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'refuse' && <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">Inputs</h3>
        <div><label className="text-[10px] font-bold uppercase text-[#657287]">Dwelling units</label><input type="number" value={units} onChange={e => setUnits(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 w-full rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2.5 text-sm font-bold" /></div>
        <div><label className="text-[10px] font-bold uppercase text-[#657287]">Occupants / unit</label><input type="number" value={occupantsPerUnit} onChange={e => setOccupantsPerUnit(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 w-full rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2.5 text-sm font-bold" /></div>
        <div><label className="text-[10px] font-bold uppercase text-[#657287]">Collections / week</label><input type="number" value={collectionFreq} onChange={e => setCollectionFreq(Math.min(7, Math.max(1, parseInt(e.target.value) || 1)))} className="mt-1 w-full rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2.5 text-sm font-bold" /></div>
      </div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">Calculated Requirements</h3><div className="mt-3 space-y-2 text-xs">{[[`Total occupants`, `${totalOccupants}`],[`Daily refuse volume`, `${(dailyVolume/1000).toFixed(2)} m³`],[`Storage required`, `${requiredVolume.toFixed(2)} m³`],[`1.1 m³ containers`, `${containerCount}`],[`Storage area needed`, `${requiredArea.toFixed(1)} m²`]].map(([l,v]) => <div key={l} className="flex justify-between rounded-lg bg-[#f5faf9] p-2.5"><span className="text-[#657287]">{l}</span><span className="font-bold">{v}</span></div>)}</div></div>
      <div className={`rounded-2xl border p-5 shadow-sm ${compliant ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}><h3 className="text-sm font-bold">Compliance</h3><p className="mt-2 text-xs leading-5">{compliant ? '✓ The proposed refuse area (12 m² allowance) satisfies the calculated storage requirement with adequate access.' : `✗ Required area (${requiredArea.toFixed(1)} m²) exceeds the 12 m² allowance — enlarge the refuse room or increase collection frequency.`}</p><div className="mt-3 rounded-xl bg-white/70 p-3 text-[10px] text-[#526074]">Based on 25 L/person/day · SANS 10400 Part A and municipal refuse storage by-laws.</div></div>
    </div>}

    {tab === 'dimensions' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Dimension Inputs</h2><div className="grid gap-4 md:grid-cols-2">{[['Refuse room width','4.0 m','3.0 m minimum'],['Refuse room length','3.0 m','3.0 m minimum'],['Clearance for 240L bins','1.2 m','0.9 m minimum'],['Bin wash point','Provided','Required for >4 containers']].map(([l,v,note]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-4"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className="mt-1 text-lg font-bold">{v}</div><div className="text-[10px] text-[#526074]">{note}</div></div>)}</div><p className="text-xs text-[#657287]">Dimensions are checked against the current refuse area on drawing A-204.</p></div>}

    {tab === 'results' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Results & Report</h2><div className={`rounded-xl border p-4 text-xs ${compliant ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900'}`}><strong>Refuse storage compliance: {compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</strong><p className="mt-1">{requiredVolume.toFixed(2)} m³ storage required → {containerCount} × 1.1 m³ containers → {requiredArea.toFixed(1)} m² floor area.</p></div><div className="flex gap-2"><button className="rounded-xl bg-[#167E79] px-4 py-2 text-xs font-bold text-white">Export calculation report</button><button className="rounded-xl border px-4 py-2 text-xs font-bold">Link to municipal pack</button></div></div>}
  </section>;
}