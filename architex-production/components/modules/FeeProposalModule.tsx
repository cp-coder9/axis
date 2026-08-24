'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'proposals', label:'Fee Proposals', group:'Fees', icon:'fee_proposal' },
  { key:'phases', label:'Phases & Stages', group:'Fees', icon:'workflow' },
  { key:'acceptance', label:'Acceptance', group:'Fees', icon:'approvals_queue' },
  { key:'invoicing', label:'Invoicing Link', group:'Fees', icon:'finance' },
];

const seed = [
  { id:'FP-005', title:'Architectural services — Design to Close-out', stage:'Design / Comply', fee:'R 1,240,000', status:'Pending client approval', date:'20 Aug' },
  { id:'FP-004', title:'QS services — BoQ & valuations', stage:'Procure / Pay', fee:'R 486,000', status:'Accepted', date:'14 Aug' },
  { id:'FP-003', title:'Fire engineering rational design', stage:'Comply', fee:'R 128,000', status:'Draft', date:'19 Aug' },
];

export function FeeProposalModule({ activeProject, currentRole, activeTabKey = 'proposals', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canEdit = ['architect','bep','firm_admin','quantity_surveyor','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="Fee Proposal Builder">
    <PageHeader title="Fee Proposal Builder" origami={<OrigamiIcon name="fee_proposal" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#806000]">Appoint-stage commercial terms</p><p>{activeProject.code} · stage-based professional fees</p></>} actions={<div className="flex max-w-full items-center gap-2"><Button type="button" variant="ink" size="sm" disabled={!canEdit} className="shrink-0">+ New Proposal</Button><nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Fee Proposal sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav></div>} />

    {tab === 'proposals' && <div className="grid gap-4 lg:grid-cols-2">{items.map(p => <article key={p.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="font-mono text-xs font-bold text-[#806000]">{p.id}</span><h2 className="mt-1 text-sm font-bold">{p.title}</h2><p className="mt-2 text-xs text-[#657287]">Stage: {p.stage} · {p.date}</p></div><div className="text-right"><div className="text-lg font-bold text-[#102033]">{p.fee}</div><span className={`mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${p.status === 'Accepted' ? 'bg-green-100 text-green-700' : p.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span></div></div><div className="mt-4 flex gap-2">{p.status === 'Draft' ? <Button type="button" variant="ink" size="sm" disabled={!canEdit}>Send to client</Button> : p.status === 'Pending client approval' ? <Button type="button" variant="quiet" size="sm" disabled={!canEdit}>Withdraw</Button> : <Button type="button" variant="quiet" size="sm" disabled={!canEdit}>View</Button>}</div></article>)}</div>}

    {tab === 'phases' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Stage-based fee schedule — FP-005</h2>{[['Brief & Appoint','R 86,000','7%'],['Design','R 372,000','30%'],['Comply & Municipal','R 186,000','15%'],['Procure','R 124,000','10%'],['Build (construction monitoring)','R 372,000','30%'],['Close-out','R 100,000','8%']].map(([stage,fee,pct]) => <div key={stage} className="flex items-center gap-3 rounded-xl border p-3"><div className="flex-1 text-xs font-semibold">{stage}</div><div className="text-xs font-bold">{fee}</div><div className="w-16 text-right text-[10px] text-[#657287]">{pct}</div><div className="h-1.5 w-24 rounded-full bg-gray-200"><div className="h-1.5 rounded-full bg-[#b77900]" style={{width:pct}} /></div></div>)}</div>}

    {tab === 'acceptance' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Acceptance Workflow</h2><div className="flex items-center gap-2">{['Draft','Sent','Client review','Accepted','Appointment'].map((s, i) => <div key={s} className="flex flex-1 items-center gap-1">{i > 0 && <div className="h-0.5 flex-1 bg-gray-200" />}<span className={`w-full rounded-full px-2 py-2 text-center text-[10px] font-bold ${i < 3 ? 'bg-[#b77900] text-white' : i === 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-[#657287]'}`}>{s}</span></div>)}</div><p className="text-xs text-[#657287]">Accepted proposals create the appointment record and hand off to Contract Administration and Team Workspace.</p></div>}

    {tab === 'invoicing' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Invoicing Milestones</h2>{[['M1 — Brief complete','R 86,000','Invoiced'],['M2 — Design 50%','R 186,000','Pending'],['M3 — Municipal submission','R 186,000','Upcoming']].map(([m,a,st]) => <div key={m} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{m}</div><div className="text-[10px] text-[#657287]">Linked to payment milestone {a}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Invoiced' ? 'bg-green-100 text-green-700' : st === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{st}</span></div>)}</div>}
  </section>;
}
