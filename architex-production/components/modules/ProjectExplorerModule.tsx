'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'search', label:'Universal Search', group:'Explore', icon:'project_explorer' },
  { key:'graph', label:'Relational Graph', group:'Explore', icon:'workflow' },
  { key:'entities', label:'Entity Registry', group:'Explore', icon:'detail' },
  { key:'timeline', label:'Project Timeline', group:'Explore', icon:'programme' },
];

const entities = [
  ['Drawing','A-204','Architecture','Rev P03'],
  ['Drawing','S-201','Structural','Rev B'],
  ['Contract','CON-001','JBCC Principal','Active'],
  ['RFI','RFI-014','Fire','Open'],
  ['Meeting','MTG-2026-08-20','Design Coordination','Published'],
  ['Approval','APR-001','Architectural Set','Pending'],
];

export function ProjectExplorerModule({ activeProject, currentRole, activeTabKey = 'search', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = entities.filter(([t, id]) => t.toLowerCase().includes(query.toLowerCase()) || id.toLowerCase().includes(query.toLowerCase()));

  return <section className="space-y-4" aria-label="Project Explorer">
    <PageHeader
      title="Project Explorer"
      origami={<OrigamiIcon name="project_explorer" size={26} />}
      metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Universal search & relations</p><p>{activeProject.code} · search across drawings, contracts, RFIs, meetings, approvals</p></>}
      actions={<nav className="flex max-w-full overflow-x-auto" aria-label="Project Explorer sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav>}
    />

    {tab === 'search' && <><div className="relative"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search any project record — drawings, contracts, RFIs, meetings..." className="w-full rounded-2xl border border-[#102033]/10 bg-white p-3.5 pl-10 text-xs shadow-sm focus:outline-none focus:border-[#19B7B0]" /><span className="absolute left-3 top-3 text-[#96a0ad]">🔍</span></div>
      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Type','ID','Details',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{filtered.map(([t,id,detail,meta]) => <tr key={id} className={`hover:bg-[#f8fbfb] cursor-pointer ${selected === id ? 'bg-[#DFF5F2]/40' : ''}`} onClick={() => setSelected(id)}><td className="px-4 py-3"><span className="rounded-full bg-[#DFF5F2] px-2 py-1 text-[10px] font-bold text-[#135f5a]">{t}</span></td><td className="px-4 py-3 font-mono font-bold">{id}</td><td className="px-4 py-3">{detail}</td><td className="px-4 py-3 text-[#657287]">{meta}</td></tr>)}</tbody></table></div>
      {selected && <div className="rounded-2xl border border-[#19B7B0]/30 bg-[#DFF5F2]/60 p-4 text-xs"><strong>{selected}</strong> — linked records: 2 drawings, 1 RFI, 1 meeting. Full relational view in the Graph tab.</div>}</>}

    {tab === 'graph' && <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold">Relational Graph — A-204</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[['Drawing','A-204 · Rev P03','center'],['RFI','RFI-014 · open','link'],['Meeting','Design Coord · published','link'],['Approval','APR-001 · pending','link']].map(([t,id,pos]) => <div key={id} className={`rounded-2xl border p-4 text-center ${pos === 'center' ? 'border-[#19B7B0] bg-[#DFF5F2]' : 'border-gray-200 bg-white'}`}><div className="text-[10px] font-bold uppercase text-[#657287]">{t}</div><div className="mt-1 text-xs font-bold">{id}</div></div>)}
      </div>
      <div className="mt-4 rounded-xl bg-[#f5faf9] p-3 text-xs text-[#526074]">A-204 is referenced by 1 open RFI, 1 published meeting, and 1 pending approval. 2 markups are attached. This graph is derived from the audit-linked records, not a separate data store.</div>
    </div>}

    {tab === 'entities' && <div className="grid gap-4 lg:grid-cols-2">{[['Drawing Register','14 items · 12 current-set'],['Documents','128 records · revisioned'],['Contracts','3 active · 1 draft'],['RFIs & Issues','8 open · 6 closed'],['Meetings','12 scheduled · 9 published'],['Approvals','2 pending · 5 decided']].map(([name,meta]) => <div key={name} className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">{name}</h3><p className="mt-1 text-xs text-[#657287]">{meta}</p><button className="mt-3 rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79]">Browse →</button></div>)}</div>}

    {tab === 'timeline' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Project Timeline</h2>{[['20 Aug','RFI-014 raised · Design coordination meeting published'],['19 Aug','Fire strategy report approved · ITP-002 hold point set'],['18 Aug','Structural drawings issued Rev B · NCR-005 resolved'],['15 Aug','Topographic survey approved']].map(([date,event]) => <div key={date} className="flex gap-3 rounded-xl border p-4"><span className="shrink-0 rounded-lg bg-[#DFF5F2] px-2 py-1 font-mono text-[10px] font-bold text-[#167E79]">{date}</span><p className="text-xs leading-5 text-[#526074]">{event}</p></div>)}</div>}
  </section>;
}
