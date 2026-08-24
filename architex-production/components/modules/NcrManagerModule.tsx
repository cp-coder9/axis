'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'register', label:'NCR Register', group:'Quality', icon:'risk' },
  { key:'rectification', label:'Rectification', group:'Quality', icon:'workflow' },
  { key:'linkage', label:'ITP & Hold Linkage', group:'Quality', icon:'itp' },
  { key:'closeout', label:'Close-out', group:'Quality', icon:'detail' },
];

const seed = [
  { id:'NCR-007', title:'Masonry walling out of plumb — Block 2 grid A-C/1-3', raisedBy:'Clerk of Works', date:'19 Aug', severity:'High', status:'Open', linked:'ITP-004' },
  { id:'NCR-006', title:'Waterproofing membrane laps below 100mm upstand', raisedBy:'Site Manager', date:'17 Aug', severity:'Medium', status:'Rectifying', linked:'ITP-009' },
  { id:'NCR-005', title:'Concrete cube 28-day result below spec (26.1 MPa)', raisedBy:'Engineer', date:'15 Aug', severity:'Critical', status:'Resolved', linked:'MAT-002' },
];

export function NcrManagerModule({ activeProject, currentRole, activeTabKey = 'register', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canClose = ['architect','engineer','cpm','site_manager','admin','platform_admin'].includes(currentRole);
  const advance = (id: string) => setItems(list => list.map(i => i.id === id ? { ...i, status: i.status === 'Open' ? 'Rectifying' : i.status === 'Rectifying' ? 'Resolved' : 'Open' } : i));

  return <section className="space-y-4" aria-label="Non-Conformance Reports">
    <PageHeader title="NCR Manager" origami={<OrigamiIcon name="ncr_manager" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#a13a2e]">Quality deviations</p><p>{activeProject.code} · deviations, rectification and hold-point linkage</p></>} actions={<div className="flex max-w-full items-center gap-2"><Button type="button" variant="ink" size="sm" className="shrink-0">+ Raise NCR</Button><nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="NCR Manager sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav></div>} />

    {tab === 'register' && <div className="grid gap-4 lg:grid-cols-2">{items.map(n => <article key={n.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="font-mono text-xs font-bold text-[#a13a2e]">{n.id}</span><h2 className="mt-1 text-sm font-bold">{n.title}</h2><p className="mt-2 text-xs text-[#657287]">Raised by {n.raisedBy} · {n.date} · Linked ITP checkpoint: {n.linked}</p></div><div className="flex flex-col items-end gap-1"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${n.severity === 'Critical' ? 'bg-red-100 text-red-700' : n.severity === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{n.severity}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${n.status === 'Resolved' ? 'bg-green-100 text-green-700' : n.status === 'Rectifying' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>{n.status}</span></div></div><Button type="button" variant="quiet" size="sm" disabled={!canClose} onClick={() => advance(n.id)} className="mt-4">{n.status === 'Open' ? 'Start rectification' : n.status === 'Rectifying' ? 'Close NCR' : 'Reopen'}</Button></article>)}</div>}

    {tab === 'rectification' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Rectification Workflow</h2>{[['NCR-007','Rectification method statement approved by Engineer · re-inspection scheduled 22 Aug','In progress'],['NCR-006','Contractor rectification in progress — inspection due','In progress'],['NCR-005','Concrete section core-tested and accepted · NCR closed','Closed']].map(([id,desc,status]) => <div key={id} className="rounded-xl border p-4"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#d95747]">{id}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Closed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{status}</span></div><p className="mt-2 text-xs leading-5 text-[#526074]">{desc}</p></div>)}</div>}

    {tab === 'linkage' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">ITP & Hold Point Linkage</h2><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs"><strong>NCR-007 ↔ ITP-004 (Hold Point breached):</strong> Block 2 masonry hold point remains unreleased until rectification passes re-inspection.</div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs"><strong>NCR-005 ↔ MAT-002:</strong> Cube failure triggered additional core sampling per SANS 5861-3.</div></div>}

    {tab === 'closeout' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Close-out</h2>{[['NCR-005','Closed 18 Aug · core test accepted · verified by Engineer','✓ Verified'],['NCR-006','Pending final inspection','Pending'],['NCR-007','Blocked on rectification','Blocked']].map(([id,desc,status]) => <div key={id} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#d95747]">{id}</span><div className="flex-1 text-xs text-[#526074]">{desc}</div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status.includes('Verified') ? 'bg-green-100 text-green-700' : status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>{status}</span></div>)}</div>}
  </section>;
}
