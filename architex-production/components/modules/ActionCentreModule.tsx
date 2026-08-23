'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import { architexApi, demoIdentity, ApiActionItem } from '@/lib/api';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = (ALL_TOOLS['inbox_action'] as ToolDefinition).tabs;
const canEdit = ['architect','bep','engineer','quantity_surveyor','energy_professional','fire_engineer','cpm','contractor','firm_admin','admin','platform_admin'];

type ActionRow = { id: string; title: string; owner: string; due: string; priority: string; status: string; source: string };

const seedActions: ActionRow[] = [
  { id:'act-001', title:'Confirm fire escape width on A-204', owner:'Architect', due:'24 Aug', priority:'High', status:'Open', source:'Meetings' },
  { id:'act-002', title:'Upload municipal servitude confirmation', owner:'Town Planner', due:'26 Aug', priority:'Medium', status:'Open', source:'Project Passport' },
  { id:'act-003', title:'Review XA fenestration candidate values', owner:'Energy Professional', due:'23 Aug', priority:'High', status:'Blocked', source:'Drawing Intelligence' },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function fromApi(a: ApiActionItem): ActionRow {
  return {
    id: a.id,
    title: a.title,
    owner: a.owner,
    due: a.due ? new Date(a.due + 'T00:00:00').toLocaleDateString('en-ZA', { day:'2-digit', month:'short' }) : '—',
    priority: cap(a.priority),
    status: cap(a.status),
    source: a.source,
  };
}

const notifications = [
  { from:'N. Mokoena (Fire Eng)', subj:'Clarification on Fire Escape Width Mark-Up on A-204', time:'18 min ago', unread:true },
  { from:'City of Tshwane (Building Control)', subj:'Notice of Plan Scrutiny Appointment (Ref: eTSH-8841)', time:'2 hours ago', unread:true },
  { from:'David Pieterse (QS)', subj:'Bill of Quantities Trade Take-Off Complete for Tender Review', time:'Yesterday', unread:false },
  { from:'Wingman AI', subj:'Status summary updated — 3 open actions require attention', time:'Yesterday', unread:false },
];

export function ActionCentreModule({ activeProject, currentRole, activeTabKey = 'my_actions', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [actions, setActions] = useState<ActionRow[]>(seedActions);
  const [source, setSource] = useState<'api'|'seed'>('seed');
  const [read, setRead] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const identity = demoIdentity(currentRole);
  const canMutate = canEdit.includes(currentRole);

  useEffect(() => {
    let cancelled = false;
    architexApi.actions.list(activeProject.id, identity)
      .then((list) => { if (!cancelled) { setActions(list.map(fromApi)); setSource('api'); } })
      .catch(() => { if (!cancelled) setSource('seed'); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.id]);

  const close = useCallback(async (action: ActionRow) => {
    const nextStatus = action.status === 'Done' ? 'open' : 'done';
    if (source !== 'api') {
      setActions(list => list.map(a => a.id === action.id ? { ...a, status: a.status === 'Done' ? 'Open' : 'Done' } : a));
      return;
    }
    setBusyId(action.id); setError(null);
    try {
      const updated = await architexApi.actions.update(action.id, { status: nextStatus }, identity);
      setActions(list => list.map(a => a.id === action.id ? fromApi(updated) : a));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update action');
    } finally { setBusyId(null); }
  }, [source, identity]);

  const statusCount = (s: string) => actions.filter(a => a.status === s).length;

  return <section className="space-y-4" aria-label="Action Centre">
    <header className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-[#d95747]"><OrigamiIcon name="action_centre" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d95747]">Cross-module commitments · {source === 'api' ? 'live' : 'offline seed'}</p><h1 className="text-xl font-bold">Action Centre</h1><p className="text-xs text-[#657287]">{activeProject.code} · work from Meetings, Passport, Documents and AI review in one queue</p></div></div>
      <div className="flex gap-2">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-[#f5faf9] text-[#657287]'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}{t.badge && <span className="rounded-full bg-[#FF6B6B] px-1.5 text-[9px] text-white">{t.badge}</span>}</button>)}</div>
    </header>

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900"><strong>API error.</strong> {error}</div>}

    <div className="grid gap-3 md:grid-cols-4">{[['Open',statusCount('Open')],['Blocked',statusCount('Blocked')],['Done',statusCount('Done')],['Total',actions.length]].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>

    {(tab === 'my_actions' || tab === 'all') && <div className="space-y-3">{actions.map(a => <article key={a.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <div className={`h-10 w-1 rounded-full ${a.priority === 'High' ? 'bg-[#FF6B6B]' : 'bg-[#FFB020]'}`} />
      <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold">{a.title}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${a.status === 'Done' ? 'bg-green-100 text-green-700' : a.status === 'Blocked' ? 'bg-red-100 text-red-700' : 'bg-[#f2f7f6] text-[#657287]'}`}>{a.status}</span></div><p className="mt-1 text-xs text-[#657287]">Owner: {a.owner} · Due {a.due} · Source: {a.source}</p></div>
      <button data-testid={`action-toggle-${a.id}`} disabled={!canMutate || busyId === a.id} onClick={() => void close(a)} className="rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-40">{busyId === a.id ? '…' : a.status === 'Done' ? 'Reopen' : 'Mark done'}</button>
    </article>)}</div>}

    {tab === 'inbox' && <div className="rounded-2xl border bg-white shadow-sm divide-y">{notifications.map(n => { const isRead = read.has(n.subj); return <div key={n.subj} className={`flex items-center gap-3 p-4 ${isRead ? 'opacity-60' : ''}`} onClick={() => setRead(prev => new Set(prev).add(n.subj))}><span className={`h-2 w-2 shrink-0 rounded-full ${n.unread && !isRead ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} /><div className="flex-1 min-w-0"><div className="text-xs font-bold">{n.from}</div><div className="text-xs text-[#657287] truncate">{n.subj}</div></div><span className="font-mono text-[10px] text-[#96a0ad]">{n.time}</span></div>; })}</div>}

    {tab === 'decisions' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
      <h2 className="text-base font-bold">Decision Escalations</h2>
      {['Issue Architectural Set P03 for coordination','Accept Meeting Decision: fire engineer markup'].map(t => <div key={t} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><p className="text-xs font-bold">{t}</p><p className="text-[10px] text-[#657287]">Requires architect decision · escalates in 2 days</p></div><button className="rounded-lg bg-[#167E79] px-3 py-1.5 text-[10px] font-bold text-white">Review</button></div>)}
    </div>}

    <div className="rounded-2xl border border-[#19B7B0]/30 bg-[#DFF5F2] p-4 text-xs"><strong>Audit rule:</strong> ownership, due date, priority and status changes are recorded with actor, role, timestamp and source record.</div>
  </section>;
}
