'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'payments', label:'Payment Workflow', group:'Payments', icon:'payments_escrow' },
  { key:'milestones', label:'Milestones', group:'Payments', icon:'workflow' },
  { key:'approvals', label:'Approval & Release', group:'Payments', icon:'approvals_queue' },
  { key:'audit', label:'Payment Audit', group:'Payments', icon:'detail' },
];

const seed = [
  { id:'PAY-001', title:'Valuation 5 — main contractor', amount:'R 2,140,000', stage:'Prepared', due:'24 Aug', payer:'Client' },
  { id:'PAY-002', title:'QS milestone 2 — BoQ completion', amount:'R 97,200', stage:'Awaiting approval', due:'26 Aug', payer:'Client' },
  { id:'PAY-003', title:'Fire engineer — rational design fee', amount:'R 128,000', stage:'Approved', due:'18 Aug', payer:'Architect' },
];

export function PaymentsEscrowModule({ activeProject, currentRole, activeTabKey = 'payments', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canApprove = ['architect','quantity_surveyor','cpm','admin','platform_admin'].includes(currentRole);
  const advance = (id: string) => setItems(list => list.map(i => i.id === id ? { ...i, stage: i.stage === 'Prepared' ? 'Awaiting approval' : i.stage === 'Awaiting approval' ? 'Approved' : 'Released' } : i));

  return <section className="space-y-4" aria-label="Payments and Escrow">
    <PageHeader title="Payments & Escrow" origami={<OrigamiIcon name="payments_escrow" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#806000]">Workflow only · no fund holding</p><p>{activeProject.code} · invoice, milestone and release-status tracking</p></>} actions={<nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Payments and Escrow sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav>} />
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950"><strong>Workflow-only mode.</strong> Architex tracks payment status, approvals and release states. Fund holding / true escrow is disabled pending legal review and a licensed payment partner.</div>

    {tab === 'payments' && <div className="space-y-3">{items.map(p => <article key={p.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="h-10 w-1 rounded-full bg-[#FFB020]" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#806000]">{p.id}</span><h2 className="text-sm font-bold">{p.title}</h2></div><p className="mt-1 text-xs text-[#657287]">Payer: {p.payer} · Due {p.due}</p></div><div className="text-right"><div className="text-sm font-bold">{p.amount}</div><span className={`mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${p.stage === 'Approved' || p.stage === 'Released' ? 'bg-green-100 text-green-700' : p.stage === 'Awaiting approval' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{p.stage}</span></div><Button type="button" variant="quiet" size="sm" disabled={!canApprove || p.stage === 'Released'} onClick={() => advance(p.id)}>{p.stage === 'Prepared' ? 'Submit' : p.stage === 'Awaiting approval' ? 'Approve' : 'Released'}</Button></article>)}</div>}

    {tab === 'milestones' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Milestone Schedule</h2>{[['M1 — Brief complete','R 86,000','Paid'],['M2 — Design 50%','R 186,000','Paid'],['M3 — Municipal submission','R 186,000','Approved'],['M4 — Construction 50%','R 640,000','Upcoming']].map(([m,a,st]) => <div key={m} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{m}</div><div className="text-[10px] text-[#657287]">{a}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Paid' ? 'bg-green-100 text-green-700' : st === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{st}</span></div>)}</div>}

    {tab === 'approvals' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Approval & Release States</h2><div className="flex items-center gap-2">{['Prepared','Verified','Approved','Released','Paid'].map((s, i) => <div key={s} className="flex flex-1 items-center gap-1">{i > 0 && <div className="h-0.5 flex-1 bg-gray-200" />}<span className={`w-full rounded-full px-2 py-2 text-center text-[10px] font-bold ${i < 3 ? 'bg-[#b77900] text-white' : 'bg-gray-100 text-[#657287]'}`}>{s}</span></div>)}</div><p className="text-xs text-[#657287]">Each transition requires the responsible role and is written to the payment audit trail.</p></div>}

    {tab === 'audit' && <div className="rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Event','Payment','Actor','When'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['Prepared','PAY-001','QS','20 Aug'],['Submitted','PAY-002','Architect','20 Aug'],['Approved','PAY-003','Client rep','18 Aug']].map(([e,p,a,w]) => <tr key={e+p} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-bold">{e}</td><td className="px-4 py-3 font-mono text-[#b77900]">{p}</td><td className="px-4 py-3">{a}</td><td className="px-4 py-3 text-[#657287]">{w}</td></tr>)}</tbody></table></div>}
  </section>;
}
