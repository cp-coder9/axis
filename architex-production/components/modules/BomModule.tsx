'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface BomModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
}

const TABS = (ALL_TOOLS['bom'] as ToolDefinition).tabs;

const PIPELINE_STAGES = ['Spec approved', 'RFQ', 'Quote', 'PO', 'Delivery'];

const ANOMALIES = [
  { id: 'FLG-001', item: 'BOM-003', type: 'Quantity mismatch', severity: 'High', desc: 'Takeoff from S-203 Rev A measures 4.8 t vs 5.6 t priced in the BoM line.', status: 'Open' },
  { id: 'FLG-002', item: 'BOM-006', type: 'Unmapped drawing', severity: 'Medium', desc: 'Window schedule A-204 Rev P03 references a detail sheet not linked to any BoM line.', status: 'Open' },
  { id: 'FLG-003', item: 'BOM-002', type: 'Pricing variance', severity: 'Medium', desc: 'Market rate for 30 MPa concrete is R 2 720 vs R 2 650 applied — variance above 2%.', status: 'Open' },
  { id: 'FLG-004', item: 'BOM-001', type: 'Unit mismatch', severity: 'Low', desc: 'Takeoff unit m³ conflicts with the SMM clause rate measured per m².', status: 'Open' },
];

const PIPELINE = [
  { trade: 'Earthworks', supplier: 'GroundCo Excavations (Pty) Ltd', stage: 'Delivery' },
  { trade: 'Concrete & Formwork', supplier: 'Concrete Masters SA', stage: 'PO' },
  { trade: 'Masonry', supplier: 'BrickLine Suppliers', stage: 'Quote' },
  { trade: 'Waterproofing', supplier: 'RoofRight Membranes', stage: 'RFQ' },
  { trade: 'Fenestration', supplier: 'AluGlass Systems', stage: 'Spec approved' },
];

const QS_ITEMS = [
  { id: 'BOM-001', desc: 'Excavation in soft material for strip footings not exceeding 2.0m deep', qty: 145, unit: 'm³', status: 'Pending' },
  { id: 'BOM-003', desc: 'High tensile steel rebar (Y12 & Y16) bent to schedule', qty: 4.8, unit: 't', status: 'Pending' },
  { id: 'BOM-005', desc: '4mm APP torch-on membrane to flat concrete roof slab', qty: 280, unit: 'm²', status: 'Pending' },
  { id: 'BOM-006', desc: 'Double glazed powder-coated aluminium windows and sliding stacker doors', qty: 48.5, unit: 'm²', status: 'Pending' },
];

const EXPORTS = [
  { id: 'EXP-001', name: 'Priced Bill of Quantities', format: 'PDF/A', size: '1.2 MB', desc: 'Full priced BoM per SANS 2001 measurement standard.' },
  { id: 'EXP-002', name: 'BoM Line Register', format: 'XLSX', size: '340 KB', desc: 'Editable line items with rates, sources and takeoff refs.' },
  { id: 'EXP-003', name: 'Preamble & Preliminaries Pack', format: 'PDF/A', size: '820 KB', desc: 'SANS 2001 preamble and preliminaries clauses for tender issue.' },
];

const AUDIT = [
  { id: 'AUD-001', action: 'BoM lines published from drawing takeoff', actor: 'S. Nkosi (QS)', time: '2026-08-21 14:02', record: 'BOM-001..006' },
  { id: 'AUD-002', action: 'Rate override applied to concrete lines', actor: 'S. Nkosi (QS)', time: '2026-08-20 09:47', record: 'BOM-002' },
  { id: 'AUD-003', action: 'Takeoff revision synced from A-204 Rev P03', actor: 'System', time: '2026-08-19 16:30', record: 'BOM-006' },
  { id: 'AUD-004', action: 'Unpriced tender package exported', actor: 'J. Kruger (Arch)', time: '2026-08-18 11:12', record: 'TND-002' },
];

export const BomModule: React.FC<BomModuleProps> = ({
  activeProject,
  currentRole,
  activeTabKey,
  onTabChange,
}) => {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [items, setItems] = useState([
    { code: 'BOM-001', trade: 'Earthworks', desc: 'Excavation in soft material for strip footings not exceeding 2.0m deep', qty: 145, unit: 'm³', rate: 285, total: 41325, source: 'A-101 Rev C' },
    { code: 'BOM-002', trade: 'Concrete & Formwork', desc: '30 MPa reinforced concrete in foundation strip footings and column bases', qty: 68, unit: 'm³', rate: 2650, total: 180200, source: 'S-201 Rev B' },
    { code: 'BOM-003', trade: 'Concrete & Formwork', desc: 'High tensile steel rebar (Y12 & Y16) bent to schedule', qty: 4.8, unit: 't', rate: 24500, total: 117600, source: 'S-203 Rev A' },
    { code: 'BOM-004', trade: 'Masonry', desc: 'One-brick exterior walling in semi-face clay brick bedded in Class II mortar', qty: 420, unit: 'm²', rate: 890, total: 373800, source: 'A-102 Rev C' },
    { code: 'BOM-005', trade: 'Waterproofing', desc: '4mm APP torch-on membrane to flat concrete roof slab including 100mm upstands', qty: 280, unit: 'm²', rate: 320, total: 89600, source: 'A-201 Rev B' },
    { code: 'BOM-006', trade: 'Fenestration', desc: 'Double glazed powder-coated aluminium windows and sliding stacker doors', qty: 48.5, unit: 'm²', rate: 3850, total: 186725, source: 'A-204 Rev P03' },
  ]);
  const [anomalies, setAnomalies] = useState(ANOMALIES);
  const [qsItems, setQsItems] = useState(QS_ITEMS);
  const [toast, setToast] = useState<string | null>(null);

  const totalEstimate = items.reduce((acc, curr) => acc + curr.total, 0);

  const resolveAnomaly = (id: string) =>
    setAnomalies((list) => list.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a)));

  const reviewQs = (id: string, status: string) =>
    setQsItems((list) => list.map((q) => (q.id === id ? { ...q, status } : q)));

  const handleExport = (name: string) => {
    setToast(`Exported ${name} successfully.`);
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Bill of Quantities (BoM) Engine"
        origami={<OrigamiIcon name="bom" size={26} />}
        metadata={<p>Standard System of Measuring Building Work (7th Edition) quantities with live drawing takeoff sync and market rates.</p>}
        actions={<nav className="flex max-w-full overflow-x-auto" aria-label="Bill of quantities sections">
          {TABS.map((t) => (
            <Button
              key={t.key}
              type="button"
              variant={tab === t.key ? 'ink' : 'quiet'}
              size="sm"
              aria-label={t.badge ? `${t.label} ${t.badge}` : t.label}
              aria-pressed={tab === t.key}
              onClick={() => setTab(t.key || '')}
              className="shrink-0"
            >
              {t.icon && <OrigamiIcon name={t.icon} size={13} />}
              {t.label}
              {t.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    tab === t.key ? 'bg-[#102033] text-white' : 'bg-[#102033]/5 text-[#102033]'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </Button>
          ))}
        </nav>}
      />

      {/* Drawing Takeoff */}
      {tab === 'takeoff' && (
        <div data-tool-tab="takeoff" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="font-bold text-sm text-[#102033]">Revision takeoff register</h3><p className="mt-1 text-xs text-[#657287]">Measured drawing regions linked to current BoM quantities.</p></div>
            <Button type="button" variant="ink" size="sm">Scan latest drawing set</Button>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {[
              { sheet: 'A-101 Rev C', scope: 'Ground floor plans', regions: 18, variance: '0.0%' },
              { sheet: 'S-203 Rev A', scope: 'Reinforcement schedules', regions: 12, variance: '+16.7%' },
              { sheet: 'A-204 Rev P03', scope: 'Window & door schedule', regions: 9, variance: 'Unmapped detail' },
            ].map((drawing) => (
              <article key={drawing.sheet} className="rounded-2xl border bg-white p-4 text-xs shadow-sm">
                <div className="flex items-center justify-between"><span className="font-mono font-bold text-[#167E79]">{drawing.sheet}</span><span className="rounded-full bg-[#102033]/5 px-2 py-1 text-[10px] font-bold text-[#526074]">{drawing.regions} regions</span></div>
                <div className="mt-3 font-bold text-[#102033]">{drawing.scope}</div><div className="mt-2 text-[#657287]">Quantity variance: {drawing.variance}</div>
                <button className="mt-4 w-full rounded-xl border border-[#19B7B0]/30 py-2 font-bold text-[#167E79]">Open measured overlay</button>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Measured BoM Items */}
      {tab === 'bomlines' && (
        <div data-tool-tab="bomlines" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#102033]">Trade Quantities & Measured Line Items</h3>
              <p className="text-[#657287]">Priced under ASAQS standard method of measurement.</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#657287]">Estimated Trade Total:</span>
              <div className="font-mono font-extrabold text-base text-[#167E79]">
                R {totalEstimate.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y">
              <thead>
                <tr className="text-[#96a0ad] text-[10.5px] uppercase tracking-wider">
                  <th className="py-2">Item Code</th>
                  <th className="py-2">Trade</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Unit</th>
                  <th className="py-2">Rate (ZAR)</th>
                  <th className="py-2 text-right">Total (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row) => (
                  <tr key={row.code} className="hover:bg-gray-50/50">
                    <td className="py-2.5 font-mono font-bold text-[#167E79]">{row.code}</td>
                    <td className="py-2.5 font-bold text-[#102033]">{row.trade}</td>
                    <td className="py-2.5 text-[#526074] max-w-xs">{row.desc}</td>
                    <td className="py-2.5 font-semibold">{row.qty}</td>
                    <td className="py-2.5 text-[#657287]">{row.unit}</td>
                    <td className="py-2.5 font-mono">R {row.rate.toFixed(2)}</td>
                    <td className="py-2.5 font-mono font-bold text-right text-[#102033]">
                      R {row.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Flagged Anomalies */}
      {tab === 'flagged' && (
        <div data-tool-tab="flagged" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#102033]">Flagged Anomalies</h3>
              <p className="text-[#657287]">Discrepancies between drawing takeoff, priced quantities and market rates awaiting resolution.</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#657287]">Open anomalies:</span>
              <div className="font-mono font-extrabold text-base text-[#d95747]">
                {anomalies.filter((a) => a.status === 'Open').length}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {anomalies.map((a) => (
              <div key={a.id} className="flex items-center gap-3 border rounded-xl p-3 bg-[#fffaf7]">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B6B]/10 text-[#d95747] flex items-center justify-center shrink-0">
                  <OrigamiIcon name="risk" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#167E79]">{a.item}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#657287]">{a.type}</span>
                  </div>
                  <p className="text-[#526074] truncate">{a.desc}</p>
                </div>
                <span
                  className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold ${
                    a.severity === 'High'
                      ? 'bg-red-100 text-red-700'
                      : a.severity === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {a.severity}
                </span>
                {a.status === 'Open' ? (
                  <button
                    onClick={() => resolveAnomaly(a.id)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-[#19B7B0] text-white text-[11px] font-bold hover:bg-[#167E79] transition-all"
                  >
                    Resolve →
                  </button>
                ) : (
                  <span className="shrink-0 px-3 py-1.5 rounded-xl bg-green-100 text-green-700 text-[11px] font-bold">Resolved</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Procurement Pipeline */}
      {tab === 'procurement' && (
        <div data-tool-tab="procurement" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#102033]">Procurement Pipeline</h3>
            <p className="text-[#657287]">Per-trade supplier progress from specification approval through to delivery.</p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {PIPELINE_STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="px-2.5 py-1 rounded-lg border border-[#19B7B0]/20 bg-[#19B7B0]/5 text-[#167E79] font-bold">
                  {s}
                </span>
                {i < PIPELINE_STAGES.length - 1 && <span className="text-[#96a0ad]">→</span>}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {PIPELINE.map((p) => {
              const stageIndex = PIPELINE_STAGES.indexOf(p.stage);
              return (
                <div key={p.trade} className="border rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-[#102033]">{p.trade}</div>
                      <div className="text-[#657287] truncate">{p.supplier}</div>
                    </div>
                    <span className="shrink-0 px-2 py-1 rounded-full bg-[#19B7B0]/10 text-[#167E79] text-[10px] font-bold">
                      {p.stage}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {PIPELINE_STAGES.map((s, i) => (
                      <div
                        key={s}
                        title={s}
                        className={`h-1.5 flex-1 rounded-full ${i <= stageIndex ? 'bg-[#19B7B0]' : 'bg-gray-100'}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QS Review Queue */}
      {tab === 'qs_review' && (
        <div data-tool-tab="qs_review" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#102033]">QS Review Queue</h3>
              <p className="text-[#657287]">Line items awaiting quantity surveyor verification before tender pricing.</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#657287]">Awaiting review:</span>
              <div className="font-mono font-extrabold text-base text-[#102033]">
                {qsItems.filter((q) => q.status === 'Pending').length}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {qsItems.map((q) => (
              <div key={q.id} className="border rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#167E79]">{q.id}</span>
                  {q.status === 'Pending' ? (
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Pending</span>
                  ) : q.status === 'Approved' ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">Approved</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Flagged</span>
                  )}
                </div>
                <p className="text-[#526074]">{q.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#657287] font-semibold">
                    {q.qty} {q.unit}
                  </span>
                  {q.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewQs(q.id, 'Approved')}
                        className="px-3 py-1.5 rounded-xl bg-green-100 text-green-700 text-[11px] font-bold hover:bg-green-200 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reviewQs(q.id, 'Flagged')}
                        className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 text-[11px] font-bold hover:bg-red-200 transition-all"
                      >
                        Flag
                      </button>
                    </div>
                  ) : (
                    <span className="text-[#96a0ad] text-[10px]">Decision recorded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tender Packages */}
      {tab === 'tender' && (
        <div data-tool-tab="tender" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="font-bold text-sm text-[#102033]">Tender package register</h3><p className="mt-1 text-xs text-[#657287]">JBCC-aligned unpriced bills, addenda and bidder issue controls.</p></div>
            <button className="rounded-xl bg-[#19B7B0] px-4 py-2 text-xs font-bold text-white">Create tender package</button>
          </div>
          <div className="space-y-3">
            {[
              { ref: 'TND-004', title: 'Principal building contract', lines: 47, bidders: 5, status: 'Ready for issue' },
              { ref: 'TND-003', title: 'Fenestration specialist package', lines: 8, bidders: 3, status: 'QS review' },
              { ref: 'TND-002', title: 'Bulk earthworks package', lines: 6, bidders: 4, status: 'Closed' },
            ].map((tender) => (
              <article key={tender.ref} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 text-xs shadow-sm sm:flex-row sm:items-center">
                <span className="font-mono font-bold text-[#167E79]">{tender.ref}</span><div className="flex-1"><div className="font-bold text-[#102033]">{tender.title}</div><div className="mt-1 text-[#657287]">{tender.lines} BoM lines · {tender.bidders} invited bidders</div></div>
                <span className="rounded-full bg-[#19B7B0]/10 px-2.5 py-1 text-[10px] font-bold text-[#167E79]">{tender.status}</span>
                <button className="rounded-xl border px-3 py-2 font-bold text-[#102033]">Open package</button>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Document Export */}
      {tab === 'export' && (
        <div data-tool-tab="export" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#102033]">Document Export</h3>
            <p className="text-[#657287]">Export deliverables for issue and distribution, SANS 2001 aligned.</p>
          </div>

          {toast && (
            <div className="rounded-xl border border-[#19B7B0]/30 bg-[#DFF5F2] px-3 py-2 text-[#167E79] font-bold">
              {toast}
            </div>
          )}

          <div className="divide-y divide-gray-100 border rounded-xl">
            {EXPORTS.map((x) => (
              <div key={x.id} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-lg bg-[#19B7B0]/10 text-[#167E79] flex items-center justify-center shrink-0">
                  <OrigamiIcon name="document" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#102033]">{x.name}</div>
                  <div className="text-[#657287] truncate">{x.desc}</div>
                </div>
                <span className="shrink-0 px-2 py-1 rounded-md bg-[#102033]/5 text-[#657287] text-[10px] font-mono font-bold">
                  {x.format}
                </span>
                <span className="shrink-0 text-[#96a0ad]">{x.size}</span>
                <button
                  onClick={() => handleExport(x.name)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-[#102033] text-white text-[11px] font-bold hover:bg-[#167E79] transition-all"
                >
                  Export
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {tab === 'audit' && (
        <div data-tool-tab="audit" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#102033]">Audit Trail</h3>
            <p className="text-[#657287]">Immutable record of actions taken on this BoM. Entries cannot be edited or deleted.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y">
              <thead>
                <tr className="text-[#96a0ad] text-[10.5px] uppercase tracking-wider">
                  <th className="py-2">Event ID</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Actor</th>
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Linked Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {AUDIT.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 font-mono font-bold text-[#167E79]">{a.id}</td>
                    <td className="py-2.5 font-semibold text-[#102033]">{a.action}</td>
                    <td className="py-2.5 text-[#526074]">{a.actor}</td>
                    <td className="py-2.5 text-[#657287]">{a.time}</td>
                    <td className="py-2.5 font-mono text-[#526074]">{a.record}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
