'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'instructions', label:'Site Instructions', group:'Execution', icon:'rfi' },
  { key:'acknowledgements', label:'Acknowledgements', group:'Execution', icon:'detail' },
  { key:'cost', label:'Cost Implications', group:'Execution', icon:'budget' },
  { key:'audit', label:'Audit Trail', group:'Execution', icon:'workflow' },
];

const seed = [
  { id:'SI-023', title:'Relocate service duct at gridline 8 to achieve 1.5m escape width', issuedBy:'Architect', date:'20 Aug', status:'Acknowledged', cost:'+R 18,400' },
  { id:'SI-022', title:'Use 30 MPa concrete for podium slab per S-204 revision B', issuedBy:'Engineer', date:'19 Aug', status:'Pending', cost:'—' },
  { id:'SI-021', title:'Stop work — masonry out of plumb on Block 2 pending rectification', issuedBy:'Clerk of Works', date:'18 Aug', status:'Acknowledged', cost:'—' },
];

export function SiteInstructionsModule({ activeProject, currentRole, activeTabKey = 'instructions', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canIssue = ['architect','engineer','cpm','admin','platform_admin'].includes(currentRole);
  const acknowledge = (id: string) => setItems(list => list.map(i => i.id === id ? { ...i, status: i.status === 'Acknowledged' ? 'Pending' : 'Acknowledged' } : i));

  return <section className="space-y-4" aria-label="Site Instructions">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="site_instructions" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Formal architect/engineer directives</p><h1 className="text-xl font-bold">Site Instructions</h1><p className="text-xs text-[#657287]">{activeProject.code} · contractor acknowledgement + cost implications</p></div></div>
      <button disabled={!canIssue} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">+ Issue Instruction</button>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'instructions' && <div className="space-y-3">{items.map(i => <article key={i.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="h-10 w-1 rounded-full bg-[#2563EB]" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#167E79]">{i.id}</span><h2 className="text-sm font-bold">{i.title}</h2></div><p className="mt-1 text-xs text-[#657287]">Issued by {i.issuedBy} · {i.date} · Cost implication: {i.cost}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${i.status === 'Acknowledged' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{i.status}</span><button disabled={!canIssue && !['contractor','site_manager','cpm'].includes(currentRole)} onClick={() => acknowledge(i.id)} className="rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-40">{i.status === 'Acknowledged' ? 'Undo' : 'Acknowledge'}</button></article>)}</div>}

    {tab === 'acknowledgements' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Acknowledgement Status</h2>{items.map(i => <div key={i.id} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{i.id}</span><div className="flex-1 text-xs font-semibold">{i.title}</div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${i.status === 'Acknowledged' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{i.status === 'Acknowledged' ? 'Signed by Contractor · 20 Aug' : 'Awaiting contractor signature'}</span></div>)}</div>}

    {tab === 'cost' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Cost Implications</h2><div className="grid gap-3 md:grid-cols-3">{[['Total to date','+R 46,200','bg-[#FFB020]'],['Pending valuation','+R 18,400','bg-[#2563EB]'],['Variation orders','3 linked','bg-[#19B7B0]']].map(([l,v,c]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-4"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className={`mt-1 text-xl font-bold ${c === 'bg-[#FFB020]' ? 'text-[#b77900]' : c === 'bg-[#2563EB]' ? 'text-[#2563EB]' : 'text-[#167E79]'}`}>{v}</div></div>)}</div><p className="text-xs text-[#657287]">Cost implications feed the QS valuation and Contract Administration modules.</p></div>}

    {tab === 'audit' && <div className="rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Event','Instruction','Actor','When'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['Issued','SI-023','Justin Kruger (Architect)','20 Aug'],['Acknowledged','SI-021','Contractor Rep','18 Aug'],['Cost recorded','SI-023','QS','20 Aug']].map(([e,i,a,w]) => <tr key={e+i} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-bold">{e}</td><td className="px-4 py-3 font-mono text-[#167E79]">{i}</td><td className="px-4 py-3">{a}</td><td className="px-4 py-3 text-[#657287]">{w}</td></tr>)}</tbody></table></div>}
  </section>;
}