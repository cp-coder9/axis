'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'dashboard', label:'Compliance Dashboard', group:'Compliance', icon:'dashboard' },
  { key:'standards', label:'Standard Checklist', group:'Compliance', icon:'detail' },
  { key:'gaps', label:'Gap Register', group:'Compliance', icon:'risk' },
  { key:'signoffs', label:'Sign-off Register', group:'Compliance', icon:'approvals_queue' },
];

const checks = [
  { id:'SANS-10400-A', standard:'SANS 10400 Part A (General)', status:'Compliant', owner:'Architect' },
  { id:'SANS-10400-T', standard:'SANS 10400 Part T (Fire Protection)', status:'In review', owner:'Fire Engineer' },
  { id:'SANS-10400-XA', standard:'SANS 10400 Part XA (Energy)', status:'Gap — 2 items', owner:'Energy Professional' },
  { id:'NBR-2011', standard:'National Building Regulations', status:'Compliant', owner:'Architect' },
  { id:'OHS-ACT', standard:'OHS Act 85 of 1993 + Construction Regs', status:'Compliant', owner:'H&S Officer' },
  { id:'MUNI-BYLAW', standard:'Municipal Building By-laws (Tshwane)', status:'In review', owner:'Town Planner' },
];

export function ComplianceHubModule({ activeProject, currentRole, activeTabKey = 'dashboard', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const compliant = checks.filter(c => c.status === 'Compliant').length;
  const pct = Math.round((compliant / checks.length) * 100);

  return <section className="space-y-4" aria-label="Compliance Hub">
    <PageHeader title="Compliance Hub" origami={<OrigamiIcon name="compliance_hub" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Cross-standard statutory aggregation</p><p>{activeProject.code} · SANS 10400, NBR, OHS and municipal by-laws</p></>} actions={<nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Compliance Hub sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav>} />

    {tab === 'dashboard' && <><div className="grid gap-4 md:grid-cols-4">{[['Standards tracked',String(checks.length)],['Compliant',String(compliant)],['In review','2'],['Open gaps','1']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Overall compliance</h3><span className="text-2xl font-bold text-[#167E79]">{pct}%</span></div><div className="mt-3 h-3 rounded-full bg-gray-200"><div className="h-3 rounded-full bg-[#19B7B0]" style={{width:`${pct}%`}} /></div></div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950"><strong>Blocking gap:</strong> SANS 10400-XA fenestration values unconfirmed — municipal submission cannot proceed without the energy compliance declaration.</div></>}

    {tab === 'standards' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Standard','Requirement','Owner','Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{checks.map(c => <tr key={c.id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{c.id}</td><td className="px-4 py-3 font-semibold">{c.standard}</td><td className="px-4 py-3">{c.owner}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${c.status === 'Compliant' ? 'bg-green-100 text-green-700' : c.status.startsWith('Gap') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{c.status}</span></td></tr>)}</tbody></table></div>}

    {tab === 'gaps' && <div className="space-y-3">{[['GAP-001','SANS 10400-XA — north façade fenestration ratio exceeds prescriptive 30%','Energy Professional','High'],['GAP-002','Municipal by-law — refuse area screening required','Town Planner','Medium']].map(([id,title,owner,sev]) => <div key={id} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"><span className="font-mono text-xs font-bold text-[#d95747]">{id}</span><div className="flex-1"><div className="text-xs font-bold">{title}</div><div className="text-[10px] text-[#657287]">Owner: {owner}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${sev === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{sev}</span></div>)}</div>}

    {tab === 'signoffs' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Professional Sign-off Register</h2>{[['SANS 10400-XA Declaration','Pending — Energy Professional','Awaiting'],['Fire Rational Design Certificate','Signed — N. Mokoena (PrEng)','Complete'],['Structural Certificate (S-204)','Signed — S. van der Merwe (PrEng)','Complete']].map(([doc,detail,st]) => <div key={doc} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{doc}</div><div className="text-[10px] text-[#657287]">{detail}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}<p className="text-xs text-[#657287]">Advisory outputs remain advisory until the responsible registered professional signs off.</p></div>}
  </section>;
}
