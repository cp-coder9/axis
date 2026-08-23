'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'contracts', label:'Contracts', group:'Contracts', icon:'contract_admin' },
  { key:'certificates', label:'Payment Certificates', group:'Contracts', icon:'finance' },
  { key:'variations', label:'Variation Orders', group:'Contracts', icon:'workflow' },
  { key:'claims', label:'Claims & EoT', group:'Contracts', icon:'risk' },
];

const seed = [
  { id:'CON-001', title:'Main building contract — JBCC 2018 Principal Building Agreement', party:'Stalcor Construction (Pty) Ltd', value:'R 42,800,000', status:'Active', date:'01 Jun 2026' },
  { id:'CON-002', title:'Professional services agreement — QS', party:'Pieterse & Associates', value:'R 486,000', status:'Active', date:'14 Aug 2026' },
  { id:'CON-003', title:'Subcontract — fenestration supply & install', party:'GlazeCo Fenestration', value:'R 2,140,000', status:'Draft', date:'Pending' },
];

export function ContractAdminModule({ activeProject, currentRole, activeTabKey = 'contracts', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canEdit = ['architect','quantity_surveyor','cpm','firm_admin','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="Contract Administration">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-[#d95747]"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FF6B6B]/10 text-[#d95747]"><OrigamiIcon name="contract_admin" size={26} /></div></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d95747]">JBCC / NEC administration</p><h1 className="text-xl font-bold">Contract Administration</h1><p className="text-xs text-[#657287]">{activeProject.code} · certificates, variations, claims and EoT</p></div></div>
      <button disabled={!canEdit} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">+ New Contract</button>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'contracts' && <div className="space-y-3">{items.map(c => <article key={c.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="h-10 w-1 rounded-full bg-[#19B7B0]" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#167E79]">{c.id}</span><h2 className="text-sm font-bold">{c.title}</h2></div><p className="mt-1 text-xs text-[#657287]">{c.party} · {c.date}</p></div><div className="text-right"><div className="text-sm font-bold">{c.value}</div><span className={`mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{c.status}</span></div><button disabled={!canEdit} className="rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-40">Open</button></article>)}</div>}

    {tab === 'certificates' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Certificate','Contract','Value','Retention','Status',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['PC-05','CON-001','R 2,140,000','R 107,000','Prepared','Approve'],['PC-04','CON-001','R 4,280,000','R 214,000','Certified',''],['PC-03','CON-001','R 3,850,000','R 192,500','Paid','']].map(([c,co,v,ret,st,btn],i) => <tr key={i} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{c}</td><td className="px-4 py-3">{co}</td><td className="px-4 py-3 font-bold">{v}</td><td className="px-4 py-3">{ret}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Paid' ? 'bg-green-100 text-green-700' : st === 'Certified' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></td><td className="px-4 py-3">{btn && <button disabled={!canEdit} className="rounded-lg bg-[#167E79] px-2.5 py-1 text-[10px] font-bold text-white disabled:opacity-40">{btn}</button>}</td></tr>)}</tbody></table></div>}

    {tab === 'variations' && <div className="space-y-3">{[['VO-004','Waterproofing specification upgrade — podium','+R 86,000','QS review'],['VO-003','Additional fenestration — north façade','+R 142,000','Approved'],['VO-002','Stormwater attenuation chamber','+R 98,500','Approved']].map(([id,title,amt,st]) => <div key={id} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"><span className="font-mono text-xs font-bold text-[#d95747]">{id}</span><div className="flex-1"><div className="text-xs font-bold">{title}</div><div className="text-[10px] text-[#657287]">Amount: {amt}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}</div>}

    {tab === 'claims' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Claims & Extension of Time</h2>{[['EOT-01','Rainfall delay — 14 days (record rainfall)','Under review','cpm'],['CLM-02','Additional scaffolding due to VO-003','Submitted','qs'],['CLM-01','Preliminary & general cost escalation','Resolved','architect']].map(([id,title,st,owner]) => <div key={id} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{id}</span><div className="flex-1"><div className="text-xs font-bold">{title}</div><div className="text-[10px] text-[#657287]">Owner: {owner}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Resolved' ? 'bg-green-100 text-green-700' : st === 'Under review' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{st}</span></div>)}</div>}
  </section>;
}