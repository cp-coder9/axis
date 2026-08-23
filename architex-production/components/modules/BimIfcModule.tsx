'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'overview', label:'Overview', group:'BIM', icon:'dashboard' },
  { key:'models', label:'Model Register', group:'BIM', icon:'bim_ifc' },
  { key:'extraction', label:'IFC Extraction', group:'BIM', icon:'drawing' },
  { key:'mapping', label:'Property Mapping', group:'BIM', icon:'detail' },
  { key:'audit', label:'Extraction Audit', group:'BIM', icon:'workflow' },
];

const seedModels = [
  { id:'BIM-001', model:'Architectural Model', author:'Revit 2026', revision:'v3.2', discipline:'Architecture', elements:2841, extracted:false },
  { id:'BIM-002', model:'Structural Model', author:'Revit 2026', revision:'v2.1', discipline:'Structural', elements:1954, extracted:false },
  { id:'BIM-003', model:'MEP Coordination Model', author:'Revit 2026', revision:'v1.4', discipline:'MEP', elements:1327, extracted:false },
];

export function BimIfcModule({ activeProject, currentRole, activeTabKey = 'overview', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [models, setModels] = useState(() => seedModels);
  const canRun = ['architect','bep','engineer','admin','platform_admin'].includes(currentRole);
  const runExtraction = (id: string) => setModels(list => list.map(m => m.id === id ? { ...m, extracted: true } : m));

  return <section className="space-y-4" aria-label="BIM / IFC Extraction">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="bim_ifc" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Read & extract only</p><h1 className="text-xl font-bold">BIM / IFC Extraction</h1><p className="text-xs text-[#657287]">{activeProject.code} · shared drawing-intelligence consumer</p></div></div>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'overview' && <><div className="grid gap-4 md:grid-cols-4">{[['Linked models',String(models.length)],['Elements',String(models.reduce((s,m) => s + m.elements, 0))],['Extracted',String(models.filter(m => m.extracted).length)],['AI candidates','4']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-xs text-violet-950"><strong>Shared drawing-intelligence service:</strong> extraction jobs use the same pipeline as SpecForge, BoM, Municipal and XA. All extracted candidates require human acceptance before they become project records.</div></>}

    {tab === 'models' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Model','Author','Revision','Discipline','Elements','Extracted',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{models.map(m => <tr key={m.id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{m.id}</td><td className="px-4 py-3 font-semibold">{m.model}</td><td className="px-4 py-3">{m.author}</td><td className="px-4 py-3">{m.revision}</td><td className="px-4 py-3">{m.discipline}</td><td className="px-4 py-3">{m.elements.toLocaleString()}</td><td className="px-4 py-3">{m.extracted ? <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">✓</span> : <button disabled={!canRun} onClick={() => runExtraction(m.id)} className="rounded-lg bg-[#167E79] px-2.5 py-1 text-[10px] font-bold text-white disabled:opacity-40">Extract IFC</button>}</td></tr>)}</tbody></table></div>}

    {tab === 'extraction' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Extraction Pipeline</h2>{[['BIM-001','Spatial → quantity takeoff → BoM link','Queued'],['BIM-002','Structural framing → steel quantities','Review required'],['BIM-003','MEP equipment schedule → SpecForge','Queued']].map(([model,job,st]) => <div key={model} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{model}</span><div className="flex-1"><div className="text-xs font-semibold">{job}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Review required' ? 'bg-amber-100 text-amber-800' : st === 'Queued' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{st}</span></div>)}<div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"><strong>Extraction is read-only.</strong> This module never edits the source model; it extracts structured data candidates for human review.</div></div>}

    {tab === 'mapping' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Property Mapping</h2><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['IFC Property','Architex Field','Confidence',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['IfcWall / Area','wall_area_m2','0.92','Accepted'],['IfcWindow / Height','window_height_m','0.88','Candidate'],['IfcSlab / Thickness','slab_thickness_mm','0.95','Candidate']].map(([ifc,ax,conf,st]) => <tr key={ifc} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono text-[#167E79]">{ifc}</td><td className="px-4 py-3">{ax}</td><td className="px-4 py-3">{conf}</td><td className="px-4 py-3">{st === 'Accepted' ? <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">✓ Accepted</span> : <button disabled={!canRun} className="rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79] disabled:opacity-40">Review</button>}</td></tr>)}</tbody></table></div></div>}

    {tab === 'audit' && <div className="rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Event','Model','Actor','When'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['Linked','BIM-003','Justin Kruger','20 Aug'],['Extraction queued','BIM-001','Justin Kruger','20 Aug'],['Candidate accepted','BIM-002','Engineer','19 Aug']].map(([e,m,a,w]) => <tr key={e+m} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-bold">{e}</td><td className="px-4 py-3 font-mono text-[#167E79]">{m}</td><td className="px-4 py-3">{a}</td><td className="px-4 py-3 text-[#657287]">{w}</td></tr>)}</tbody></table></div>}
  </section>;
}