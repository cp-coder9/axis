'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'registry', label:'Icon Registry', group:'Registry', icon:'iconography_registry' },
  { key:'tones', label:'Tone System', group:'Registry', icon:'detail' },
  { key:'usage', label:'Usage Rules', group:'Registry', icon:'workflow' },
];

const icons = [
  ['dashboard','Command Centre','core teal'],
  ['projects','Project Space','core teal'],
  ['tools','Workspace Tools','lavender'],
  ['inbox','Inbox & Collaboration','coral'],
  ['documents_drawings','Documents & Drawings','core teal'],
  ['finance','Finance & Payments','amber'],
  ['knowledge','Knowledge & CPD','cobalt'],
  ['feedback','Feedback Intelligence','lavender'],
  ['settings','Settings','core teal'],
  ['meetings','Architex Meetings','coral'],
  ['wingman','Wingman AI','lavender'],
  ['planning','Town Planning','cobalt'],
  ['municipal','Municipal Approval','coral'],
  ['xa','SANS 10400-XA','cobalt'],
  ['forms','Integrated Forms','core teal'],
  ['specforge','SpecForge','cobalt'],
  ['bom','BoM / BoQ','amber'],
  ['itp','Inspection Test Plans','coral'],
  ['safety','Health & Safety','coral'],
  ['approvals_queue','Approvals Queue','coral'],
];

export function IconographyRegistryModule({ activeProject, currentRole, activeTabKey = 'registry', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [query, setQuery] = useState('');
  const filtered = icons.filter(([id, name]) => id.includes(query.toLowerCase()) || name.toLowerCase().includes(query.toLowerCase()));

  return <section className="space-y-4" aria-label="Iconography Registry">
    <PageHeader
      title="Iconography Registry"
      origami={<OrigamiIcon name="tools" size={26} />}
      metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Design-system tooling</p><p>Single source of truth for the Origami icon set</p></>}
      actions={<nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Iconography Registry sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav>}
    />

    {tab === 'registry' && <><label htmlFor="iconography-search" className="sr-only">Search icons by ID or name</label><input id="iconography-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search icons by id or name..." className="w-full rounded-2xl border border-[#102033]/10 bg-white p-3 text-xs shadow-sm focus:outline-none focus:border-[#19B7B0]" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{filtered.map(([id, name, tone]) => <div key={id} className="rounded-2xl border bg-white p-4 shadow-sm text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#DFF5F2] text-[#135f5a]"><OrigamiIcon name={id} size={20} /></div><div className="mt-2 truncate text-xs font-bold">{name}</div><div className="font-mono text-[9px] text-[#526074]">{id} · {tone}</div></div>)}</div></>}

    {tab === 'tones' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Tone System</h2><div className="grid gap-3 md:grid-cols-2">{[['core / teal','#19B7B0 · #167E79','Shell, projects, documents, forms'],['lavender','#8B5CF6','Tools, wingman, feedback'],['coral','#FF6B6B','Inbox, meetings, safety, ITP'],['amber','#FFB020','Finance, fees, payments'],['cobalt','#2563EB','Planning, XA, specforge'],['green / red','#28a86b · #d95747','Status semantics']].map(([tone,hex,usage]) => <div key={tone} className="rounded-xl border p-4"><div className="flex items-center gap-2"><span className={`h-4 w-4 rounded-full ${tone.includes('teal') ? 'bg-[#19B7B0]' : tone.includes('lavender') ? 'bg-[#8B5CF6]' : tone.includes('coral') ? 'bg-[#FF6B6B]' : tone.includes('amber') ? 'bg-[#FFB020]' : tone.includes('cobalt') ? 'bg-[#2563EB]' : 'bg-[#28a86b]'}`} /><span className="text-sm font-bold">{tone}</span></div><div className="mt-1 font-mono text-[10px] text-[#657287]">{hex}</div><div className="mt-1 text-[10px] text-[#526074]">{usage}</div></div>)}</div></div>}

    {tab === 'usage' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Usage Rules</h2><div className="space-y-2">{['Every module icon is keyed by its registry id — no ad-hoc inline SVG','Tone is a CSS variable on each card; components use color-mix for soft variants','New icons must be added to the registry before use in any module','Icons are 20px in navigation, 26px in headers, 14px in tabs'].map(rule => <div key={rule} className="flex items-center gap-3 rounded-xl border p-3"><span className="text-[#19B7B0]">◆</span><p className="text-xs font-semibold">{rule}</p></div>)}</div></div>}
  </section>;
}
