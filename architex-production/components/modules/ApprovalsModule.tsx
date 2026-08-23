'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import { architexApi, demoIdentity, ApiApproval } from '@/lib/api';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = (ALL_TOOLS['approvals_queue'] as ToolDefinition).tabs;
const canDecide = ['architect','engineer','quantity_surveyor','energy_professional','fire_engineer','cpm','admin','platform_admin'];

interface ApprovalItem { id: string; type: string; title: string; requester: string; role: string; status: 'Pending'|'Approved'|'Rejected'; note?: string; at?: string }

const seed: ApprovalItem[] = [
  { id:'apr-001', type:'Document revision', title:'Issue Architectural Set P03 for coordination', requester:'BEP Coordinator', role:'architect', status:'Pending', at:'20 Aug 2026' },
  { id:'apr-002', type:'Meeting outcome', title:'Accept Meeting Decision: fire engineer markup', requester:'Architex Meetings', role:'architect', status:'Pending', at:'20 Aug 2026' },
  { id:'apr-003', type:'AI candidate', title:'Publish AI fenestration ratio (31.8%)', requester:'Drawing Intelligence', role:'architect', status:'Pending', at:'20 Aug 2026' },
];

const ENTITY_LABEL: Record<string, string> = { document_revision:'Document revision', meeting_outcome:'Meeting outcome', ai_candidate:'AI candidate', fee_proposal:'Fee proposal', change_order:'Change order' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function fromApi(a: ApiApproval): ApprovalItem {
  const currentStep = a.steps[a.current_step - 1];
  return {
    id: a.id,
    type: ENTITY_LABEL[a.entity_type] ?? cap(a.entity_type),
    title: a.title,
    requester: a.requested_by,
    role: currentStep?.role ?? 'architect',
    status: a.status === 'pending' ? 'Pending' : a.status === 'approved' ? 'Approved' : 'Rejected',
    at: a.requested_at ? new Date(a.requested_at).toLocaleDateString('en-ZA', { day:'2-digit', month:'short', year:'numeric' }) : '—',
  };
}

export function ApprovalsModule({ activeProject, currentRole, activeTabKey = 'pending', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState<ApprovalItem[]>(seed);
  const [source, setSource] = useState<'api'|'seed'>('seed');
  const [reason, setReason] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const identity = demoIdentity(currentRole);
  const canMutate = canDecide.includes(currentRole);

  useEffect(() => {
    let cancelled = false;
    architexApi.approvals.list(activeProject.id, identity)
      .then((list) => { if (!cancelled) { setItems(list.map(fromApi)); setSource('api'); } })
      .catch(() => { if (!cancelled) setSource('seed'); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.id]);

  const decide = useCallback(async (id: string, status: 'Approved'|'Rejected') => {
    const note = status === 'Rejected' ? (reason[id]?.trim() || 'No reason provided') : undefined;
    if (source !== 'api') {
      setItems(list => list.map(i => i.id === id ? { ...i, status, note, at: 'Just now' } : i));
      return;
    }
    setBusyId(id); setError(null);
    try {
      const updated = await architexApi.approvals.decide(id, status === 'Approved' ? 'approve' : 'reject', note ? { note } : {}, identity);
      setItems(list => list.map(i => i.id === id ? { ...fromApi(updated), note } : i));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decision failed');
    } finally { setBusyId(null); }
  }, [source, reason, identity]);

  const pending = items.filter(i => i.status === 'Pending');
  const decided = items.filter(i => i.status !== 'Pending');
  const visible = tab === 'pending' ? pending : tab === 'submitted' ? items.filter(i => i.requester === 'Architex Meetings' || i.requester === 'BEP Coordinator') : decided;

  return <section className="space-y-4" aria-label="Approvals Queue">
    <header className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-[#b77900]"><OrigamiIcon name="approvals_queue" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#b77900]">Human decision gates · {source === 'api' ? 'live' : 'offline seed'}</p><h1 className="text-xl font-bold">Approvals Queue</h1><p className="text-xs text-[#657287]">{activeProject.code} · server-enforced role authority, immutable decisions</p></div></div>
      <div className="flex gap-2">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#b77900] text-white' : 'bg-[#f5faf9] text-[#657287]'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}{t.badge && <span className="rounded-full bg-[#FF6B6B] px-1.5 text-[9px] text-white">{t.badge}</span>}</button>)}</div>
    </header>

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900"><strong>API error.</strong> {error}</div>}

    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-xs text-violet-950"><strong>AI cannot approve.</strong> AI candidates, meeting outcomes, extracted quantities and compliance suggestions remain drafts until the required authenticated human role decides them here. Decisions are immutable; a change requires a new request.</div>

    {visible.length === 0 ? <div className="rounded-2xl border bg-white p-8 text-center text-xs text-[#657287]">No items in this view.</div> :
    <div className="grid gap-4 lg:grid-cols-2">{visible.map(item => { const canDecideThis = currentRole === item.role || currentRole === 'platform_admin'; return <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase text-[#657287]">{item.type}</p><h2 className="mt-1 text-sm font-bold">{item.title}</h2><p className="mt-2 text-xs text-[#657287]">Requested by {item.requester} · Required role: {item.role} · {item.at}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === 'Pending' ? 'bg-amber-100 text-amber-800' : item.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span></div>
      {item.note && <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-[#526074]"><strong>Decision note:</strong> {item.note}</div>}
      {item.status === 'Pending' && <div className="mt-4 space-y-2">
        {item.role === currentRole && <div><label className="text-[10px] font-bold uppercase text-[#657287]">Rejection reason (required for reject)</label><input value={reason[item.id] || ''} onChange={e => setReason(r => ({...r, [item.id]: e.target.value}))} placeholder="Why is this being rejected?" className="mt-1 w-full rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2 text-xs" /></div>}
        <div className="flex gap-2"><button data-testid={`approval-reject-${item.id}`} disabled={!canDecideThis || busyId === item.id} onClick={() => void decide(item.id, 'Rejected')} className="flex-1 rounded-xl border border-red-300 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40">{busyId === item.id ? '…' : 'Reject'}</button><button data-testid={`approval-approve-${item.id}`} disabled={!canDecideThis || busyId === item.id} onClick={() => void decide(item.id, 'Approved')} className="flex-1 rounded-xl bg-[#167E79] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{busyId === item.id ? '…' : 'Approve'}</button></div>
        {!canDecideThis && <p className="text-[10px] text-[#657287]">Your active role ({currentRole}) may view but cannot decide this gate.</p>}
      </div>}
    </article>; })}</div>}

    <div className="rounded-2xl border bg-white p-4 text-xs text-[#526074]"><strong>Decision immutability:</strong> completed approvals cannot be overwritten. A changed decision requires a new approval request linked to the previous record.</div>
  </section>;
}
