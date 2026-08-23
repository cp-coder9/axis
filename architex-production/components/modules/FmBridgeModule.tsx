'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'handover', label:'Handover Pack', group:'Handover', icon:'fm_bridge' },
  { key:'assets', label:'Asset Register', group:'Handover', icon:'detail' },
  { key:'warranties', label:'Warranties & Manuals', group:'Handover', icon:'document' },
  { key:'defects', label:'Defects Period', group:'Handover', icon:'snag_manager' },
];

export function FmBridgeModule({ activeProject, currentRole, activeTabKey = 'handover', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [packed, setPacked] = useState(false);
  const canIssue = ['architect','cpm','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="FM Bridge">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="fm_bridge" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Facilities management handover</p><h1 className="text-xl font-bold">FM Bridge</h1><p className="text-xs text-[#657287]">{activeProject.code} · as-built data to facility managers</p></div></div>
      {packed ? <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">✓ Handover pack issued</span> : <button disabled={!canIssue} onClick={() => setPacked(true)} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Issue handover pack</button>}
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'handover' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Handover Pack Readiness</h2><div className="space-y-2">{[['As-built drawings (Rev P03/P02)','4 of 6 sets','In progress'],['O&M manuals','4 of 6','In progress'],['Warranty certificates','3 of 8','In progress'],['Maintenance schedules','0 of 6','Pending'],['As-built BIM model','Linked','Ready']].map(([item,meta,st]) => <div key={item} className="flex items-center gap-3 rounded-xl border p-3"><div className="flex-1"><div className="text-xs font-semibold">{item}</div><div className="text-[10px] text-[#657287]">{meta}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Ready' ? 'bg-green-100 text-green-700' : st === 'In progress' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{st}</span></div>)}</div></div>}

    {tab === 'assets' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Asset','Category','Location','Condition'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['HVAC unit AHU-01','Mechanical','Roof · Block 1','New'],['Fire panel FP-01','Fire','Lobby','New'],['Water tank WT-01','Plumbing','Basement','New'],['Generators G-01/02','Electrical','Plant room','New']].map(([a,c,l,cond]) => <tr key={a} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-semibold">{a}</td><td className="px-4 py-3">{c}</td><td className="px-4 py-3">{l}</td><td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">{cond}</span></td></tr>)}</tbody></table></div>}

    {tab === 'warranties' && <div className="space-y-3">{[['Waterproofing — 10-year warranty','Protec Membranes','Issued'],['Roof sheeting — 5 years','RoofTech SA','Pending'],['Aluminium windows — 5 years','GlazeCo','Issued'],['HVAC — 2 years','HVAC Solutions','Pending']].map(([w,supplier,st]) => <div key={w} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex-1"><div className="text-xs font-bold">{w}</div><div className="text-[10px] text-[#657287]">{supplier}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Issued' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}</div>}

    {tab === 'defects' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Defects Liability Period</h2><div className="grid gap-3 md:grid-cols-3">{[['Defects period','6 months','from practical completion'],['Open snags','9','down from 42'],['Snag resolution','92%','resolved to date']].map(([l,v,m]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-4"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className="mt-1 text-xl font-bold">{v}</div><div className="text-[10px] text-[#526074]">{m}</div></div>)}</div><p className="text-xs text-[#657287]">FM Bridge keeps the facilities team in sync with snag close-out during the defects period.</p></div>}
  </section>;
}