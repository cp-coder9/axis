'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'applications', label:'Council Applications', group:'Council', icon:'council_navigator' },
  { key:'checklist', label:'Submission Checklist', group:'Council', icon:'detail' },
  { key:'status', label:'Application Status', group:'Council', icon:'workflow' },
  { key:'refs', label:'Council References', group:'Council', icon:'document' },
];

const seed = [
  { id:'APP-001', title:'Building plan approval — Faerie Glen', council:'City of Tshwane', ref:'eTSH-8841', status:'Scrutiny', updated:'20 Aug' },
  { id:'APP-002', title:'Land-use consent — erf 1820 portion 1', council:'City of Tshwane', ref:'LU-2026-118', status:'Circulation', updated:'18 Aug' },
  { id:'APP-003', title:'Stormwater discharge permit', council:'City of Tshwane', ref:'SW-2026-042', status:'Submitted', updated:'17 Aug' },
];

export function CouncilNavigatorModule({ activeProject, currentRole, activeTabKey = 'applications', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canEdit = ['architect','town_planner','cpm','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="Council Drawing Navigator">
    <PageHeader title="Council Drawing Navigator" origami={<OrigamiIcon name="council_navigator" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Municipal application tracking</p><p>{activeProject.code} · building plans, land-use, permits</p></>} actions={<div className="flex max-w-full items-center gap-2"><Button type="button" variant="ink" size="sm" disabled={!canEdit} className="shrink-0">+ New application</Button><nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Council Navigator sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav></div>} />

    {tab === 'applications' && <div className="space-y-3">{items.map(a => <article key={a.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="h-10 w-1 rounded-full bg-[#2563EB]" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#167E79]">{a.id}</span><h2 className="text-sm font-bold">{a.title}</h2></div><p className="mt-1 text-xs text-[#657287]">{a.council} · Ref {a.ref} · Updated {a.updated}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${a.status === 'Approved' ? 'bg-green-100 text-green-700' : a.status === 'Scrutiny' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{a.status}</span><button disabled={!canEdit} className="rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-40">Open</button></article>)}</div>}

    {tab === 'checklist' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Submission Checklist — APP-001</h2>{[['Completed application form','✓'],['Title deed copy','✓'],['SG diagram','✓'],['Building plans (2 sets, signed)','✓'],['SANS 10400-XA declaration','✓'],['Municipal fees receipt','Pending'],['Energy compliance (BAR)','Pending']].map(([item,st]) => <div key={item} className="flex items-center gap-3 rounded-xl border p-3"><div className="flex-1 text-xs font-semibold">{item}</div>{st === '✓' ? <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">✓ Complete</span> : <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">Pending</span>}</div>)}</div>}

    {tab === 'status' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4"><h2 className="text-base font-bold">Application Status Flow</h2><div className="flex items-center gap-1">{['Received','Screened','Circulated','Scrutiny','Decision','Approved'].map((s, i) => <div key={s} className="flex flex-1 items-center gap-1">{i > 0 && <div className="h-0.5 flex-1 bg-gray-200" />}<span className={`w-full rounded-full px-2 py-2 text-center text-[9px] font-bold ${i < 4 ? 'bg-[#2563EB] text-white' : i === 4 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-[#657287]'}`}>{s}</span></div>)}</div><p className="text-xs text-[#657287]">Statutory decision target: 60 working days from receipt. Day 34 elapsed.</p></div>}

    {tab === 'refs' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Council References</h2>{items.map(a => <div key={a.id} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{a.ref}</span><div className="flex-1"><div className="text-xs font-semibold">{a.title}</div><div className="text-[10px] text-[#657287]">{a.council}</div></div><button className="rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79]">Correspondence</button></div>)}</div>}
  </section>;
}
