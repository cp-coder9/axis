'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onOpenWingman?: () => void; onTabChange?: (key: string) => void }

const TABS = [
  { key:'rfis', label:'RFI Register', group:'RFIs', icon:'rfi' },
  { key:'issues', label:'Issues', group:'RFIs', icon:'risk' },
  { key:'responses', label:'Response Workflow', group:'RFIs', icon:'workflow' },
  { key:'audit', label:'Audit Trail', group:'RFIs', icon:'detail' },
];

interface Rfi { id: string; title: string; raisedBy: string; discipline: string; status: 'Open'|'In Response'|'Closed'; due: string }
const seedRfis: Rfi[] = [
  { id:'RFI-014', title:'Confirm fire escape width on A-204', raisedBy:'N. Mokoena', discipline:'Fire', status:'Open', due:'23 Aug' },
  { id:'RFI-013', title:'Clarify waterproofing membrane build-up at parapet', raisedBy:'Contractor', discipline:'Architecture', status:'In Response', due:'24 Aug' },
  { id:'RFI-012', title:'Structural opening size for stacker doors', raisedBy:'Subcontractor', discipline:'Structural', status:'Closed', due:'18 Aug' },
  { id:'RFI-011', title:'Municipal servitude setback interpretation', raisedBy:'Town Planner', discipline:'Planning', status:'Open', due:'26 Aug' },
];

export function IssuesRfisModule({ activeProject, currentRole, activeTabKey = 'rfis', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [rfis, setRfis] = useState(seedRfis);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', discipline:'Architecture', question:'' });
  const [response, setResponse] = useState('');

  const raiseRfi = () => {
    if (!form.title.trim() || !form.question.trim()) return;
    setRfis(list => [{ id:`RFI-${String(list.length + 15).padStart(3,'0')}`, title:form.title, raisedBy:'Justin Kruger', discipline:form.discipline, status:'Open', due:'+3 days' }, ...list]);
    setForm({ title:'', discipline:'Architecture', question:'' });
    setShowForm(false);
  };

  const active = rfis.filter(r => r.status === 'Open').length;
  const inResponse = rfis.filter(r => r.status === 'In Response').length;

  return <section className="space-y-4" aria-label="Issues and RFIs">
    <header className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FF6B6B]/10 text-[#d95747]"><OrigamiIcon name="issues_rfis" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d95747]">Formal query pipeline</p><h1 className="text-xl font-bold">Issues & RFIs</h1><p className="text-xs text-[#657287]">{activeProject.code} · audited queries with response workflow</p></div></div>
      <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white">+ Raise RFI</button>
    </header>

    {showForm && <div className="rounded-2xl border border-[#19B7B0]/30 bg-white p-5 shadow-sm space-y-3">
      <h3 className="text-sm font-bold">Raise a formal RFI</h3>
      <div className="grid gap-3 md:grid-cols-2"><input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Subject line" className="rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2.5 text-xs" /><select value={form.discipline} onChange={e => setForm(f => ({...f, discipline:e.target.value}))} className="rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2.5 text-xs">{['Architecture','Structural','Fire','Electrical','Mechanical','Planning','Quantity Surveying'].map(d => <option key={d}>{d}</option>)}</select></div>
      <textarea value={form.question} onChange={e => setForm(f => ({...f, question:e.target.value}))} rows={3} placeholder="Describe the question or clarification required..." className="w-full rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2.5 text-xs" />
      <div className="flex justify-end gap-2"><button onClick={() => setShowForm(false)} className="rounded-xl border px-4 py-2 text-xs font-bold">Cancel</button><button onClick={raiseRfi} className="rounded-xl bg-[#19B7B0] px-4 py-2 text-xs font-bold text-white">Submit RFI</button></div>
    </div>}

    <div className="flex gap-2 overflow-x-auto">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#102033] text-white' : 'bg-white text-[#657287] border'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</button>)}</div>

    {tab === 'rfis' && <><div className="grid gap-3 md:grid-cols-3">{[['Open',String(active)],['In response',String(inResponse)],['Closed this month','6']].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}</div>
      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['RFI','Subject','Raised by','Discipline','Status','Due'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{rfis.map(r => <tr key={r.id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold text-[#167E79]">{r.id}</td><td className="px-4 py-3 font-semibold">{r.title}</td><td className="px-4 py-3">{r.raisedBy}</td><td className="px-4 py-3">{r.discipline}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${r.status === 'Closed' ? 'bg-green-100 text-green-700' : r.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span></td><td className="px-4 py-3 text-[#657287]">{r.due}</td></tr>)}</tbody></table></div></>}

    {tab === 'issues' && <div className="space-y-3">{[['ISSUE-004','Masonry out of plumb — Block 2','High','Open'],['ISSUE-003','Water ingress at podium junction','Medium','In progress'],['ISSUE-002','Window schedule discrepancy','Medium','Resolved'],['ISSUE-001','Site access conflict','Low','Resolved']].map(([id,title,sev,status]) => <div key={id} className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm"><span className="font-mono text-xs font-bold text-[#d95747]">{id}</span><div className="flex-1"><div className="text-xs font-bold">{title}</div><div className="text-[10px] text-[#657287]">Severity: {sev}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Resolved' ? 'bg-green-100 text-green-700' : status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{status}</span></div>)}</div>}

    {tab === 'responses' && <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">RFI-014 · Fire escape width on A-204</h3><p className="mt-2 text-xs leading-5 text-[#526074]">Question: The marked escape route on A-204 measures 1.2m at the corridor constriction. Please confirm the required clear width per SANS 10400-T.</p><div className="mt-3 rounded-xl bg-[#DFF5F2] p-3 text-xs"><strong>AI draft (Wingman):</strong> Escape width shall be a minimum of 1.5m clear. The constriction at gridline 8 requires relocation of the service duct.</div><textarea value={response} onChange={e => setResponse(e.target.value)} rows={3} placeholder="Authorised response..." className="mt-3 w-full rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2.5 text-xs" /><div className="mt-2 flex justify-end"><button onClick={() => setResponse('')} className="rounded-xl bg-[#19B7B0] px-4 py-2 text-xs font-bold text-white">Submit response</button></div></div>
      <aside className="rounded-2xl border bg-white p-5 shadow-sm h-fit text-xs space-y-2"><h4 className="font-bold uppercase tracking-wider text-[#96a0ad]">Response governance</h4><p className="text-[#526074]">Only the responsible professional may submit a formal response. Responses write to the audit trail and the document register.</p><div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-950">AI-drafted responses remain drafts until submitted by an authorised professional.</div></aside>
    </div>}

    {tab === 'audit' && <div className="rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Event','Entity','Actor','When'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['Raised','RFI-014','N. Mokoena','20 Aug'],['AI draft','Response RFI-014','Wingman AI','20 Aug'],['Submitted','RFI-013 response','Justin Kruger','19 Aug'],['Closed','RFI-012','Justin Kruger','18 Aug']].map(([e,en,a,w]) => <tr key={e+en} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-bold">{e}</td><td className="px-4 py-3 font-mono text-[#167E79]">{en}</td><td className="px-4 py-3">{a}</td><td className="px-4 py-3 text-[#657287]">{w}</td></tr>)}</tbody></table></div>}
  </section>;
}