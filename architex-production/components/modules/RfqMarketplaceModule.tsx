'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'rfqs', label:'RFQ Pipeline', group:'Procure', icon:'rfq_marketplace' },
  { key:'packages', label:'Work Packages', group:'Procure', icon:'document' },
  { key:'quotes', label:'Quote Comparison', group:'Procure', icon:'detail' },
  { key:'awards', label:'Awards & Orders', group:'Procure', icon:'workflow' },
];

const seed = [
  { id:'RFQ-011', title:'Fenestration supply & installation', trade:'Windows', deadline:'24 Aug', quotes:2, status:'Open' },
  { id:'RFQ-010', title:'Waterproofing — podium and roof', trade:'Waterproofing', deadline:'26 Aug', quotes:3, status:'Open' },
  { id:'RFQ-009', title:'Structural steel — balustrades', trade:'Steel', deadline:'19 Aug', quotes:4, status:'Awarded' },
];

export function RfqMarketplaceModule({ activeProject, currentRole, activeTabKey = 'rfqs', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canManage = ['architect','bep','quantity_surveyor','cpm','firm_admin','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="RFQ Marketplace">
    <PageHeader title="RFQ Marketplace" origami={<OrigamiIcon name="rfq_marketplace" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Package-based procurement</p><p>{activeProject.code} · controlled requests, transparent comparisons</p></>} actions={<div className="flex max-w-full items-center gap-2"><Button type="button" variant="ink" size="sm" disabled={!canManage} className="shrink-0">+ New RFQ</Button><nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="RFQ Marketplace sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav></div>} />

    {tab === 'rfqs' && <div className="space-y-3">{items.map(r => <article key={r.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="h-10 w-1 rounded-full bg-[#19B7B0]" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#135f5a]">{r.id}</span><h2 className="text-sm font-bold">{r.title}</h2><span className="rounded-full bg-[#DFF5F2] px-2 py-1 text-[10px] font-bold text-[#135f5a]">{r.trade}</span></div><p className="mt-1 text-xs text-[#657287]">Closes {r.deadline} · {r.quotes} quotes received</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${r.status === 'Awarded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span><Button type="button" variant="quiet" size="sm" disabled={!canManage}>{r.status === 'Open' ? 'Compare quotes' : 'View award'}</Button></article>)}</div>}

    {tab === 'packages' && <div className="grid gap-4 lg:grid-cols-3">{[['Fenestration','48.5 m² double glazing + stacker doors','BoM-006 linked'],['Waterproofing','4mm APP torch-on + upstands','BoM-005 linked'],['Steelwork','Balustrades + handrails','BoM-003 linked']].map(([name,scope,link]) => <div key={name} className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">{name}</h3><p className="mt-1 text-xs text-[#657287]">{scope}</p><p className="mt-3 rounded-lg bg-[#f5faf9] px-2 py-1 text-[10px] font-mono text-[#167E79]">{link}</p><button className="mt-3 rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79]">Issue RFQ from package</button></div>)}</div>}

    {tab === 'quotes' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['RFQ','Supplier','Amount','Lead time','Compliance',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['RFQ-010','Protec Membranes (Pty) Ltd','R 342,000','3 weeks','CIDB 4SQ','Recommended'],['RFQ-010','AquaSeal Solutions','R 368,500','4 weeks','CIDB 3SQ',''],['RFQ-010','RoofTech SA','R 331,200','2 weeks','CIDB 4SQ','Recommended']].map(([rfq,sup,amt,lead,comp,rec],i) => <tr key={i} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{rfq}</td><td className="px-4 py-3 font-semibold">{sup}</td><td className="px-4 py-3 font-bold">{amt}</td><td className="px-4 py-3">{lead}</td><td className="px-4 py-3">{comp}</td><td className="px-4 py-3">{rec && <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">{rec}</span>}</td></tr>)}</tbody></table></div>}

    {tab === 'awards' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Awards & Purchase Orders</h2>{[['RFQ-009','Stalcor Steel — balustrades','PO-014 · R 186,000','Issued'],['RFQ-008','Masonry suppliers — face brick','PO-013 · R 312,000','Issued']].map(([rfq,sup,po,st]) => <div key={rfq} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{rfq}</span><div className="flex-1"><div className="text-xs font-bold">{sup}</div><div className="text-[10px] text-[#657287]">{po}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Issued' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}<p className="text-xs text-[#657287]">Awards link to Contract Administration and Supplier Catalogue for order tracking.</p></div>}
  </section>;
}
