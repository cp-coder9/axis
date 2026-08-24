'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = (ALL_TOOLS['itp'] as ToolDefinition).tabs;

interface Checkpoint { id: string; item: string; trade: string; criteria: string; status: 'Pass'|'Fail'|'Hold Point'|'Pending'; signedBy?: string; when?: string }
const seedCheckpoints: Checkpoint[] = [
  { id:'ITP-001', item:'Strip footing excavation to lines & levels', trade:'Earthworks', criteria:'SANS 10120 · depth ±25mm', status:'Pass', signedBy:'Site Manager', when:'18 Aug' },
  { id:'ITP-002', item:'Reinforcement placement before concrete', trade:'Concrete', criteria:'Y12/Y16 spacing per S-201', status:'Hold Point', signedBy:'Engineer', when:'19 Aug' },
  { id:'ITP-003', item:'30 MPa concrete pour — slump test', trade:'Concrete', criteria:'Slump 75-100mm per SANS 5861', status:'Pending' },
  { id:'ITP-004', item:'Masonry walling plumb & line', trade:'Masonry', criteria:'±5mm per storey', status:'Fail', signedBy:'Clerk of Works', when:'20 Aug' },
];
const materials = [
  { id:'MAT-001', material:'Cement (CEM II 42.5N)', standard:'SANS 50197-1', tests:['Fineness','Setting time','Compressive strength'], status:'Awaiting results' },
  { id:'MAT-002', material:'Concrete cubes (30 MPa)', standard:'SANS 5861-3', tests:['7-day','28-day'], status:'7-day passed' },
  { id:'MAT-003', material:'Reinforcing steel Y12/Y16', standard:'SANS 920-1', tests:['Tensile','Bend','Rib geometry'], status:'Awaiting results' },
];

export function ItpModule({ activeProject, currentRole, activeTabKey = 'overview', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [checkpoints, setCheckpoints] = useState(seedCheckpoints);
  const canSign = ['architect','engineer','cpm','site_manager','admin','platform_admin'].includes(currentRole);
  const passed = checkpoints.filter(c => c.status === 'Pass').length;
  const failed = checkpoints.filter(c => c.status === 'Fail').length;
  const holds = checkpoints.filter(c => c.status === 'Hold Point').length;

  const setStatus = (id: string, status: Checkpoint['status']) => setCheckpoints(list => list.map(c => c.id === id ? { ...c, status, signedBy: status === 'Pending' ? undefined : 'Engineer', when: status === 'Pending' ? undefined : 'Just now' } : c));

  return <section className="space-y-4" aria-label="Inspection Test Plans">
    <PageHeader
      title="Inspection Test Plans"
      origami={<OrigamiIcon name="itp" size={26} />}
      metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">QA checkpoints · SANS aligned</p><p>{activeProject.code} · hold points gate construction progress</p></>}
      actions={<nav className="flex max-w-full overflow-x-auto" aria-label="Inspection test plan sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}{t.badge && <span className="rounded-full bg-[#FF6B6B] px-1.5 text-[9px] text-white">{t.badge}</span>}</Button>)}</nav>}
    />

    {tab === 'overview' && <div className="grid gap-4 md:grid-cols-4">{[['Checkpoints',String(checkpoints.length)],['Passed',String(passed)],['Hold Points',String(holds)],['Failures',String(failed)]].map(([l,v]) => <div key={l} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] uppercase text-[#657287]">{l}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}
      <div className="md:col-span-4 rounded-2xl border border-[#19B7B0]/20 bg-[#DFF5F2] p-4 text-xs"><strong>Hold point breached:</strong> ITP-002 reinforcement placement requires engineer sign-off before concrete pour. Pour cannot proceed until released.</div></div>}

    {tab === 'items' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['ID','Inspection Item','Trade','Criteria','Status','Signed',''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{checkpoints.map(c => <tr key={c.id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-mono font-bold">{c.id}</td><td className="px-4 py-3 font-semibold">{c.item}</td><td className="px-4 py-3">{c.trade}</td><td className="px-4 py-3 text-[#657287]">{c.criteria}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${c.status === 'Pass' ? 'bg-green-100 text-green-700' : c.status === 'Fail' ? 'bg-red-100 text-red-700' : c.status === 'Hold Point' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span></td><td className="px-4 py-3 text-[#657287]">{c.signedBy ? `${c.signedBy} · ${c.when}` : '—'}</td><td className="px-4 py-3"><select disabled={!canSign} value={c.status} onChange={e => setStatus(c.id, e.target.value as Checkpoint['status'])} className="rounded-lg border bg-white p-1.5 text-[10px] disabled:opacity-40"><option>Pass</option><option>Fail</option><option>Hold Point</option><option>Pending</option></select></td></tr>)}</tbody></table></div>}

    {tab === 'hold_points' && <div className="space-y-3">{checkpoints.filter(c => c.status === 'Hold Point' || c.status === 'Fail').map(c => <div key={c.id} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#167E79]">{c.id}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${c.status === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{c.status}</span></div><p className="mt-2 text-sm font-bold">{c.item}</p><p className="mt-1 text-xs text-[#657287]">{c.criteria}</p><div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800"><strong>Release condition:</strong> {c.status === 'Hold Point' ? 'Engineer inspection and written release required before next activity.' : 'Rectification + re-inspection required. NCR linkage recommended.'}</div></div>)}</div>}

    {tab === 'materials' && <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Material','Standard','Tests Required','Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{materials.map(m => <tr key={m.id} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-semibold">{m.material}</td><td className="px-4 py-3 font-mono text-[#167E79]">{m.standard}</td><td className="px-4 py-3">{m.tests.join(', ')}</td><td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">{m.status}</span></td></tr>)}</tbody></table></div>}

    {tab === 'lab_results' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Lab Results</h2>{[['Cube 7-day','31.2 MPa vs 20.0 MPa required','Passed'],['Cement fineness','3,420 cm²/g','Passed'],['Steel tensile Y12','584 MPa','Awaiting']].map(([test,result,status]) => <div key={test} className="flex items-center gap-3 rounded-xl border p-4"><div className="flex-1"><div className="text-xs font-bold">{test}</div><div className="text-[10px] text-[#657287]">{result}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{status}</span></div>)}</div>}

    {tab === 'ncr_link' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">NCR Linkage</h2><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900"><strong>NCR-007</strong> — Masonry walling out of plumb on block 2 (ITP-004). <span className="font-bold">Linked to rectification hold.</span></div><p className="text-xs text-[#657287]">Non-conformance reports link back to the failed ITP checkpoint and block release until rectified.</p></div>}
  </section>;
}
