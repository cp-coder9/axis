'use client';

import React, { useState } from 'react';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';

interface SpecForgeModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
}

const TABS = (ALL_TOOLS['specforge'] as ToolDefinition).tabs;

const TRADES = ['All', 'Earthworks', 'Concrete Formwork', 'Masonry & Plaster', 'Waterproofing', 'Carpentry & Joinery', 'Roof Coverings', 'Fenestration & Glazing', 'Finishes & Tiling', 'Plumbing & Drainage', 'Electrical'];

const SPEC_ITEMS = [
  { code: 'FIN-WT-001', name: 'Rectified Porcelain Wall Tile (600x1200mm)', trade: 'Finishes & Tiling', status: 'Approved', manufacturer: 'Douglas Jones / Global Stone', clause: 'Tile adhesive to SANS 2001-CT1. Waterproof underlayment membrane on wet-room zones.', drawing: 'A-511 / ID-204', allowance: 745, image: 'warm stone / satin white' },
  { code: 'FIN-FT-004', name: 'Anti-Slip R10 Matt Floor Tile', trade: 'Finishes & Tiling', status: 'Review', manufacturer: 'Ceramic Industries SA', clause: 'Grouting to be epoxy non-staining antimicrobial in public circulation corridors.', drawing: 'A-510 / ID-202', allowance: 680, image: 'graphite / fine aggregate' },
  { code: 'WAT-BM-002', name: 'Torch-on 4mm APP Bituminous Membrane', trade: 'Waterproofing', status: 'Approved', manufacturer: 'Derbigum / ABE', clause: 'Dual layer with 100mm side laps and 150mm end laps. 10-year joint guarantee certificate.', drawing: 'A-320 / D-17', allowance: 320, image: 'charcoal membrane / silver cap' },
  { code: 'FEN-AL-012', name: 'Thermal Break Double Glazed Aluminium Stacker', trade: 'Fenestration & Glazing', status: 'Approved', manufacturer: 'Hulamin Architectural / Wispeco', clause: 'Low-E solar control laminate. SHGC <= 0.48, U-value <= 4.2 W/m2K in compliance with SANS 10400-XA.', drawing: 'A-604 / WS-03', allowance: 3850, image: 'bronze frame / low-E glass' },
];

const SECTIONS = [
  { no: '01', trade: 'Earthworks', clauses: 18, complete: 100, owner: 'Civil engineer', revision: 'P03' },
  { no: '03', trade: 'Concrete Formwork', clauses: 34, complete: 94, owner: 'Structural engineer', revision: 'P05' },
  { no: '07', trade: 'Waterproofing', clauses: 22, complete: 86, owner: 'Architect', revision: 'P04' },
  { no: '09', trade: 'Fenestration & Glazing', clauses: 41, complete: 91, owner: 'Architect', revision: 'P06' },
  { no: '12', trade: 'Finishes & Tiling', clauses: 56, complete: 78, owner: 'Interior architect', revision: 'P02' },
];

const APPROVALS = [
  { id: 'APR-041', item: 'FIN-WT-001 Wall tile selection', reviewer: 'Client representative', due: '24 Aug', status: 'Approved' },
  { id: 'APR-044', item: 'FIN-FT-004 R10 floor tile', reviewer: 'Architect', due: '25 Aug', status: 'Awaiting review' },
  { id: 'APR-047', item: 'Section 07 waterproofing warranty', reviewer: 'Quantity surveyor', due: '27 Aug', status: 'Cost check' },
  { id: 'APR-052', item: 'FEN-AL-012 glazing performance', reviewer: 'Energy professional', due: '29 Aug', status: 'Technical review' },
];

const DRAWING_FINDINGS = [
  { id: 'SCAN-018', sheet: 'A-320 Rev P04', finding: 'Roof outlet upstand has no matching waterproofing termination clause.', severity: 'High', link: 'WAT-BM-002' },
  { id: 'SCAN-021', sheet: 'A-604 Rev P06', finding: 'Window type W12 performance note differs from the product register U-value.', severity: 'Medium', link: 'FEN-AL-012' },
  { id: 'SCAN-024', sheet: 'ID-204 Rev P02', finding: 'Wet-room wall tile extent is shown but substrate preparation is unspecified.', severity: 'Medium', link: 'FIN-WT-001' },
];

const ISSUE_PACKAGES = [
  { revision: 'P06', title: 'Tender specification', audience: 'Tenderers', sections: 17, date: '23 Aug 2026', status: 'Ready to issue' },
  { revision: 'P05', title: 'Client approval set', audience: 'Client team', sections: 15, date: '18 Aug 2026', status: 'Superseded' },
  { revision: 'P04', title: 'Cost review set', audience: 'Quantity surveyor', sections: 14, date: '11 Aug 2026', status: 'Issued' },
];

const statusClass = (status: string) => {
  if (status === 'Approved' || status === 'Ready to issue' || status === 'Issued') return 'bg-emerald-100 text-emerald-700';
  if (status === 'High') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
};

export const SpecForgeModule: React.FC<SpecForgeModuleProps> = ({
  activeProject,
  currentRole,
  activeTabKey,
  onTabChange,
}) => {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || 'overview', onTabChange);
  const [selectedTrade, setSelectedTrade] = useState('Finishes & Tiling');
  const [toast, setToast] = useState<string | null>(null);

  const filtered = SPEC_ITEMS.filter((item) => selectedTrade === 'All' || item.trade === selectedTrade);
  const specificationValue = SPEC_ITEMS.reduce((total, item) => total + item.allowance, 0);
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  return (
    <section className="space-y-4" aria-label="SpecForge specification builder">
      <header className="flex flex-col gap-4 rounded-3xl border border-[#102033]/10 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#19B7B0]/30 bg-[#19B7B0]/10 text-[#167E79]">
              <OrigamiIcon name="specification" size={26} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#102033]">SpecForge V2</h1>
                <span className="rounded-full bg-[#DFF5F2] px-2 py-0.5 text-[10px] font-bold text-[#167E79]">{activeProject.revision}</span>
              </div>
              <p className="text-[13px] text-[#657287]">{activeProject.name} · coordinated visual, clause, cost and drawing specification workflow</p>
            </div>
          </div>
          <button onClick={() => setTab('issue')} className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1d3550]">
            Prepare issue set
          </button>
        </div>

        <nav className="overflow-x-auto" aria-label="SpecForge workflow">
          <div className="flex min-w-max gap-1 rounded-2xl border border-[#102033]/10 bg-[#F7F9FB] p-1">
            {TABS.map((item) => (
              <button
                key={item.key}
                aria-pressed={tab === item.key}
                onClick={() => setTab(item.key || '')}
                aria-current={tab === item.key ? 'page' : undefined}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all ${tab === item.key ? 'bg-[#19B7B0] text-white shadow-sm' : 'text-[#657287] hover:bg-white hover:text-[#102033]'}`}
              >
                {item.icon && <OrigamiIcon name={item.icon} size={13} />}
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {tab === 'overview' && (
        <div data-tool-tab="overview" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Specification health', '88%', '244 of 277 clauses coordinated'],
              ['Products approved', '3 / 4', 'One selection awaiting review'],
              ['Cost exposure', 'R 186k', 'Allowances above QS baseline'],
              ['Drawing findings', '3', 'One high-priority coordination gap'],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#96a0ad]">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-[#102033]">{value}</p>
                <p className="mt-1 text-[11px] text-[#657287]">{detail}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="text-base font-bold text-[#102033]">Specification readiness</h2><p className="text-xs text-[#657287]">Trade sections advancing toward tender issue P06.</p></div>
                <span className="rounded-full bg-[#102033] px-2.5 py-1 text-[10px] font-bold text-white">Gate: 90%</span>
              </div>
              <div className="mt-4 space-y-3">
                {SECTIONS.map((section) => (
                  <div key={section.no} className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <div><div className="flex justify-between text-xs"><span className="font-bold text-[#102033]">{section.no} · {section.trade}</span><span className="font-mono text-[#657287]">{section.complete}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E8EDF2]"><div className="h-full rounded-full bg-[#19B7B0]" style={{ width: `${section.complete}%` }} /></div></div>
                    <button onClick={() => setTab('sections')} className="text-[11px] font-bold text-[#167E79]">Review</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#2563EB]/20 bg-[#F3F7FF] p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2563EB]">Next issue gate</p>
              <h2 className="mt-2 text-lg font-bold text-[#102033]">Tender specification P06</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#526074]">Resolve the roof outlet clause, approve the R10 floor tile and accept the QS cost check before distribution.</p>
              <div className="mt-4 space-y-2 text-xs">
                {['1 critical drawing finding', '2 approvals outstanding', '17 trade sections included'].map((line) => <div key={line} className="flex items-center gap-2 rounded-xl bg-white/80 p-2.5 font-semibold text-[#526074]"><span className="h-2 w-2 rounded-full bg-[#2563EB]" />{line}</div>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'pictorial' && (
        <div data-tool-tab="pictorial" className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h2 className="text-lg font-bold text-[#102033]">Pictorial selection board</h2><p className="text-xs text-[#657287]">Material intent aligned to clauses, suppliers and drawing locations.</p></div><button onClick={() => showToast('Pictorial board exported with clause references.')} className="rounded-xl border bg-white px-3 py-2 text-xs font-bold text-[#167E79] shadow-sm">Export board</button></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SPEC_ITEMS.map((item, index) => (
              <article key={item.code} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className={`relative h-40 ${index === 0 ? 'bg-[linear-gradient(135deg,#d8d0c4_0_48%,#f5f1e9_48%_52%,#b9a994_52%)]' : index === 1 ? 'bg-[radial-gradient(circle_at_30%_30%,#77808a_0_2px,transparent_3px),#343c45] bg-[length:18px_18px]' : index === 2 ? 'bg-[repeating-linear-gradient(125deg,#29313b_0_14px,#3b4652_14px_18px)]' : 'bg-[linear-gradient(120deg,#6f5644_0_25%,#a8c4c5_25%_70%,#38424a_70%)]'}`}>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 font-mono text-[10px] font-bold text-[#102033]">{item.code}</span>
                  <span className="absolute bottom-3 left-3 rounded-lg bg-[#102033]/80 px-2 py-1 text-[10px] font-semibold text-white">{item.image}</span>
                </div>
                <div className="space-y-2 p-4"><h3 className="text-sm font-bold leading-snug text-[#102033]">{item.name}</h3><p className="text-[11px] text-[#657287]">{item.manufacturer}</p><div className="flex items-center justify-between border-t pt-2 text-[10px]"><span className="font-mono text-[#526074]">{item.drawing}</span><span className={`rounded-full px-2 py-0.5 font-bold ${statusClass(item.status)}`}>{item.status}</span></div></div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'sections' && (
        <div data-tool-tab="sections" className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border bg-white p-3 shadow-sm">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#96a0ad]">Model trade index</p>
            {TRADES.map((trade) => <button key={trade} onClick={() => setSelectedTrade(trade)} className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold ${selectedTrade === trade ? 'bg-[#19B7B0] text-white' : 'text-[#657287] hover:bg-[#F7F9FB]'}`}>{trade}</button>)}
          </aside>
          <div className="space-y-3">
            <div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#167E79]">Section editor · {selectedTrade}</p><h2 className="mt-1 text-lg font-bold text-[#102033]">Performance, workmanship and product clauses</h2><p className="mt-1 text-xs text-[#657287]">Model preambles coordinated against SANS 2001, project drawings and selected products.</p></div>
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.length > 0 ? filtered.map((item) => (
                <article key={item.code} className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#167E79]">{item.code}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(item.status)}`}>{item.status}</span></div><h3 className="text-sm font-bold text-[#102033]">{item.name}</h3><div className="rounded-xl border bg-[#F7F9FB] p-3 text-xs leading-relaxed text-[#526074]"><strong className="text-[#102033]">Trade clause:</strong> {item.clause}</div><div className="flex justify-between border-t pt-2 text-[10px] text-[#657287]"><span>{item.drawing}</span><button onClick={() => showToast(`${item.code} opened in clause editor.`)} className="font-bold text-[#167E79]">Edit clause</button></div></article>
              )) : <div className="rounded-2xl border bg-white p-5 text-xs text-[#657287] md:col-span-2">The {selectedTrade} section contains project preambles only; no proprietary product clauses are scheduled for this issue.</div>}
            </div>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div data-tool-tab="products" className="rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-[#102033]">Product register</h2><p className="text-xs text-[#657287]">Named products, approved equivalents and performance requirements.</p></div><button onClick={() => showToast('Product comparison sheet created.')} className="rounded-xl bg-[#19B7B0] px-3 py-2 text-xs font-bold text-white">Compare selections</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-xs"><thead className="bg-[#F7F9FB] text-[10px] uppercase tracking-wider text-[#96a0ad]"><tr><th className="p-3">Reference</th><th className="p-3">Product</th><th className="p-3">Manufacturer / equivalent</th><th className="p-3">Drawing link</th><th className="p-3">Allowance</th><th className="p-3">Status</th></tr></thead><tbody className="divide-y">{SPEC_ITEMS.map((item) => <tr key={item.code} className="hover:bg-[#F7F9FB]/70"><td className="p-3 font-mono font-bold text-[#167E79]">{item.code}</td><td className="p-3 font-bold text-[#102033]">{item.name}<div className="mt-1 font-normal text-[10px] text-[#657287]">{item.trade}</div></td><td className="p-3 text-[#526074]">{item.manufacturer}</td><td className="p-3 font-mono text-[#526074]">{item.drawing}</td><td className="p-3 font-mono font-bold">R {item.allowance.toLocaleString('en-ZA')}/unit</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(item.status)}`}>{item.status}</span></td></tr>)}</tbody></table></div>
        </div>
      )}

      {tab === 'docpreview' && (
        <div data-tool-tab="docpreview" className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <article className="rounded-2xl border bg-white p-6 shadow-sm md:p-10">
            <div className="border-b-2 border-[#102033] pb-5"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#657287]">{activeProject.code} · Tender issue P06</p><h2 className="mt-3 text-2xl font-extrabold text-[#102033]">Architectural Works Specification</h2><p className="mt-1 text-sm text-[#657287]">{activeProject.name} · {activeProject.location}</p></div>
            <div className="py-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#167E79]">Section 12 · Finishes & Tiling</p><h3 className="mt-2 text-lg font-bold text-[#102033]">12.4 Ceramic and porcelain tiling</h3><p className="mt-4 text-xs leading-6 text-[#526074]">Provide all materials, labour, setting out, cutting, bedding, jointing and protection required for a complete tiled finish. Confirm tile batches and setting-out control points before installation.</p>{SPEC_ITEMS.filter((item) => item.trade === 'Finishes & Tiling').map((item) => <div key={item.code} className="mt-5 border-l-2 border-[#19B7B0] pl-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-sm font-bold text-[#102033]">{item.code} · {item.name}</h4><span className="font-mono text-[10px] text-[#657287]">Ref. {item.drawing}</span></div><p className="mt-2 text-xs leading-6 text-[#526074]">{item.clause}</p><p className="mt-2 text-[10px] text-[#657287]">Basis of design: {item.manufacturer}. Submit samples and technical data for approval.</p></div>)}</div>
            <div className="flex justify-between border-t pt-3 font-mono text-[9px] text-[#96a0ad]"><span>SPEC-P06-12</span><span>Page 34 of 96</span></div>
          </article>
          <aside className="space-y-3"><div className="rounded-2xl border bg-white p-4 shadow-sm"><h3 className="text-sm font-bold text-[#102033]">Document controls</h3><div className="mt-3 space-y-2 text-xs text-[#526074]">{[['Issue', 'P06 · Tender'], ['Sections', '17 included'], ['Pages', '96 generated'], ['Format', 'PDF/A + DOCX']].map(([key, value]) => <div key={key} className="flex justify-between border-b pb-2"><span>{key}</span><strong className="text-[#102033]">{value}</strong></div>)}</div><button onClick={() => showToast('Preview regenerated from current clauses.')} className="mt-4 w-full rounded-xl bg-[#102033] py-2 text-xs font-bold text-white">Regenerate preview</button></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Publication check</p><p className="mt-2 text-xs leading-relaxed text-amber-900">One unresolved drawing finding will appear in the issue notes until closed.</p></div></aside>
        </div>
      )}

      {tab === 'approvals' && (
        <div data-tool-tab="approvals" className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h2 className="text-lg font-bold text-[#102033]">Approval register</h2><p className="text-xs text-[#657287]">Decision trail for product, technical and commercial acceptance.</p></div><span className="rounded-full border bg-white px-3 py-1.5 text-[10px] font-bold text-[#526074]">Viewing as {currentRole.replaceAll('_', ' ')}</span></div>
          <div className="grid gap-3 md:grid-cols-2">{APPROVALS.map((approval) => <article key={approval.id} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold text-[#167E79]">{approval.id}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(approval.status)}`}>{approval.status}</span></div><h3 className="mt-3 text-sm font-bold text-[#102033]">{approval.item}</h3><div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#F7F9FB] p-3 text-[11px]"><div><span className="text-[#96a0ad]">Reviewer</span><p className="mt-0.5 font-semibold text-[#526074]">{approval.reviewer}</p></div><div><span className="text-[#96a0ad]">Due</span><p className="mt-0.5 font-semibold text-[#526074]">{approval.due}</p></div></div><button onClick={() => showToast(`${approval.id} decision record opened.`)} className="mt-3 text-xs font-bold text-[#167E79]">Open decision record</button></article>)}</div>
        </div>
      )}

      {tab === 'budget' && (
        <div data-tool-tab="budget" className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex justify-between"><div><h2 className="text-lg font-bold text-[#102033]">Specification cost exposure</h2><p className="text-xs text-[#657287]">Selected products against QS design allowances.</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-[#96a0ad]">Project budget</p><p className="font-mono text-sm font-bold text-[#102033]">R {activeProject.budget.toLocaleString('en-ZA')}</p></div></div><div className="mt-5 space-y-3">{SPEC_ITEMS.map((item, index) => { const variance = [8.4, 3.1, -1.8, 12.6][index]; return <div key={item.code} className="rounded-xl border p-3"><div className="flex flex-wrap justify-between gap-2"><div><span className="font-mono text-[10px] font-bold text-[#167E79]">{item.code}</span><p className="text-xs font-bold text-[#102033]">{item.name}</p></div><div className="text-right"><p className="font-mono text-xs font-bold">R {item.allowance.toLocaleString('en-ZA')}</p><p className={`text-[10px] font-bold ${variance > 5 ? 'text-red-600' : variance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{variance > 0 ? '+' : ''}{variance}% vs allowance</p></div></div></div>; })}</div></div>
          <aside className="space-y-4"><div className="rounded-2xl bg-[#102033] p-5 text-white shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8EDDD8]">Scheduled selection index</p><p className="mt-3 text-3xl font-extrabold">R {specificationValue.toLocaleString('en-ZA')}</p><p className="mt-1 text-xs text-white/65">Combined unit allowance across the active product register.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-[#19B7B0]" /></div><p className="mt-2 text-[10px] text-white/60">72% of product selections cost-checked</p></div><div className="rounded-2xl border border-red-200 bg-red-50 p-4"><h3 className="text-sm font-bold text-red-800">Cost risk requiring decision</h3><p className="mt-1 text-xs leading-relaxed text-red-700">FEN-AL-012 exceeds the glazing allowance by 12.6%. Confirm performance substitution or approve R 186,725 exposure.</p><button onClick={() => setTab('approvals')} className="mt-3 text-xs font-bold text-red-800">Send to approval register</button></div></aside>
        </div>
      )}

      {tab === 'bomboq' && (
        <div data-tool-tab="bomboq" className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-[#102033]">BoM / BoQ specification links</h2><p className="text-xs text-[#657287]">Clause obligations translated into measurable procurement line items.</p></div><div className="rounded-xl bg-[#DFF5F2] px-3 py-2 text-center"><p className="text-xl font-extrabold text-[#167E79]">4 / 4</p><p className="text-[9px] font-bold uppercase tracking-wider text-[#167E79]">Products mapped</p></div></div></div>
          <div className="grid gap-3 lg:grid-cols-2">{SPEC_ITEMS.map((item, index) => <article key={item.code} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3D6] text-[#9A6500]"><OrigamiIcon name="bom" size={18} /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><span className="font-mono text-[10px] font-bold text-[#167E79]">{item.code}</span><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Synced</span></div><h3 className="mt-1 text-sm font-bold text-[#102033]">{item.name}</h3><div className="mt-3 grid grid-cols-3 gap-2 text-[10px]"><div className="rounded-lg bg-[#F7F9FB] p-2"><span className="text-[#96a0ad]">BoQ line</span><p className="mt-1 font-mono font-bold text-[#102033]">BOM-00{index + 5}</p></div><div className="rounded-lg bg-[#F7F9FB] p-2"><span className="text-[#96a0ad]">Quantity</span><p className="mt-1 font-bold text-[#102033]">{[420, 680, 280, 48.5][index]} {[index < 3 ? 'm2' : 'm2']}</p></div><div className="rounded-lg bg-[#F7F9FB] p-2"><span className="text-[#96a0ad]">Source</span><p className="mt-1 font-mono font-bold text-[#102033]">{item.drawing.split(' / ')[0]}</p></div></div></div></div></article>)}</div>
        </div>
      )}

      {tab === 'drawings' && (
        <div data-tool-tab="drawings" className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h2 className="text-lg font-bold text-[#102033]">AI drawing-to-spec coordination</h2><p className="text-xs text-[#657287]">Latest scan: 42 sheets, 318 callouts and 244 clauses compared.</p></div><button onClick={() => showToast('Drawing scan completed: 3 coordination findings retained.')} className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700">Run coordination scan</button></div>{DRAWING_FINDINGS.map((finding) => <article key={finding.id} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(finding.severity)}`}>{finding.severity}</span><span className="font-mono text-[10px] text-[#657287]">{finding.id} · {finding.sheet}</span></div><span className="font-mono text-[10px] font-bold text-[#167E79]">Links {finding.link}</span></div><p className="mt-3 text-xs font-semibold leading-relaxed text-[#102033]">{finding.finding}</p><div className="mt-3 flex gap-3 border-t pt-3"><button onClick={() => showToast(`${finding.id} converted to a clause action.`)} className="text-[11px] font-bold text-[#167E79]">Create clause action</button><button onClick={() => showToast(`${finding.id} marked reviewed.`)} className="text-[11px] font-bold text-[#657287]">Mark reviewed</button></div></article>)}</div>
          <aside className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-700">Scan coverage</p><div className="mt-4 space-y-4">{[['Architectural', 100], ['Interior', 92], ['Structural', 84], ['Schedules', 96]].map(([name, value]) => <div key={name as string}><div className="flex justify-between text-xs"><span className="font-semibold text-[#526074]">{name}</span><span className="font-mono font-bold text-[#102033]">{value}%</span></div><div className="mt-1.5 h-1.5 rounded-full bg-[#E8EDF2]"><div className="h-full rounded-full bg-purple-500" style={{ width: `${value}%` }} /></div></div>)}</div><div className="mt-5 rounded-xl bg-[#F7F9FB] p-3 text-[11px] leading-relaxed text-[#657287]">The scan reads callouts and schedules as coordination evidence. Professional review remains required before clauses are issued.</div></aside>
        </div>
      )}

      {tab === 'issue' && (
        <div data-tool-tab="issue" className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="text-lg font-bold text-[#102033]">Issue and distribution register</h2><p className="text-xs text-[#657287]">Controlled specification packages with immutable revision records.</p></div><div className="divide-y">{ISSUE_PACKAGES.map((item) => <div key={item.revision} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1FF] font-mono text-sm font-extrabold text-[#2563EB]">{item.revision}</div><div><h3 className="text-sm font-bold text-[#102033]">{item.title}</h3><p className="text-[10px] text-[#657287]">{item.audience} · {item.sections} sections · {item.date}</p></div></div><span className={`w-fit rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(item.status)}`}>{item.status}</span></div>)}</div></div>
          <aside className="rounded-2xl border border-[#19B7B0]/30 bg-[#F1FBFA] p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#167E79]">P06 issue checklist</p><h2 className="mt-2 text-lg font-bold text-[#102033]">Tender specification</h2><div className="mt-4 space-y-2">{[['Clause coordination', 'Complete'], ['Product approvals', '1 outstanding'], ['QS cost review', '1 outstanding'], ['Drawing scan', '1 critical finding'], ['Document preview', 'Generated']].map(([label, state]) => <div key={label} className="flex items-center justify-between rounded-xl bg-white p-2.5 text-[11px]"><span className="font-semibold text-[#526074]">{label}</span><span className={`font-bold ${state === 'Complete' || state === 'Generated' ? 'text-emerald-700' : 'text-amber-700'}`}>{state}</span></div>)}</div><button onClick={() => showToast('P06 issue held: resolve three outstanding controls.')} className="mt-4 w-full rounded-xl bg-[#19B7B0] py-2.5 text-xs font-bold text-white shadow-sm">Validate and issue P06</button><p className="mt-2 text-center text-[10px] text-[#657287]">Distribution: client, tenderers, QS and design team</p></aside>
        </div>
      )}

      {toast && <div role="status" className="fixed bottom-24 right-6 z-50 rounded-xl bg-[#102033] px-4 py-2.5 text-xs text-white shadow-2xl">{toast}</div>}
    </section>
  );
};
