'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'policies', label:'Insurance Policies', group:'Insurance', icon:'insurance_register' },
  { key:'requirements', label:'Statutory Requirements', group:'Insurance', icon:'detail' },
  { key:'renewals', label:'Renewals & Claims', group:'Insurance', icon:'workflow' },
];

const seed = [
  { id:'INS-001', policy:'Public Liability', insurer:'Santam', cover:'R 10,000,000', expiry:'31 Mar 2027', status:'Active' },
  { id:'INS-002', policy:'Contractor All Risk (CAR)', insurer:'Old Mutual Insure', cover:'R 45,000,000', expiry:'30 Nov 2026', status:'Active' },
  { id:'INS-003', policy:'Professional Indemnity', insurer:'AON', cover:'R 5,000,000', expiry:'31 Dec 2026', status:'Active' },
  { id:'INS-004', policy:'Employers Liability / COIDA', insurer:'Compensation Fund', cover:'Statutory', expiry:'30 Jun 2027', status:'Active' },
];

export function InsuranceRegisterModule({ activeProject, currentRole, activeTabKey = 'policies', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [policies, setPolicies] = useState(seed);
  const canEdit = ['firm_admin','admin','platform_admin','cpm'].includes(currentRole);

  return <section className="space-y-4" aria-label="Insurance Register">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-[#b77900]"><OrigamiIcon name="insurance_register" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#b77900]">Coverage & renewals</p><h1 className="text-xl font-bold">Insurance Register</h1><p className="text-xs text-[#657287]">{activeProject.code} · statutory and contractual cover</p></div></div>
      <button disabled={!canEdit} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">+ Add policy</button>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#b77900] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'policies' && <div className="grid gap-4 lg:grid-cols-2">{policies.map(p => <article key={p.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="font-mono text-xs font-bold text-[#b77900]">{p.id}</span><h2 className="mt-1 text-sm font-bold">{p.policy}</h2><p className="mt-1 text-xs text-[#657287]">{p.insurer}</p></div><div className="text-right"><div className="text-sm font-bold">{p.cover}</div><span className={`mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span></div></div><div className="mt-3 rounded-xl bg-[#f5faf9] p-3 text-xs"><strong>Expires:</strong> {p.expiry} <button disabled={!canEdit} className="ml-2 text-[#167E79] font-bold disabled:opacity-40">Renew →</button></div></article>)}</div>}

    {tab === 'requirements' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Statutory & Contractual Requirements</h2>{[['Public liability — R10m','JBCC clause 6.2 · mandatory'],['Contractor All Risk','Building contract works cover'],['Professional indemnity','All professionals signing'],['COIDA registration','Statutory — all employers']].flat().map(([req,note]) => <div key={req} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{req}</div><div className="text-[10px] text-[#657287]">{note}</div></div><span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">✓ On file</span></div>)}</div>}

    {tab === 'renewals' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Renewals & Claims</h2>{[['INS-002 CAR','Renews 30 Nov 2026 · premium notice pending','Upcoming'],['CLM-001','Water damage claim — podium (VO-004 related)','Under assessment']].map(([p,d,st]) => <div key={p} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{p}</div><div className="text-[10px] text-[#657287]">{d}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${st === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'}`}>{st}</span></div>)}</div>}
  </section>;
}