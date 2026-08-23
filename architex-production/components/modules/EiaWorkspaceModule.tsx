'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'eia', label:'EIA Workspace', group:'EIA', icon:'eia_workspace' },
  { key:'studies', label:'Specialist Studies', group:'EIA', icon:'detail' },
  { key:'empr', label:'EMPr', group:'EIA', icon:'document' },
  { key:'conditions', label:'Conditions of Approval', group:'EIA', icon:'workflow' },
];

export function EiaWorkspaceModule({ activeProject, currentRole, activeTabKey = 'eia', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [approved, setApproved] = useState(false);
  const canSubmit = ['architect','town_planner','bep','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="EIA Workspace">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#28a86b]/10 text-[#28a86b]"><OrigamiIcon name="eia_workspace" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#28a86b]">NEMA · EIA Regulations 2014</p><h1 className="text-xl font-bold">EIA Workspace</h1><p className="text-xs text-[#657287]">{activeProject.code} · Basic Assessment workflow</p></div></div>
      {approved ? <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">✓ BA Authorisation granted</span> : <button disabled={!canSubmit} onClick={() => setApproved(true)} className="rounded-xl bg-[#28a86b] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Submit BAR to DFFE</button>}
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#28a86b] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'eia' && <><div className="grid gap-4 md:grid-cols-4">{[['Process','Basic Assessment'],['BAR status','Drafting'],['Public review','Not started'],['Decision target','~90 days']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-xl font-bold">{v}</p></div>)}</div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">BAR progress</h3><span className="text-xl font-bold text-[#28a86b]">55%</span></div><div className="mt-3 h-3 rounded-full bg-gray-200"><div className="h-3 rounded-full bg-[#28a86b]" style={{width:'55%'}} /></div><p className="mt-2 text-xs text-[#657287]">Screening complete · specialist studies in progress · public participation pending</p></div></>}

    {tab === 'studies' && <div className="space-y-3">{[['Aquatic ecology — watercourse buffer','DWS · commissioned','In progress'],['Heritage impact','SAHRA · commissioned','In progress'],['Geotechnical (contamination)','Screening — not required','Complete'],['Noise assessment','Desktop study','Complete']].map(([study,authority,st]) => <div key={study} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex-1"><div className="text-xs font-bold">{study}</div><div className="text-[10px] text-[#657287]">{authority}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}</div>}

    {tab === 'empr' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Environmental Management Programme</h2>{[['Dust & noise control','Procedure drafted'],['Water management','Procedure drafted'],['Waste management','Pending'],['Rehabilitation plan','Pending']].map(([topic,st]) => <div key={topic} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1 text-xs font-bold">{topic}</div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Procedure drafted' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}</div>}

    {tab === 'conditions' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Conditions of Approval</h2>{approved ? [['C1','Watercourse buffer maintained ≥ 32m during construction','Active'],['C2','No construction within 30m of residences between 18:00-07:00','Active']].map(([c,cond,st]) => <div key={c} className="flex items-start gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#28a86b]">{c}</span><div className="flex-1 text-xs">{cond}</div><span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">{st}</span></div>) : <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">Conditions will appear here once the BAR is submitted and DFFE issues its decision.</div>}</div>}
  </section>;
}