'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'sessions', label:'Sessions', group:'Remote', icon:'remote_desktop' },
  { key:'hosts', label:'Host Machines', group:'Remote', icon:'detail' },
  { key:'security', label:'Security & Access', group:'Remote', icon:'risk' },
  { key:'audit', label:'Session Audit', group:'Remote', icon:'workflow' },
];

const seed = [
  { id:'RDP-001', host:'CAD Workstation 01', user:'Justin Kruger', started:'09:41', status:'Active' },
  { id:'RDP-002', host:'SpecForge Server', user:'N. Mokoena', started:'10:05', status:'Active' },
  { id:'RDP-003', host:'BoM Takeoff Station', user:'D. Pieterse', started:'Yesterday', status:'Ended' },
];

export function RemoteDesktopModule({ activeProject, currentRole, activeTabKey = 'sessions', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [sessions, setSessions] = useState(seed);
  const canControl = ['admin','platform_admin','firm_admin','architect'].includes(currentRole);
  const end = (id: string) => setSessions(list => list.map(s => s.id === id ? { ...s, status: 'Ended' } : s));

  return <section className="space-y-4" aria-label="Remote Desktop">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="remote_desktop" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Browser-based sessions</p><h1 className="text-xl font-bold">Remote Desktop</h1><p className="text-xs text-[#657287]">{activeProject.code} · resource-heavy tool sessions</p></div></div>
      <button disabled={!canControl} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">+ Start session</button>
    </header>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950"><strong>Third-party provider integration.</strong> Remote sessions are brokered through a licensed remote-session provider; Architex records sessions, access and audit only.</div>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'sessions' && <div className="space-y-3">{sessions.map(s => <article key={s.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className={`h-10 w-1 rounded-full ${s.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#167E79]">{s.id}</span><h2 className="text-sm font-bold">{s.host}</h2></div><p className="mt-1 text-xs text-[#657287]">{s.user} · started {s.started}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span><div className="flex gap-2">{s.status === 'Active' && <button disabled={!canControl} onClick={() => end(s.id)} className="rounded-xl border border-red-300 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40">End session</button>}<button disabled={!canControl} className="rounded-xl bg-[#19B7B0] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Connect</button></div></article>)}</div>}

    {tab === 'hosts' && <div className="grid gap-4 lg:grid-cols-3">{[['CAD Workstation 01','Windows 11 · RTX 4080','Available'],['SpecForge Server','Linux · 8 vCPU / 32GB','In use'],['BoM Takeoff Station','Windows 11 · 64GB','Available']].map(([host,spec,st]) => <div key={host} className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">{host}</h3><p className="mt-1 text-xs text-[#657287]">{spec}</p><span className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}</div>}

    {tab === 'security' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Access Security</h2><div className="space-y-2">{['Multi-factor authentication required for all sessions','Sessions expire after 30 minutes of inactivity','Clipboard and file transfer restricted to approved types','All sessions recorded to audit log with user, host, duration'].map(rule => <div key={rule} className="flex items-center gap-3 rounded-xl border p-3"><span className="text-green-600">✓</span><p className="text-xs font-semibold">{rule}</p></div>)}</div></div>}

    {tab === 'audit' && <div className="rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Session','Host','User','Duration','When'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['RDP-001','CAD Workstation 01','Justin Kruger','2h 04m','Today'],['RDP-002','SpecForge Server','N. Mokoena','1h 12m','Today'],['RDP-003','BoM Takeoff Station','D. Pieterse','3h 40m','Yesterday']].map(([s,h,u,d,w]) => <tr key={s} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{s}</td><td className="px-4 py-3">{h}</td><td className="px-4 py-3">{u}</td><td className="px-4 py-3">{d}</td><td className="px-4 py-3 text-[#657287]">{w}</td></tr>)}</tbody></table></div>}
  </section>;
}