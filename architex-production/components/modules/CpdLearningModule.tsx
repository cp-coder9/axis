'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'courses', label:'CPD Courses', group:'CPD', icon:'cpd_learning' },
  { key:'sacap', label:'SACAP Requirements', group:'CPD', icon:'detail' },
  { key:'history', label:'Learning History', group:'CPD', icon:'detail' },
  { key:'resources', label:'Reference Library', group:'CPD', icon:'document' },
];

const courses = [
  { id:'CPD-001', title:'SANS 10400 Updates 2026', provider:'SACAP Accredited', cat:'SACAP Cat 1', hours:4, status:'Complete' },
  { id:'CPD-002', title:'Construction Regulations 2024', provider:'SAIA', cat:'SACAP Cat 2', hours:6, status:'In progress' },
  { id:'CPD-003', title:'Contract Administration — JBCC 2018', provider:'SAIA', cat:'SACAP Cat 2', hours:8, status:'Complete' },
  { id:'CPD-004', title:'BIM for Built Environment', provider:'CETA', cat:'SACAP Cat 3', hours:12, status:'Available' },
  { id:'CPD-005', title:'Energy Efficiency in Buildings', provider:'SANS', cat:'SACAP Cat 1', hours:3, status:'Available' },
];

export function CpdLearningModule({ activeProject, currentRole, activeTabKey = 'courses', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [catalog, setCatalog] = useState(courses);
  const enroled = catalog.filter(c => c.status === 'Complete' || c.status === 'In progress').length;
  const totalHours = catalog.filter(c => c.status === 'Complete').reduce((s, c) => s + c.hours, 0);
  const canEnrol = ['architect','bep','engineer','quantity_surveyor','town_planner','cpm','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="CPD and Learning">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="cpd_learning" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">SACAP · SAIA · CETA</p><h1 className="text-xl font-bold">CPD & Learning</h1><p className="text-xs text-[#657287]">Continuing professional development tracking</p></div></div>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'courses' && <><div className="grid gap-4 md:grid-cols-4">{[['Courses',String(catalog.length)],['Enrolled',String(enroled)],['CPD hours earned',String(totalHours)],['SACAP annual target','18 / 25 hours']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <div className="space-y-3">{catalog.map(c => <article key={c.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="h-10 w-1 rounded-full bg-[#2563EB]" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#167E79]">{c.id}</span><h2 className="text-sm font-bold">{c.title}</h2><span className="rounded-full bg-[#DFF5F2] px-2 py-1 text-[10px] font-bold text-[#167E79]">{c.cat}</span></div><p className="mt-1 text-xs text-[#657287]">{c.provider} · {c.hours} hours</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${c.status === 'Complete' ? 'bg-green-100 text-green-700' : c.status === 'In progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{c.status}</span><button disabled={!canEnrol || c.status === 'Complete'} className="rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-40">{c.status === 'Available' ? 'Enrol' : c.status === 'In progress' ? 'Continue' : 'Certificate'}</button></article>)}</div></>}

    {tab === 'sacap' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">SACAP CPD Requirements</h2><div className="grid gap-3 md:grid-cols-3">{[['Category 1 — Formal','8 hours','2 complete'],['Category 2 — Structured','8 hours','5 complete'],['Category 3 — Unstructured','9 hours','3 complete']].map(([cat,req,progress]) => <div key={cat} className="rounded-xl bg-[#f5faf9] p-4"><div className="text-[10px] uppercase text-[#657287]">{cat}</div><div className="mt-1 text-lg font-bold">{req}</div><div className="text-[10px] text-[#526074]">{progress}</div></div>)}</div><p className="text-xs text-[#657287]">Annual cycle: 1 March to 28 February. Minimum 25 hours total across all categories.</p></div>}

    {tab === 'history' && <div className="rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Course','Category','Hours','Completed','Certificate'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['SANS 10400 Updates 2026','Cat 1','4','14 Jun 2026','Download'],['Contract Administration — JBCC','Cat 2','8','12 May 2026','Download'],['SANS 10400 Part XA','Cat 1','3','20 Apr 2026','Download']].map(([c,cat,h,date,action]) => <tr key={c} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-semibold">{c}</td><td className="px-4 py-3">{cat}</td><td className="px-4 py-3">{h}</td><td className="px-4 py-3 text-[#657287]">{date}</td><td className="px-4 py-3"><button className="text-[#167E79] font-bold">{action}</button></td></tr>)}</tbody></table></div>}

    {tab === 'resources' && <div className="grid gap-4 lg:grid-cols-2">{[['SANS 10400 Complete Set','PDF · 2,400 pages · 2024 edition'],['JBCC Principal Building Agreement','PDF · 64 pages · 2018 edition'],['SACAP Code of Conduct','PDF · 28 pages · 2025'],['Construction Regulations 2024','PDF · 86 pages · GN 1580']].map(([title,meta]) => <div key={title} className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs text-[#657287]">{meta}</p><button className="mt-3 rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79]">View</button></div>)}</div>}
  </section>;
}