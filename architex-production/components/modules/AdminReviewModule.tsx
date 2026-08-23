'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'review', label:'Admin Review', group:'Admin', icon:'admin_review' },
  { key:'actions', label:'Platform Actions', group:'Admin', icon:'action' },
  { key:'logs', label:'System Logs', group:'Admin', icon:'detail' },
  { key:'tenants', label:'Tenant Health', group:'Admin', icon:'workflow' },
];

const issues = [
  { id:'ISSUE-001', severity:'High', title:'AI candidate queue backlog — 12 pending > 24h', status:'Open' },
  { id:'ISSUE-002', severity:'Medium', title:'Meeting transcript processing slow — last 2 jobs > 5 min', status:'Investigating' },
  { id:'ISSUE-003', severity:'Low', title:'Datum canvas zoom drift on mobile Safari', status:'Acknowledged' },
];

export function AdminReviewModule({ activeProject, currentRole, activeTabKey = 'review', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(issues);
  const canAct = ['admin','platform_admin'].includes(currentRole);
  const resolve = (id: string) => setItems(list => list.map(i => i.id === id ? { ...i, status: 'Resolved' } : i));

  return <section className="space-y-4" aria-label="Admin Review">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#102033]/10 text-[#102033]"><OrigamiIcon name="admin_review" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#657287]">Platform operations</p><h1 className="text-xl font-bold">Admin Review</h1><p className="text-xs text-[#657287]">System health, audit inspection, user moderation</p></div></div>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'review' && <div className="space-y-3">{items.map(i => <article key={i.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className={`h-10 w-1 rounded-full ${i.severity === 'High' ? 'bg-[#d95747]' : i.severity === 'Medium' ? 'bg-[#FFB020]' : 'bg-[#19B7B0]'}`} /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#657287]">{i.id}</span><h2 className="text-sm font-bold">{i.title}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${i.severity === 'High' ? 'bg-red-100 text-red-700' : i.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{i.severity}</span></div></div><span className="rounded-full bg-[#f2f7f6] px-2 py-1 text-[10px] font-bold">{i.status}</span><button disabled={!canAct || i.status === 'Resolved'} onClick={() => resolve(i.id)} className="rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-40">{i.status === 'Resolved' ? 'Resolved' : 'Acknowledge'}</button></article>)}</div>}

    {tab === 'actions' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Platform Actions</h2><div className="space-y-2">{['Clear AI candidate queue cache','Re-run meeting transcript for MTG-001','Trigger user verification audit','Export platform audit log (CSV)'].map(action => <div key={action} className="flex items-center justify-between rounded-xl border p-3"><p className="text-xs font-semibold">{action}</p><button disabled={!canAct} className="rounded-lg border px-2.5 py-1 text-[10px] font-bold disabled:opacity-40">Run</button></div>)}</div></div>}

    {tab === 'logs' && <div className="rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Level','Event','Source','Timestamp'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['WARN','AI candidate processing timeout','jobs/worker.php','20 Aug 14:32'],['INFO','Meeting MTG-001 published','meetings/api','20 Aug 14:30'],['INFO','User login — Justin Kruger','auth/jwt','20 Aug 08:12'],['ERROR','Drawing scan failed — malformed PDF','drawing-intel','19 Aug 22:15']].map(([level,event,source,ts]) => <tr key={event} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${level === 'ERROR' ? 'bg-red-100 text-red-700' : level === 'WARN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>{level}</span></td><td className="px-4 py-3 font-semibold">{event}</td><td className="px-4 py-3 font-mono text-[10px] text-[#657287]">{source}</td><td className="px-4 py-3 text-[#657287]">{ts}</td></tr>)}</tbody></table></div>}

    {tab === 'tenants' && <div className="grid gap-4 lg:grid-cols-2">{[['org-demo','Architex Demo Practice','Active','24 users · 12 projects · 4.2 GB storage'],['org-evergreen','Evergreen Property Holdings','Active','8 users · 4 projects · 1.8 GB storage'],['org-waterfall','Waterfall Business Park','Active','6 users · 3 projects · 0.9 GB storage']].map(([id,name,status,detail]) => <div key={id} className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">{name}</h3><p className="font-mono text-[10px] text-[#657287]">{id}</p><span className={`mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{status}</span><p className="mt-2 text-xs text-[#526074]">{detail}</p></div>)}</div>}
  </section>;
}