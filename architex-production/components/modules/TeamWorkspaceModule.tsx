'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'raci', label:'RACI Matrix', group:'Team', icon:'team_workspace' },
  { key:'members', label:'Active Members', group:'Team', icon:'professional_directory' },
  { key:'availability', label:'Availability', group:'Team', icon:'calendar' },
];

const raci = [
  ['Activity','Architect','Engineer','QS','PM','Contractor'],
  ['Design coordination','A','C','C','I','I'],
  ['Municipal submission','R','C','I','C','I'],
  ['BoQ & valuation','C','I','A','C','C'],
  ['Construction programme','C','C','I','A','R'],
  ['Site quality & safety','C','R','I','C','A'],
];

const members = [
  { name:'Justin Kruger', role:'Lead Architect', load:'68%', status:'Active' },
  { name:'N. Mokoena', role:'Fire Engineer', load:'42%', status:'Active' },
  { name:'D. Pieterse', role:'Quantity Surveyor', load:'55%', status:'Active' },
  { name:'T. Mahlangu', role:'Town Planner', load:'30%', status:'Invited' },
  { name:'L. Ndlovu', role:'H&S Officer', load:'47%', status:'Active' },
];

export function TeamWorkspaceModule({ activeProject, currentRole, activeTabKey = 'raci', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const canEdit = ['architect','cpm','admin','platform_admin','firm_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="Team Workspace">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="team_workspace" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Project delivery team</p><h1 className="text-xl font-bold">Team Workspace</h1><p className="text-xs text-[#657287]">{activeProject.name} · RACI, members and resource availability</p></div></div>
      <button disabled={!canEdit} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">+ Invite member</button>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'raci' && <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><tbody>{raci.map((row, i) => <tr key={row[0]} className={i === 0 ? 'bg-[#f5faf9] text-[10px] uppercase text-[#657287]' : 'border-t hover:bg-[#f8fbfb]'}>{row.map((cell, j) => <td key={j} className={`px-4 py-3 ${i === 0 ? 'font-bold' : j === 0 ? 'font-semibold' : 'text-center'}`}>{cell}</td>)}</tr>)}</tbody></table></div><div className="border-t p-3 text-[10px] text-[#657287]">R = Responsible · A = Accountable · C = Consulted · I = Informed</div></div>}

    {tab === 'members' && <div className="grid gap-4 lg:grid-cols-2">{members.map(m => <article key={m.name} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#DFF5F2] text-xs font-bold text-[#167E79]">{m.name.split(' ').map(n => n[0]).join('')}</div><div className="flex-1"><h2 className="text-sm font-bold">{m.name}</h2><p className="text-xs text-[#657287]">{m.role}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{m.status}</span></div><div className="mt-3"><div className="flex justify-between text-[10px] text-[#657287]"><span>Resource load</span><span>{m.load}</span></div><div className="mt-1 h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-[#19B7B0]" style={{width:m.load}} /></div></div></article>)}</div>}

    {tab === 'availability' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Availability (next 14 days)</h2>{[['Justin Kruger','6 days available · 2 blocked by design reviews'],['N. Mokoena','8 days available · 1 site visit'],['D. Pieterse','9 days available · BoQ takeoff booked'],['L. Ndlovu','7 days available · toolbox talk scheduled']].map(([name,detail]) => <div key={name} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{name}</div><div className="text-[10px] text-[#657287]">{detail}</div></div><button disabled={!canEdit} className="rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79] disabled:opacity-40">Book</button></div>)}</div>}
  </section>;
}