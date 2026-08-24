'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'notices', label:'Dispute Notices', group:'Disputes', icon:'dispute_resolution' },
  { key:'adjudication', label:'Adjudication', group:'Disputes', icon:'workflow' },
  { key:'mediation', label:'Mediation', group:'Disputes', icon:'team_workspace' },
  { key:'timeline', label:'Claims Timeline', group:'Disputes', icon:'programme' },
];

const seed = [
  { id:'DSP-001', title:'Variation VO-004 — waterproofing rate dispute', parties:'Architect vs Contractor', status:'Notice issued', date:'19 Aug' },
  { id:'DSP-002', title:'EoT claim CLM-02 — extension days', parties:'Contractor vs PM', status:'Adjudication', date:'15 Aug' },
];

export function DisputeResolutionModule({ activeProject, currentRole, activeTabKey = 'notices', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canAct = ['cpm','admin','platform_admin','architect','contractor'].includes(currentRole);
  const advance = (id: string) => setItems(list => list.map(d => d.id === id ? { ...d, status: d.status === 'Notice issued' ? 'Adjudication' : d.status === 'Adjudication' ? 'Mediation' : 'Resolved' } : d));

  return <section className="space-y-4" aria-label="Dispute Resolution">
    <PageHeader title="Dispute Resolution" origami={<OrigamiIcon name="dispute_resolution" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#a13a2e]">JBCC clause 20 · adjudication</p><p>{activeProject.code} · notices, adjudication, mediation</p></>} actions={<div className="flex max-w-full items-center gap-2"><Button type="button" variant="ink" size="sm" disabled={!canAct} className="shrink-0">+ Issue notice</Button><nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Dispute Resolution sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav></div>} />

    {tab === 'notices' && <div className="space-y-3">{items.map(d => <article key={d.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="h-10 w-1 rounded-full bg-[#d95747]" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#a13a2e]">{d.id}</span><h2 className="text-sm font-bold">{d.title}</h2></div><p className="mt-1 text-xs text-[#657287]">{d.parties} · {d.date}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${d.status === 'Resolved' ? 'bg-green-100 text-green-700' : d.status === 'Adjudication' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>{d.status}</span><Button type="button" variant="quiet" size="sm" disabled={!canAct || d.status === 'Resolved'} onClick={() => advance(d.id)}>{d.status === 'Resolved' ? 'Closed' : 'Advance stage'}</Button></article>)}</div>}

    {tab === 'adjudication' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Adjudication Register</h2>{[['DSP-002','Adjudicator appointed: D. Naidoo (ADR Centre)','Hearing 28 Aug'],['DSP-001','Awaiting adjudicator appointment','—']].map(([id,detail,next]) => <div key={id} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#d95747]">{id}</span><div className="flex-1"><div className="text-xs font-semibold">{detail}</div></div><span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">{next}</span></div>)}</div>}

    {tab === 'mediation' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Mediation</h2><p className="text-xs text-[#657287]">No disputes currently in mediation. Parties may refer to mediation at any time before adjudication.</p><div className="rounded-xl bg-[#DFF5F2] p-4 text-xs"><strong>Mediation policy:</strong> Both parties must consent. Mediation outcomes are recorded and binding by agreement under JBCC clause 20.3.</div></div>}

    {tab === 'timeline' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Claims & Dispute Timeline</h2>{[['15 Aug','EoT claim CLM-02 submitted'],['17 Aug','PM rejects extension days'],['19 Aug','Dispute notice DSP-001 issued (VO-004)'],['24 Aug','Adjudication response due'],['28 Aug','Adjudication hearing — DSP-002']].map(([date,event]) => <div key={date} className="flex gap-3 rounded-xl border p-4"><span className="shrink-0 rounded-lg bg-red-50 px-2 py-1 font-mono text-[10px] font-bold text-[#d95747]">{date}</span><p className="text-xs leading-5 text-[#526074]">{event}</p></div>)}</div>}
  </section>;
}
