'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'survey', label:'Survey Register', group:'Survey', icon:'survey_geomatics' },
  { key:'boundaries', label:'Boundaries & Pegs', group:'Survey', icon:'detail' },
  { key:'contours', label:'Contour Data', group:'Survey', icon:'trends' },
  { key:'deliverables', label:'Deliverables', group:'Survey', icon:'document' },
];

export function SurveyGeomaticsModule({ activeProject, currentRole, activeTabKey = 'survey', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);

  return <section className="space-y-4" aria-label="Survey & Geomatics">
    <PageHeader title="Survey & Geomatics" origami={<OrigamiIcon name="survey_geomatics" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Cadastral & site data</p><p>{activeProject.code} · boundary pegs, contours, survey records</p></>} actions={<nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Survey and Geomatics sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav>} />

    {tab === 'survey' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Survey','Type','Date','Surveyor','Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['SUR-004','As-built topographic','15 Aug 2026','Land Survey Group','Approved'],['SUR-003','Boundary re-peg','28 Jul 2026','Land Survey Group','Approved'],['SUR-002','Contour survey (0.5m)','20 Jul 2026','Land Survey Group','Approved'],['SUR-001','Cadastral verification','05 Jul 2026','Land Survey Group','Approved']].map(([id,type,date,surv,st]) => <tr key={id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{id}</td><td className="px-4 py-3 font-semibold">{type}</td><td className="px-4 py-3">{date}</td><td className="px-4 py-3">{surv}</td><td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">{st}</span></td></tr>)}</tbody></table></div>}

    {tab === 'boundaries' && <div className="grid gap-4 lg:grid-cols-2">{[['NE peg','T1-1820 · 25deg 34min 12sec E','Recovered & verified'],['NW peg','T2-1820 · 25deg 34min 08sec E','Recovered & verified'],['SE peg','T3-1820 · 25deg 33min 58sec E','Replaced — new peg set'],['SW peg','T4-1820 · 25deg 33min 55sec E','Recovered & verified']].map(([peg,coord,st]) => <div key={peg} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#167E79]">{peg}</span><span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">{st}</span></div><div className="mt-2 text-xs font-mono text-[#657287]">{coord}</div></div>)}</div>}

    {tab === 'contours' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Contour Data</h2><div className="flex h-48 items-end gap-1 rounded-xl bg-[#f5faf9] p-4">{[40,48,55,62,70,66,74,80,88,84,92,98,90,86,78,70,64,58,50,44].map((h, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#19B7B0] to-[#58C8BC]" style={{height:`${h}%`}} title={`${1380 + h}m contour`} />)}</div><p className="text-xs text-[#657287]">Site falls ~4.8m from NE to SW across 82m · 0.5m contour interval · slope ~3.4%</p></div>}

    {tab === 'deliverables' && <div className="space-y-3">{[['Topographic plan — DWG + PDF','SUR-004 · 15 Aug','Ready'],['Boundary certificate','SUR-003 · 28 Jul','Ready'],['Contour surface — TIN + DTM','SUR-002 · 20 Jul','Ready']].map(([name,meta,st]) => <div key={name} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex-1"><div className="text-xs font-bold">{name}</div><div className="text-[10px] text-[#657287]">{meta}</div></div><span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">{st}</span><button className="rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79]">Download</button></div>)}</div>}
  </section>;
}
