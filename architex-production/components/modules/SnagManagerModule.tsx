'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'register', label:'Snag Register', group:'Snags', icon:'itp' },
  { key:'zones', label:'Zones & Walkthroughs', group:'Snags', icon:'projects' },
  { key:'closeout', label:'Close-out Progress', group:'Snags', icon:'detail' },
  { key:'handover', label:'Handover', group:'Snags', icon:'document' },
];

const seed = [
  { id:'SNAG-042', title:'Scratched aluminium window frame — unit 12', zone:'Block 1 · Unit 12', severity:'Minor', status:'Open', due:'24 Aug' },
  { id:'SNAG-041', title:'Water stain on ceiling — podium level', zone:'Podium · Level 1', severity:'Major', status:'Rectifying', due:'23 Aug' },
  { id:'SNAG-040', title:'Balustrade fixing gaps at stair B', zone:'Stair B', severity:'Minor', status:'Resolved', due:'20 Aug' },
  { id:'SNAG-039', title:'Roof membrane blistering — 3 locations', zone:'Roof · Block 2', severity:'Critical', status:'Open', due:'26 Aug' },
];

export function SnagManagerModule({ activeProject, currentRole, activeTabKey = 'register', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canClose = ['architect','engineer','cpm','site_manager','contractor','admin','platform_admin'].includes(currentRole);
  const toggle = (id: string) => setItems(list => list.map(s => s.id === id ? { ...s, status: s.status === 'Resolved' ? 'Open' : 'Resolved' } : s));
  const open = items.filter(s => s.status === 'Open').length;
  const resolving = items.filter(s => s.status === 'Rectifying').length;
  const resolved = items.filter(s => s.status === 'Resolved').length;
  const pct = Math.round((resolved / items.length) * 100);

  return <section className="space-y-4" aria-label="Snag Manager">
    <PageHeader title="Snag Manager" origami={<OrigamiIcon name="snag_manager" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Defects to close-out</p><p>{activeProject.code} · zone-based snags toward practical completion</p></>} actions={<div className="flex max-w-full items-center gap-2"><Button type="button" variant="ink" size="sm" className="shrink-0">+ Log Snag</Button><nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Snag Manager sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav></div>} />

    {tab === 'register' && <><div className="grid gap-3 md:grid-cols-4">{[['Open',String(open)],['Rectifying',String(resolving)],['Resolved',String(resolved)],['Close-out',`${pct}%`]].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <div className="space-y-3">{items.map(s => <article key={s.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className={`h-10 w-1 rounded-full ${s.severity === 'Critical' ? 'bg-[#d95747]' : s.severity === 'Major' ? 'bg-[#FFB020]' : 'bg-[#19B7B0]'}`} /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#167E79]">{s.id}</span><h2 className="text-sm font-bold">{s.title}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${s.severity === 'Critical' ? 'bg-red-100 text-red-700' : s.severity === 'Major' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{s.severity}</span></div><p className="mt-1 text-xs text-[#657287]">Zone: {s.zone} · Due {s.due}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${s.status === 'Resolved' ? 'bg-green-100 text-green-700' : s.status === 'Rectifying' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>{s.status}</span><button disabled={!canClose} onClick={() => toggle(s.id)} className="rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-40">{s.status === 'Resolved' ? 'Reopen' : 'Mark resolved'}</button></article>)}</div></>}

    {tab === 'zones' && <div className="grid gap-4 lg:grid-cols-3">{[['Block 1','12 snags · 8 open','68%'],['Block 2','14 snags · 6 open','71%'],['Podium & Roof','9 snags · 3 open','78%']].map(([zone,meta,pct]) => <div key={zone} className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">{zone}</h3><p className="mt-1 text-xs text-[#657287]">{meta}</p><div className="mt-3 h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-[#19B7B0]" style={{width:pct}} /></div><p className="mt-1 text-[10px] font-bold text-[#167E79]">{pct} complete</p><button className="mt-3 rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79]">Walkthrough →</button></div>)}</div>}

    {tab === 'closeout' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Close-out Progress</h2><div className="flex items-center gap-2">{['Open','Rectifying','Resolved'].map((s, i) => <div key={s} className="flex flex-1 items-center gap-1">{i > 0 && <div className="h-0.5 flex-1 bg-gray-200" />}<span className={`w-full rounded-full px-3 py-2 text-center text-[10px] font-bold ${i === 2 ? 'bg-[#19B7B0] text-white' : 'bg-gray-100 text-[#657287]'}`}>{s}: {i === 0 ? open : i === 1 ? resolving : resolved}</span></div>)}</div><p className="text-xs text-[#657287]">Practical completion certificate can be requested when all Critical and Major snags are resolved.</p></div>}

    {tab === 'handover' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Handover Readiness</h2><div className="grid gap-3 md:grid-cols-3">{[['Snags resolved','82%','bg-green-500'],['O&M manuals','4 of 6 received','bg-[#FFB020]'],['Warranties','3 of 8 logged','bg-[#FFB020]']].map(([l,v,c]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-4"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className="mt-1 text-xl font-bold">{v}</div><div className="mt-2 h-2 rounded-full bg-gray-200"><div className={`h-2 rounded-full ${c}`} style={{width: typeof v === 'string' && v.includes('%') ? v : '40%'}} /></div></div>)}</div><div className="rounded-xl border border-[#19B7B0]/20 bg-[#DFF5F2] p-4 text-xs"><strong>Next:</strong> FM Bridge handover pack — as-built drawings, O&M, warranties and close-out certificates.</div></div>}
  </section>;
}
