'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import { architexApi, demoIdentity, ApiDocument } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = (ALL_TOOLS['documents_drawings'] as ToolDefinition).tabs;
const canEdit = ['architect','bep','engineer','quantity_surveyor','town_planner','energy_professional','fire_engineer','cpm','contractor','admin','platform_admin'];

type DocRow = { id: string; number: string; title: string; discipline: string; rev: string; status: string; purpose: string; updated: string };

const seedDocs: DocRow[] = [
  { id:'doc-arch-set', number:'A-SET-001', title:'Architectural Drawing Set', discipline:'Architecture', rev:'P03', status:'In review', purpose:'Coordination', updated:'20 Aug 2026' },
  { id:'doc-fire-rpt', number:'FIRE-RPT-001', title:'Fire Strategy Report', discipline:'Fire', rev:'B', status:'Approved', purpose:'Municipal submission', updated:'19 Aug 2026' },
  { id:'doc-xa-rpt', number:'XA-RPT-001', title:'SANS 10400-XA Assessment', discipline:'Energy', rev:'P02', status:'In review', purpose:'Professional review', updated:'20 Aug 2026' },
];

const STATUS_LABEL: Record<string, string> = { draft:'Draft', review:'In review', approved:'Approved', superseded:'Superseded', archived:'Archived' };
const LABEL_STATUS: Record<string, string> = { 'Draft':'draft', 'In review':'review', 'Approved':'approved', 'Superseded':'superseded', 'Archived':'archived' };

function fromApi(d: ApiDocument): DocRow {
  return {
    id: d.id,
    number: d.number,
    title: d.title,
    discipline: d.discipline ?? 'General',
    rev: d.revision,
    status: STATUS_LABEL[d.status] ?? d.status,
    purpose: d.issue_purpose,
    updated: d.updated_at ? new Date(d.updated_at).toLocaleDateString('en-ZA', { day:'2-digit', month:'short', year:'numeric' }) : '—',
  };
}

export function DocumentsDrawingsModule({ activeProject, currentRole, activeTabKey = 'register', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [docs, setDocs] = useState<DocRow[]>(seedDocs);
  const [source, setSource] = useState<'api'|'seed'>('seed');
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const identity = demoIdentity(currentRole);
  const canMutate = canEdit.includes(currentRole);

  useEffect(() => {
    let cancelled = false;
    architexApi.documents.list(activeProject.id, identity)
      .then((list) => { if (!cancelled) { setDocs(list.map(fromApi)); setSource('api'); } })
      .catch(() => { if (!cancelled) setSource('seed'); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.id]);

  const toggleStatus = useCallback(async (doc: DocRow) => {
    const nextLabel = doc.status === 'Approved' ? 'In review' : 'Approved';
    if (source !== 'api') {
      setDocs(list => list.map(d => d.id === doc.id ? { ...d, status: nextLabel } : d));
      return;
    }
    setBusyId(doc.id); setError(null);
    try {
      const updated = await architexApi.documents.update(doc.id, { status: LABEL_STATUS[nextLabel] ?? 'review' }, identity);
      setDocs(list => list.map(d => d.id === doc.id ? fromApi(updated) : d));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update document');
    } finally { setBusyId(null); }
  }, [source, identity]);

  const filters = ['All', ...Array.from(new Set(docs.map(d => d.discipline)))];
  const visible = filter === 'All' ? docs : docs.filter(d => d.discipline === filter);
  const selectedDoc = docs.find(d => d.id === selected);

  return <section className="space-y-4" aria-label="Documents and Drawings">
    <PageHeader title="Documents & Drawings" origami={<OrigamiIcon name="documents_drawings" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Current-set control · {source === 'api' ? 'live' : 'offline seed'}</p><p>{activeProject.code} · revisioned evidence shared across modules</p></>} actions={<nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Documents and Drawings sections">{['Register','Current Set','Transmittals','Markups'].map((l, i) => <Button key={l} type="button" variant={tab === ['register','current_set','transmittals','markups'][i] ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === ['register','current_set','transmittals','markups'][i]} onClick={() => setTab(['register','current_set','transmittals','markups'][i])} className="shrink-0">{l}</Button>)}</nav>} />

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900"><strong>API error.</strong> {error}</div>}

    {tab === 'register' && <>
      <div className="grid gap-4 md:grid-cols-4">{[['Current records',String(docs.length)],['Awaiting review',String(docs.filter(d => d.status === 'In review').length)],['Approved',String(docs.filter(d => d.status === 'Approved').length)],['AI candidates','1']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <nav className="flex gap-1.5 overflow-x-auto" aria-label="Document disciplines">{[...filters].map(f => <Button key={f} type="button" variant={filter === f ? 'ink' : 'quiet'} size="sm" aria-pressed={filter === f} onClick={() => setFilter(f)} className="shrink-0">{f}</Button>)}</nav>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto" tabIndex={0} aria-label="Document register table"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Number','Title','Discipline','Revision','Purpose','Status','Updated',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{visible.map(doc => <tr key={doc.id} className={`hover:bg-[#f8fbfb] cursor-pointer ${selected === doc.id ? 'bg-[#DFF5F2]/40' : ''}`} onClick={() => setSelected(doc.id)}><td className="px-4 py-3 font-mono font-bold">{doc.number}</td><td className="px-4 py-3 font-semibold">{doc.title}</td><td className="px-4 py-3">{doc.discipline}</td><td className="px-4 py-3"><span className="rounded-full bg-[#DFF5F2] px-2 py-1 font-bold text-[#135f5a]">{doc.rev}</span></td><td className="px-4 py-3">{doc.purpose}</td><td className="px-4 py-3">{doc.status}</td><td className="px-4 py-3 text-[#657287]">{doc.updated}</td><td className="px-4 py-3"><button data-testid={`doc-toggle-${doc.id}`} onClick={(e) => { e.stopPropagation(); void toggleStatus(doc); }} disabled={!canMutate || busyId === doc.id} className="rounded-lg border px-2 py-1 text-[10px] font-bold text-[#135f5a] disabled:opacity-40">{busyId === doc.id ? '…' : doc.status === 'Approved' ? 'Unapprove' : 'Approve'}</button></td></tr>)}</tbody></table></div>
      </div>
      {selectedDoc && <div className="rounded-2xl border border-[#19B7B0]/30 bg-[#DFF5F2]/60 p-4 text-xs"><strong>{selectedDoc.number} · {selectedDoc.title}</strong><p className="mt-1 text-[#526074]">Revision {selectedDoc.rev} · Issued for {selectedDoc.purpose.toLowerCase()} · Updated {selectedDoc.updated}. Revision timeline and markups available in the Current Set and Markups tabs.</p></div>}
    </>}

    {tab === 'current_set' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between"><div><h2 className="text-base font-bold">Current Set ({docs.length} controlled documents)</h2><p className="text-xs text-[#657287]">Only explicitly issued revisions form the project&apos;s current set.</p></div><button disabled={!canMutate} className="rounded-xl bg-[#167E79] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Add controlled document</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase"><tr>{['Document','Current Revision','Issued For','Status'].map(h => <th key={h} className="px-4 py-3 text-[#657287]">{h}</th>)}</tr></thead><tbody className="divide-y">{docs.map(d => <tr key={d.id}><td className="px-4 py-3 font-semibold">{d.title}</td><td className="px-4 py-3"><span className="rounded-full bg-[#DFF5F2] px-2 py-1 font-bold text-[#167E79]">{d.rev}</span></td><td className="px-4 py-3">{d.purpose}</td><td className="px-4 py-3">{d.status}</td></tr>)}</tbody></table></div>
    </div>}

    {tab === 'transmittals' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-base font-bold">Transmittals</h2><button disabled={!canMutate} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">New transmittal</button></div>
      <div className="space-y-3">{[['TMT-014','A-SET-001 Rev P03 → Municipality','20 Aug 2026','Issued'],['TMT-013','FIRE-RPT-001 Rev B → Fire Dept','19 Aug 2026','Issued'],['TMT-012','S-201-SET Rev B → Contractor','18 Aug 2026','Acknowledged']].map(([n,desc,date,status]) => <div key={n} className="flex flex-col gap-2 rounded-xl border p-4 md:flex-row md:items-center"><div className="font-mono text-xs font-bold text-[#167E79]">{n}</div><div className="flex-1 text-xs font-semibold">{desc}</div><div className="text-xs text-[#657287]">{date}</div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Issued' ? 'bg-[#DFF5F2] text-[#167E79]' : 'bg-amber-100 text-amber-800'}`}>{status}</span></div>)}</div>
    </div>}

    {tab === 'markups' && <div className="grid gap-4 lg:grid-cols-3">
      <article className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="text-base font-bold">Markup Review — A-204</h2><span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">2 annotations live</span></div>
        <div className="mt-4 flex h-64 items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 text-slate-400"><div className="text-center font-mono text-xs">[Vector CAD viewport: A-204 Floor Plan]<div className="mt-1 text-slate-500">Escape route 1.2m vs 1.5m required</div></div><div className="absolute mt-40 ml-[-140px] rounded-full border-2 border-red-500 bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-700">Confirm 1.5m escape width</div></div>
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-950"><strong>AI review note:</strong> Suggested fenestration ratio 31.8% on N-04 (confidence 84%) — pending human acceptance via the shared drawing-intelligence service.</div>
      </article>
      <aside className="space-y-3">{[[{a:'N. Mokoena',m:'Escape width must be 1.5m per SANS 10400-T',s:'Open'}],[{a:'L. Smith',m:'Confirm bedroom window shading',s:'Resolved'}]].flat().map((c,i) => <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex justify-between text-xs"><span className="font-bold">{c.a}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.s === 'Open' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>{c.s}</span></div><p className="mt-2 text-xs text-[#526074]">{c.m}</p></div>)}</aside>
    </div>}
  </section>;
}
