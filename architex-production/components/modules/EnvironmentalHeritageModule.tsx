'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'overview', label:'Overview', group:'EIA', icon:'dashboard' },
  { key:'screening', label:'Screening Report', group:'EIA', icon:'detail' },
  { key:'assessments', label:'Assessment Register', group:'EIA', icon:'workflow' },
  { key:'heritage', label:'Heritage Impact', group:'EIA', icon:'document' },
  { key:'public', label:'Public Participation', group:'EIA', icon:'team_workspace' },
];

const screenings = [
  { id:'SCR-001', aspect:'Site within 100m of a watercourse', status:'Requires assessment', authority:'DWS', due:'28 Aug' },
  { id:'SCR-002', aspect:'Site disturbance > 2,000 m² in urban area', status:'Requires assessment', authority:'DFFE', due:'28 Aug' },
  { id:'SCR-003', aspect:'Heritage resources on site (pre-1960 structures)', status:'Requires heritage study', authority:'SAHRA', due:'4 Sep' },
  { id:'SCR-004', aspect:'Noise impact — construction within 200m of residences', status:'Low risk', authority:'Municipal', due:'—' },
];

export function EnvironmentalHeritageModule({ activeProject, currentRole, activeTabKey = 'overview', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const pending = screenings.filter(s => s.status.includes('Requires')).length;

  return <section className="space-y-4" aria-label="Environmental & Heritage">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#28a86b]/10 text-[#28a86b]"><OrigamiIcon name="environmental_heritage" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#28a86b]">NEMA · SAHRA · DWS</p><h1 className="text-xl font-bold">Environmental & Heritage</h1><p className="text-xs text-[#657287]">{activeProject.code} · EIA screening, heritage impact, public participation</p></div></div>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#28a86b] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'overview' && <><div className="grid gap-4 md:grid-cols-4">{[['Screening items',String(screenings.length)],['Requires action',String(pending)],['Heritage risk','1 flag'],['Public participation','Not started']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950"><strong>Screening outcome:</strong> Basic Assessment (BA) required — site exceeds 2,000 m² disturbance threshold. Heritage study required for pre-1960 structures on site.</div></>}

    {tab === 'screening' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Aspect','Status','Authority','Due'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{screenings.map(s => <tr key={s.id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-semibold">{s.aspect}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${s.status === 'Low risk' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{s.status}</span></td><td className="px-4 py-3 font-mono text-[#167E79]">{s.authority}</td><td className="px-4 py-3 text-[#657287]">{s.due}</td></tr>)}</tbody></table></div>}

    {tab === 'assessments' && <div className="space-y-3">{[['Basic Assessment Report','DFFE','Not started · 30-day public review required'],['Water Use Licence Application','DWS','Drafting — specialist studies pending'],['Heritage Impact Assessment','SAHRA','Commissioned — desk-based study due 4 Sep']].map(([report,authority,status]) => <div key={report} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex-1"><div className="text-xs font-bold">{report}</div><div className="text-[10px] text-[#657287]">{authority} · {status}</div></div><button className="rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#28a86b]">Open</button></div>)}</div>}

    {tab === 'heritage' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Heritage Impact — SAHRA</h2><div className="rounded-xl bg-[#DFF5F2] p-4 text-xs"><strong>Pre-1960 structures identified:</strong> 2 ancillary farm buildings on the property. A heritage impact assessment has been commissioned. The HIA must be submitted to SAHRA before demolition or alteration permits can be issued.</div><div className="grid gap-3 md:grid-cols-2">{[['Building A','Pre-1920 · stone and mortar','Pending survey'],['Building B','c.1940 · corrugated iron','Pending survey']].map(([bld,desc,st]) => <div key={bld} className="rounded-xl border p-3"><div className="text-xs font-bold">{bld}</div><div className="text-[10px] text-[#657287]">{desc}</div><span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">{st}</span></div>)}</div></div>}

    {tab === 'public' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Public Participation</h2><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950"><strong>Not yet started.</strong> The Basic Assessment public participation process (30-day period) will be triggered when the BAR is submitted to DFFE. Stakeholders: ward councillor, adjacent landowners, relevant ratepayers&apos; association.</div></div>}
  </section>;
}