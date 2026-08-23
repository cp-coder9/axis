'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'tracker', label:'Municipal Tracker', group:'Tracker', icon:'municipal_tracker' },
  { key:'timeline', label:'Timeline', group:'Tracker', icon:'programme' },
  { key:'alerts', label:'Alerts & Blocks', group:'Tracker', icon:'risk' },
];

const seed = [
  { id:'MT-01', item:'Building plan approval', authority:'Building Control', target:'14 Sep', status:'On track', daysLeft:24 },
  { id:'MT-02', item:'Land-use consent', authority:'Planning', target:'28 Sep', status:'At risk', daysLeft:38 },
  { id:'MT-03', item:'Energy compliance (XA)', authority:'Building Control', target:'7 Sep', status:'Blocked', daysLeft:17 },
  { id:'MT-04', item:'Fire department comment', authority:'Fire Services', target:'21 Sep', status:'On track', daysLeft:31 },
];

export function MunicipalTrackerModule({ activeProject, currentRole, activeTabKey = 'tracker', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState(seed);
  const canEdit = ['architect','town_planner','cpm','admin','platform_admin'].includes(currentRole);

  return <section className="space-y-4" aria-label="Municipal Tracker">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="municipal_tracker" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Approval deadlines</p><h1 className="text-xl font-bold">Municipal Tracker</h1><p className="text-xs text-[#657287]">{activeProject.code} · every municipal interaction against its target</p></div></div>
    </header>
    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'tracker' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Item','Authority','Target','Days left','Status',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{items.map(m => <tr key={m.id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{m.id}</td><td className="px-4 py-3 font-semibold">{m.item}</td><td className="px-4 py-3">{m.authority}</td><td className="px-4 py-3">{m.target}</td><td className="px-4 py-3 font-bold">{m.daysLeft}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${m.status === 'On track' ? 'bg-green-100 text-green-700' : m.status === 'At risk' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>{m.status}</span></td></tr>)}</tbody></table></div>}

    {tab === 'timeline' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Approval Timeline</h2>{[['Now','Energy compliance blocked — XA values unconfirmed'],['24 Aug','Fire escape markup required on A-204'],['7 Sep','XA declaration target'],['14 Sep','Building plan decision target (day 60)'],['28 Sep','Land-use consent target']].map(([date,event]) => <div key={date} className="flex gap-3 rounded-xl border p-4"><span className="shrink-0 rounded-lg bg-[#DFF5F2] px-2 py-1 font-mono text-[10px] font-bold text-[#167E79]">{date}</span><p className="text-xs leading-5 text-[#526074]">{event}</p></div>)}</div>}

    {tab === 'alerts' && <div className="space-y-3">{items.filter(m => m.status !== 'On track').map(m => <div key={m.id} className={`rounded-2xl border p-4 shadow-sm ${m.status === 'Blocked' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#d95747]">{m.id}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${m.status === 'Blocked' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{m.status}</span></div><p className="mt-2 text-sm font-bold">{m.item}</p><p className="mt-1 text-xs text-[#526074]">{m.status === 'Blocked' ? 'Cannot proceed until the SANS 10400-XA declaration is completed and signed.' : 'Target at risk — escalate to town planner.'}</p></div>)}<div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-xs text-green-900">✓ 2 items on track — no action required.</div></div>}
  </section>;
}