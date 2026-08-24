'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'catalogue', label:'Supplier Catalogue', group:'Suppliers', icon:'supplier_catalog' },
  { key:'products', label:'Products & Data', group:'Suppliers', icon:'detail' },
  { key:'verification', label:'Verification', group:'Suppliers', icon:'approvals_queue' },
  { key:'orders', label:'Order Tracking', group:'Suppliers', icon:'workflow' },
];

const seed = [
  { id:'SUP-001', name:'Protec Membranes (Pty) Ltd', trade:'Waterproofing', rating:4.6, verified:true, orders:2 },
  { id:'SUP-002', name:'Stalcor Steel', trade:'Structural Steel', rating:4.3, verified:true, orders:1 },
  { id:'SUP-003', name:'Cape Brick Distributors', trade:'Masonry', rating:4.1, verified:false, orders:0 },
  { id:'SUP-004', name:'GlazeCo Fenestration', trade:'Windows', rating:4.8, verified:true, orders:0 },
];

export function SupplierCatalogModule({ activeProject, currentRole, activeTabKey = 'catalogue', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canVerify = ['architect','quantity_surveyor','cpm','admin','platform_admin'].includes(currentRole);
  const toggleVerify = (id: string) => setItems(list => list.map(s => s.id === id ? { ...s, verified: !s.verified } : s));

  return <section className="space-y-4" aria-label="Supplier Catalogue">
    <PageHeader title="Supplier Catalogue" origami={<OrigamiIcon name="supplier_catalog" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Verified supply chain</p><p>{activeProject.code} · compliance-checked suppliers with product data</p></>} actions={<div className="flex max-w-full items-center gap-2"><Button type="button" variant="ink" size="sm" className="shrink-0">+ Add supplier</Button><nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Supplier Catalogue sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav></div>} />

    {tab === 'catalogue' && <div className="grid gap-4 lg:grid-cols-2">{items.map(s => <article key={s.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="font-mono text-xs font-bold text-[#135f5a]">{s.id}</span><h2 className="mt-1 text-sm font-bold">{s.name}</h2><p className="mt-1 text-xs text-[#657287]">Trade: {s.trade} · {s.orders} active orders</p></div><div className="text-right"><div className="text-lg font-bold">★ {s.rating}</div>{s.verified ? <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">✓ Verified</span> : <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">Pending verification</span>}</div></div><div className="mt-4 flex gap-2"><Button type="button" variant="quiet" size="sm" disabled={!canVerify} onClick={() => toggleVerify(s.id)}>{s.verified ? 'Revoke' : 'Verify'}</Button><Button type="button" variant="ink" size="sm">View products</Button></div></article>)}</div>}

    {tab === 'products' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Product','Supplier','Specification','Unit','Rate'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['4mm APP torch-on membrane','Protec Membranes','SANS 953 · Type A','m²','R 312'],['High-tensile rebar Y12','Stalcor Steel','SANS 920-1','t','R 24,800'],['Semi-face clay brick','Cape Brick Distributors','SANS 227 · Class II mortar','each','R 8.40']].map(([p,s,spec,u,r],i) => <tr key={i} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-semibold">{p}</td><td className="px-4 py-3">{s}</td><td className="px-4 py-3 font-mono text-[10px] text-[#167E79]">{spec}</td><td className="px-4 py-3">{u}</td><td className="px-4 py-3 font-bold">{r}</td></tr>)}</tbody></table></div>}

    {tab === 'verification' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Compliance Verification</h2>{[['Protec Membranes','Tax clearance · CIDB 4SQ · COIDA','Complete'],['Stalcor Steel','Tax clearance · CIDB 6SE · COIDA','Complete'],['Cape Brick Distributors','Tax clearance pending · CIDB not confirmed','Incomplete']].map(([name,checks,status]) => <div key={name} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{name}</div><div className="text-[10px] text-[#657287]">{checks}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{status}</span></div>)}<p className="text-xs text-[#657287]">Verification checks: tax clearance, CIDB grading, COIDA letter of good standing, BBBEE certificate.</p></div>}

    {tab === 'orders' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Order Tracking</h2>{[['PO-014','Stalcor Steel — balustrades','Delivered · 14 Aug','Complete'],['PO-013','Cape Brick — face brick','In transit · ETA 24 Aug','In progress']].map(([po,sup,st,status]) => <div key={po} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{po}</span><div className="flex-1"><div className="text-xs font-bold">{sup}</div><div className="text-[10px] text-[#657287]">{st}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{status}</span></div>)}</div>}
  </section>;
}
