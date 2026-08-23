'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = (ALL_TOOLS['forms'] as ToolDefinition).tabs;

const templates = [
  { id:'SANS-10400-XA-01', name:'SANS 10400-XA Energy Compliance Declaration', cat:'Compliance', rev:'2024-03' },
  { id:'SANS-10400-T-02', name:'Fire Protection Rational Design Certificate', cat:'Compliance', rev:'2024-01' },
  { id:'SACAP-APPT-03', name:'Professional Appointment Agreement', cat:'Appointment', rev:'2024-02' },
  { id:'NHBRC-ENR-04', name:'NHBRC Enrolment Application', cat:'Statutory', rev:'2024-04' },
  { id:'MUNI-BP-05', name:'Municipal Building Plan Application (Form A)', cat:'Municipal', rev:'2024-05' },
  { id:'OHS-REG9-06', name:'Construction Work Permit — Reg 9', cat:'Safety', rev:'2024-02' },
];

interface Draft { id: string; template: string; status: 'Draft'|'Submitted'|'Exported'; updated: string }
const seedDrafts: Draft[] = [
  { id:'FRM-001', template:'SANS 10400-XA Energy Compliance Declaration', status:'Draft', updated:'20 Aug 2026' },
  { id:'FRM-002', template:'Municipal Building Plan Application (Form A)', status:'Draft', updated:'19 Aug 2026' },
  { id:'FRM-003', template:'Professional Appointment Agreement', status:'Exported', updated:'17 Aug 2026' },
];

export function FormsModule({ activeProject, currentRole, activeTabKey = 'library', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(templates[0].id);
  const [drafts, setDrafts] = useState(seedDrafts);
  const [editorFields, setEditorFields] = useState<Record<string, string>>({
    'Project Name': activeProject.name,
    'Project Code': activeProject.code,
    'Client': activeProject.client,
    'Municipality': activeProject.municipality,
    'Lead Professional': activeProject.professional,
    'Site Address': activeProject.location,
    'Lifecycle Stage': activeProject.stage,
  });
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase()));
  const activeTemplate = templates.find(t => t.id === selected);

  return <section className="space-y-4" aria-label="Integrated Forms">
    <header className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="forms" size={26} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Auto-filling statutory documents</p><h1 className="text-xl font-bold">Integrated Form System</h1><p className="text-xs text-[#657287]">Passport data auto-fills every form · human review before export</p></div></div>
      <div className="flex gap-2">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key || '')} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold ${tab === t.key ? 'bg-[#19B7B0] text-white' : 'bg-[#f5faf9] text-[#657287]'}`}>{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}{t.badge && <span className="rounded-full bg-[#FF6B6B] px-1.5 text-[9px] text-white">{t.badge}</span>}</button>)}</div>
    </header>

    {tab === 'library' && <div className="space-y-4">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates by name or category..." className="w-full rounded-2xl border border-[#102033]/10 bg-white p-3 text-xs shadow-sm focus:outline-none focus:border-[#19B7B0]" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map(t => <button key={t.id} onClick={() => { setSelected(t.id); setTab('editor'); }} className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:border-[#19B7B0] ${selected === t.id ? 'border-[#19B7B0] ring-1 ring-[#19B7B0]/30' : ''}`}><div className="flex items-start justify-between gap-2"><span className="rounded-full bg-[#DFF5F2] px-2 py-1 text-[10px] font-bold text-[#167E79]">{t.cat}</span><span className="text-[10px] text-[#96a0ad]">Rev {t.rev}</span></div><h3 className="mt-3 text-sm font-bold leading-snug">{t.name}</h3><p className="mt-2 font-mono text-[10px] text-[#657287]">{t.id}</p></button>)}</div>
    </div>}

    {tab === 'editor' && <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="text-base font-bold">{activeTemplate?.name}</h2><p className="text-xs text-[#657287]">Auto-filled from Project Passport — verify before export</p></div><span className="rounded-full bg-[#DFF5F2] px-2 py-1 text-[10px] font-bold text-[#167E79]">{activeTemplate?.id}</span></div>
        <div className="grid gap-3 md:grid-cols-2">{Object.entries(editorFields).map(([k, v]) => <div key={k}><label className="text-[10px] font-bold uppercase text-[#657287]">{k}</label><input value={v} onChange={e => setEditorFields(f => ({ ...f, [k]: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#102033]/10 bg-[#f5faf9] p-2.5 text-xs focus:border-[#19B7B0] focus:outline-none" /></div>)}</div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"><strong>Human review required.</strong> AI-filled values are advisory. Exporting records your role, timestamp and audit entry.</div>
        <div className="flex gap-2"><button onClick={() => { setDrafts(d => [{ id:`FRM-${String(d.length+1).padStart(3,'0')}`, template: activeTemplate?.name || 'Form', status:'Draft', updated:'Just now' }, ...d]); showToast('Draft saved to My Drafts.'); }} className="rounded-xl border border-[#167E79] px-4 py-2 text-xs font-bold text-[#167E79]">Save draft</button><button onClick={() => showToast('Export queued — PDF generation job created.')} className="rounded-xl bg-[#167E79] px-4 py-2 text-xs font-bold text-white">Export PDF</button></div>
      </div>
      <aside className="rounded-2xl border bg-white p-5 shadow-sm h-fit space-y-3 text-xs"><h4 className="font-bold uppercase tracking-wider text-[#96a0ad]">Form Intelligence</h4><div className="space-y-2 text-[#526074]"><div><strong>Auto-fill source:</strong> Project Passport v3</div><div><strong>Validation:</strong> 6/6 fields populated</div><div><strong>Linked records:</strong> Documents & Drawings</div><div><strong>Export:</strong> PDF/A · XLSX</div></div></aside>
    </div>}

    {tab === 'drafts' && <div className="rounded-2xl border bg-white shadow-sm divide-y">{drafts.length === 0 ? <div className="p-8 text-center text-xs text-[#657287]">No drafts yet.</div> : drafts.map(d => <div key={d.id} className="flex items-center gap-3 p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{d.id}</span><div className="flex-1"><div className="text-xs font-bold">{d.template}</div><div className="text-[10px] text-[#657287]">Updated {d.updated}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${d.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>{d.status}</span><button onClick={() => { setTab('editor'); }} className="rounded-lg border px-2.5 py-1 text-[10px] font-bold text-[#167E79]">Open</button></div>)}</div>}

    {tab === 'export' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Export Queue</h2>{[['FRM-003','Professional Appointment Agreement','PDF/A','Completed','17 Aug 2026'],['FRM-001','SANS 10400-XA Energy Compliance Declaration','PDF/A','Queued','Pending']].map(([id,name,fmt,status,when]) => <div key={id} className="flex items-center gap-3 rounded-xl border p-4"><span className="font-mono text-xs font-bold text-[#167E79]">{id}</span><div className="flex-1"><div className="text-xs font-bold">{name}</div><div className="text-[10px] text-[#657287]">{fmt} · {when}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{status}</span></div>)}</div>}

    {tab === 'audit' && <div className="rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Event','Form','Actor','Role','When'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['Exported','Professional Appointment Agreement','Justin Kruger','architect','17 Aug'],['Drafted','Municipal Building Plan Application','Justin Kruger','architect','19 Aug'],['Auto-filled','SANS 10400-XA Declaration','Wingman AI','system','20 Aug']].map(([e,f,a,r,w]) => <tr key={e+f} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-bold">{e}</td><td className="px-4 py-3">{f}</td><td className="px-4 py-3">{a}</td><td className="px-4 py-3">{r}</td><td className="px-4 py-3 text-[#657287]">{w}</td></tr>)}</tbody></table></div>}

    {toast && <div className="fixed right-6 bottom-24 bg-[#102033] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50">{toast}</div>}
  </section>;
}