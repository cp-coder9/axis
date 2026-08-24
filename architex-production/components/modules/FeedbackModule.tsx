'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = (ALL_TOOLS['feedback'] as ToolDefinition).tabs;

interface Feedback { id: string; title: string; category: 'Bug'|'Feature request'|'Usability'|'Praise'; severity: number; sentiment: 'positive'|'neutral'|'negative'|'frustrated'; date: string }
const seed: Feedback[] = [
  { id:'FB-101', title:'Drawing markup tool lags on large CAD files', category:'Bug', severity:8, sentiment:'frustrated', date:'20 Aug' },
  { id:'FB-102', title:'Add export-to-IFC for BIM workflows', category:'Feature request', severity:7, sentiment:'positive', date:'20 Aug' },
  { id:'FB-103', title:'Wingman RFI drafts save automatically', category:'Feature request', severity:6, sentiment:'neutral', date:'19 Aug' },
  { id:'FB-104', title:'Approvals queue should show escalation timers', category:'Usability', severity:5, sentiment:'neutral', date:'19 Aug' },
  { id:'FB-105', title:'Meeting minutes PDF is clean and useful', category:'Praise', severity:2, sentiment:'positive', date:'18 Aug' },
];

export function FeedbackModule({ activeProject, currentRole, activeTabKey = 'overview', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const avgSeverity = (items.reduce((s, f) => s + f.severity, 0) / items.length).toFixed(1);
  const flagged = items.filter(f => f.severity >= 7).length;

  return <section className="space-y-4" aria-label="Feedback Intelligence">
    <PageHeader
      title="Feedback Intelligence"
      origami={<OrigamiIcon name="feedback" size={26} />}
      metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-purple-700">Product loop · closed pipeline</p><p>Clustered, severity-scored feedback feeding the roadmap</p></>}
      actions={<nav className="flex max-w-full overflow-x-auto" aria-label="Feedback intelligence sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav>}
    />

    {tab === 'overview' && <><div className="grid gap-4 md:grid-cols-4">{[['Total submissions',String(items.length)],['Avg severity',avgSeverity],['Flagged (≥7)',String(flagged)],['This week','12']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <div className="rounded-2xl border bg-white shadow-sm divide-y">{items.map(f => <div key={f.id} className="flex items-center gap-3 p-4"><span className="font-mono text-xs font-bold text-purple-700">{f.id}</span><div className="flex-1 min-w-0"><div className="truncate text-xs font-bold">{f.title}</div><div className="text-[10px] text-[#657287]">{f.date} · {f.sentiment}</div></div><span className="rounded-full bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700">{f.category}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${f.severity >= 7 ? 'bg-red-100 text-red-700' : f.severity >= 4 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>sev {f.severity}</span></div>)}</div></>}

    {tab === 'clusters' && <div className="grid gap-4 lg:grid-cols-2">{[['Drawing performance','3 items · avg sev 7.3','Markup lag on large CAD files, slow zoom on A-series, export timeouts.'],['AI drafting','2 items · avg sev 6.5','Wingman autosave, RFI draft quality.'],['Approvals UX','2 items · avg sev 5.0','Escalation timers, step visibility.'],['Export & standards','2 items · avg sev 4.5','IFC export, PDF/A compliance.']].map(([name,meta,desc]) => <div key={name} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">{name}</h3><span className="rounded-full bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700">{meta}</span></div><p className="mt-2 text-xs leading-5 text-[#526074]">{desc}</p><button className="mt-3 rounded-lg border px-2.5 py-1 text-[10px] font-bold text-purple-700">Generate AI feature brief</button></div>)}</div>}

    {tab === 'trends' && <div className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-base font-bold">30-Day Trend</h2><div className="mt-4 flex h-40 items-end gap-1.5">{['6','9','7','12','8','15','11','18','13','10','16','12','14','19','11','13','15','9','17','12'].map((v, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-purple-600 to-purple-400" style={{ height: `${(parseInt(v) / 20) * 100}%` }} title={v} />)}</div><div className="mt-2 flex justify-between text-[10px] text-[#657287]"><span>22 Jul</span><span>5 Aug</span><span>20 Aug</span></div></div>}

    {tab === 'brief' && <div className="space-y-3">{[['Feature brief: IFC export','CLUSTER: Export & standards · Proposal: native IFC 2x3 export from Documents & Drawings with property-set mapping. Effort: M · Impact: H · Priority: P1','Draft'],['Feature brief: Drawing performance','CLUSTER: Drawing performance · Proposal: canvas virtualisation for CAD overlay, WebWorker processing. Effort: L · Impact: H · Priority: P2','Draft']].map(([title,body,status]) => <div key={title} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">{title}</h3><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">{status}</span></div><p className="mt-2 text-xs leading-5 text-[#526074]">{body}</p><div className="mt-3 flex gap-2"><button className="rounded-lg border border-purple-300 px-3 py-1.5 text-[10px] font-bold text-purple-700">Reject</button><button className="rounded-lg bg-purple-700 px-3 py-1.5 text-[10px] font-bold text-white">Accept → roadmap</button></div></div>)}</div>}

    {tab === 'roadmap' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4"><h2 className="text-base font-bold">Roadmap Status Flow</h2><div className="flex items-center gap-1">{['Received','Reviewing','Planned','Shipped'].map((s, i) => <div key={s} className="flex flex-1 items-center gap-1">{i > 0 && <div className="h-0.5 flex-1 bg-purple-200" />}<span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${i < 2 ? 'bg-purple-700 text-white' : i === 2 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-[#657287]'}`}>{s}</span></div>)}</div><div className="space-y-2">{['IFC export — Planned (Sprint 14)','Drawing performance — Reviewing','Markup autosave — Shipped v0.2'].map(r => <div key={r} className="rounded-xl border p-3 text-xs font-semibold">{r}</div>)}</div></div>}
  </section>;
}
