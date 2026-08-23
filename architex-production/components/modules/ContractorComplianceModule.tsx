'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'compliance', label:'Compliance Pack', group:'Compliance', icon:'contractor_compliance' },
  { key:'documents', label:'Document Register', group:'Compliance', icon:'document' },
  { key:'expiry', label:'Expiry Watch', group:'Compliance', icon:'risk' },
];

const seed = [
  { id:'DOC-001', doc:'COIDA letter of good standing', holder:'Stalcor Construction', expiry:'30 Nov 2026', status:'Valid' },
  { id:'DOC-002', doc:'SARS tax clearance (CSD)', holder:'Stalcor Construction', expiry:'15 Oct 2026', status:'Valid' },
  { id:'DOC-003', doc:'CIDB grading certificate', holder:'Stalcor Construction', expiry:'31 Dec 2026', status:'Valid' },
  { id:'DOC-004', doc:'BBBEE certificate', holder:'Stalcor Construction', expiry:'30 Sep 2026', status:'Expiring soon' },
];

export function ContractorComplianceModule({ activeProject, currentRole, activeTabKey = 'compliance', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canEdit = ['cpm','contractor','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="Contractor Compliance">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="contractor_compliance" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Pre-qualification & standing</p><h1 className="text-xl font-bold">Contractor Compliance</h1><p className="text-xs text-[#657287]">{activeProject.code} · COIDA, tax, CIDB, BBBEE</p></div></div>
      <div className="flex gap-2"><div className="rounded-xl bg-green-100 px-3 py-2 text-xs font-bold text-green-700">✓ Pre-qualified</div><button disabled={!canEdit} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">+ Add document</button></div>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'compliance' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Pre-qualification Summary</h2><div className="grid gap-3 md:grid-cols-3">{[['Overall status','Compliant','bg-green-500'],['Documents valid','3 of 4','bg-[#19B7B0]'],['Risk level','Low','bg-green-500']].map(([l,v,c]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-4"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className={`mt-1 text-xl font-bold ${c === 'bg-green-500' ? 'text-green-700' : 'text-[#167E79]'}`}>{v}</div></div>)}</div></div>}

    {tab === 'documents' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Document','Holder','Expiry','Status',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{items.map(d => <tr key={d.id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{d.id}</td><td className="px-4 py-3 font-semibold">{d.doc}</td><td className="px-4 py-3">{d.holder}</td><td className="px-4 py-3">{d.expiry}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${d.status === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{d.status}</span></td></tr>)}</tbody></table></div>}

    {tab === 'expiry' && <div className="space-y-3">{items.filter(d => d.status !== 'Valid').map(d => <div key={d.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#b77900]">{d.id}</span><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">{d.status}</span></div><p className="mt-2 text-sm font-bold">{d.doc}</p><p className="mt-1 text-xs text-[#526074]">Expires {d.expiry} — renewal reminder will be sent 60 days before expiry.</p></div>)}<div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-xs text-green-900">✓ 3 documents valid. No immediate action.</div></div>}
  </section>;
}