'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'enrolment', label:'NHBRC Enrolment', group:'Enrolment', icon:'nhbrc_enrolment' },
  { key:'requirements', label:'Requirements', group:'Enrolment', icon:'detail' },
  { key:'inspections', label:'Inspections', group:'Enrolment', icon:'itp' },
  { key:'warranty', label:'Warranty Status', group:'Enrolment', icon:'document' },
];

export function NhbrcEnrolmentModule({ activeProject, currentRole, activeTabKey = 'enrolment', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [enrolled, setEnrolled] = useState(false);
  const canEnrol = ['contractor','cpm','admin','platform_admin','developer'].includes(currentRole);

  return <section className="space-y-4" aria-label="NHBRC Enrolment">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="nhbrc_enrolment" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Home builder warranty</p><h1 className="text-xl font-bold">NHBRC Enrolment</h1><p className="text-xs text-[#657287]">{activeProject.code} · statutory enrolment for residential units</p></div></div>
      {enrolled ? <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">✓ Enrolled</span> : <button disabled={!canEnrol} onClick={() => setEnrolled(true)} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Enrol project</button>}
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'enrolment' && <><div className="grid gap-4 md:grid-cols-4">{[['Units', '24'],['Enrolment fee','R 9,720'],['Builder registration','No 10042'],['Status', enrolled ? 'Enrolled' : 'Not enrolled']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <div className={`rounded-2xl border p-5 shadow-sm ${enrolled ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}><h3 className="text-sm font-bold">{enrolled ? 'Enrolment complete' : 'Not yet enrolled'}</h3><p className="mt-2 text-xs leading-5 text-[#526074]">{enrolled ? 'NHBRC enrolment certificate issued. 24 units covered by the home warranty scheme.' : 'Residential units ≥ 1 storey require NHBRC enrolment before construction commences. Builder registration and fee confirmation pending.'}</p></div></>}

    {tab === 'requirements' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Enrolment Requirements</h2><div className="space-y-2">{['Builder registration certificate (NHBRC)','Layout plan showing all units','Approved building plans','Proof of land ownership','Enrolment fee payment'].map((req, i) => <div key={req} className="flex items-center gap-3 rounded-xl border p-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#DFF5F2] text-[10px] font-bold text-[#167E79]">{i + 1}</span><div className="flex-1 text-xs font-semibold">{req}</div><span className="text-[10px] font-bold text-green-700">✓</span></div>)}</div></div>}

    {tab === 'inspections' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">NHBRC Inspections</h2>{[['Foundation','Passed · 22 Jul','Complete'],['Superstructure','Passed · 12 Aug','Complete'],['Final inspection','Scheduled · 2 Sep','Upcoming']].map(([stage,detail,st]) => <div key={stage} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{stage}</div><div className="text-[10px] text-[#657287]">{detail}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Complete' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{st}</span></div>)}<p className="text-xs text-[#657287]">Inspections are mandatory hold points for the home warranty certificate.</p></div>}

    {tab === 'warranty' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Warranty Status</h2><div className={`rounded-xl border p-4 text-xs ${enrolled ? 'border-green-200 bg-green-50 text-green-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}><strong>{enrolled ? 'Warranty active — 5-year structural guarantee' : 'Warranty commences on enrolment'}</strong><p className="mt-1">Major structural defects covered for 5 years · roof leaks 2 years · workmanship 1 year.</p></div></div>}
  </section>;
}