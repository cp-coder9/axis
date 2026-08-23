'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'directory', label:'Professional Directory', group:'Directory', icon:'professional_directory' },
  { key:'verification', label:'Verification Status', group:'Directory', icon:'approvals_queue' },
  { key:'appointments', label:'Team Appointments', group:'Directory', icon:'team_workspace' },
];

const seed = [
  { id:'PR-001', name:'Justin Kruger', reg:'PrArch 12,456', council:'SACAP', discipline:'Architecture', verified:true, role:'Lead Architect' },
  { id:'PR-002', name:'N. Mokoena', reg:'PrEng 88,210', council:'ECSA', discipline:'Fire Engineering', verified:true, role:'Fire Engineer' },
  { id:'PR-003', name:'D. Pieterse', reg:'PrQS 34,778', council:'SACQSP', discipline:'Quantity Surveying', verified:true, role:'QS' },
  { id:'PR-004', name:'T. Mahlangu', reg:'PrPln 15,902', council:'SACPLAN', discipline:'Town Planning', verified:false, role:'' },
  { id:'PR-005', name:'L. Ndlovu', reg:'CHSO 7,114', council:'SACPCMP', discipline:'Health & Safety', verified:true, role:'H&S Officer' },
];

export function ProfessionalDirectoryModule({ activeProject, currentRole, activeTabKey = 'directory', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const [search, setSearch] = useState('');
  const canVerify = ['admin','platform_admin','firm_admin'].includes(currentRole);
  const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.discipline.toLowerCase().includes(search.toLowerCase()));

  return <section className="space-y-4" aria-label="Professional Directory">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="professional_directory" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Council-verified professionals</p><h1 className="text-xl font-bold">Professional Directory</h1><p className="text-xs text-[#657287]">SACAP · ECSA · SACQSP · SACPLAN · SACPCMP registrations</p></div></div>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'directory' && <><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or discipline..." className="w-full rounded-2xl border border-[#102033]/10 bg-white p-3 text-xs shadow-sm focus:outline-none focus:border-[#19B7B0]" />
      <div className="grid gap-4 lg:grid-cols-2">{filtered.map(p => <article key={p.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#DFF5F2] text-xs font-bold text-[#167E79]">{p.name.split(' ').map(n => n[0]).join('')}</div><div><div className="flex items-center gap-2"><h2 className="text-sm font-bold">{p.name}</h2>{p.verified && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-700">✓ Verified</span>}</div><p className="text-xs text-[#657287]">{p.discipline}</p></div></div><div className="text-right"><div className="font-mono text-[10px] text-[#657287]">{p.reg}</div><div className="text-[10px] font-bold text-[#167E79]">{p.council}</div></div></div><div className="mt-3 flex items-center justify-between"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${p.role ? 'bg-[#DFF5F2] text-[#167E79]' : 'bg-gray-100 text-gray-500'}`}>{p.role || 'Not appointed'}</span><button className="rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79]">View profile</button></div></article>)}</div></>}

    {tab === 'verification' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Council Verification</h2>{items.map(p => <div key={p.id} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{p.reg}</span><div className="flex-1"><div className="text-xs font-bold">{p.name}</div><div className="text-[10px] text-[#657287]">{p.council} · {p.discipline}</div></div>{p.verified ? <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">✓ Registration confirmed {new Date().toLocaleDateString('en-ZA', {day:'numeric', month:'short'})}</span> : <button disabled={!canVerify} className="rounded-lg bg-[#167E79] px-2.5 py-1 text-[10px] font-bold text-white disabled:opacity-40">Verify with council</button>}</div>)}<p className="text-xs text-[#657287]">Verification queries the statutory council register directly; results are audited.</p></div>}

    {tab === 'appointments' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Appointed Team</h2>{[['Lead Architect','Justin Kruger','Appointed'],['Fire Engineer','N. Mokoena','Appointed'],['Quantity Surveyor','D. Pieterse','Appointed'],['Town Planner','T. Mahlangu','Pending verification'],['H&S Officer','L. Ndlovu','Appointed']].map(([role,name,st]) => <div key={role} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{role}</div><div className="text-[10px] text-[#657287]">{name}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Appointed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}<p className="text-xs text-[#657287]">Appointments feed the Team Workspace RACI and the project passport stakeholders register.</p></div>}
  </section>;
}