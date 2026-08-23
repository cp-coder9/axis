'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS, ROLE_PROFILES, STAGES } from '@/lib/data';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';

interface PracticeModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  isProjectMode?: boolean;
  onNavigateTool?: (toolId: string) => void;
  onTabChange?: (key: string) => void;
}

const TABS = (ALL_TOOLS['practice'] as ToolDefinition).tabs;

interface ActionTask {
  id: string;
  title: string;
  stage: string;
  col: 'Backlog' | 'In Progress' | 'Review' | 'Done';
  assignee: string;
  role: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Normal';
  moduleTarget: string;
}

type DrillDownModalType = 'health' | 'actions' | 'safety' | 'specforge_bom' | 'municipal' | 'energy' | null;

interface TradeSpecItem {
  trade: string;
  standard: string;
  status: 'Approved' | 'Review' | 'Draft';
  clauses: number;
  approvedClauses: number;
  pricedValue: string;
  variance: string;
  specForgeTarget: string;
}

export const PracticeModule: React.FC<PracticeModuleProps> = ({
  activeProject,
  currentRole,
  activeTabKey,
  isProjectMode,
  onNavigateTool,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useControlledToolTab(
    activeTabKey,
    TABS,
    TABS[0]?.key || 'dashboard',
    onTabChange,
  );
  const [drillDownModal, setDrillDownModal] = useState<DrillDownModalType>(null);
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState<'all' | 'statutory' | 'commercial' | 'safety'>('all');

  const [tasks, setTasks] = useState<ActionTask[]>([
    {
      id: 'TSK-101',
      title: 'Complete SANS 10400-XA prescriptive calculations for Council pack',
      stage: 'Design',
      col: 'Review',
      assignee: 'JK',
      role: 'Architect',
      dueDate: '22 Aug 2026',
      daysRemaining: 2,
      priority: 'Critical',
      moduleTarget: 'xa',
    },
    {
      id: 'TSK-102',
      title: 'Compile Municipal Submission Pack drawings A-200 to A-210',
      stage: 'Design',
      col: 'In Progress',
      assignee: 'SV',
      role: 'Architect',
      dueDate: '25 Aug 2026',
      daysRemaining: 5,
      priority: 'High',
      moduleTarget: 'municipal',
    },
    {
      id: 'TSK-103',
      title: 'Resolve Fire Escape corridor width mark-up on Plan A-204 (SANS 10400-T)',
      stage: 'Design',
      col: 'In Progress',
      assignee: 'NM',
      role: 'Fire Eng',
      dueDate: '27 Aug 2026',
      daysRemaining: 7,
      priority: 'Critical',
      moduleTarget: 'forms',
    },
    {
      id: 'TSK-104',
      title: 'Finalize unpriced Bill of Quantities trade package for tender distribution',
      stage: 'Documentation',
      col: 'Backlog',
      assignee: 'DP',
      role: 'QS',
      dueDate: '30 Aug 2026',
      daysRemaining: 10,
      priority: 'High',
      moduleTarget: 'bom',
    },
    {
      id: 'TSK-105',
      title: 'Heritage Section 38 statutory clearance & SPLUMA zoning check',
      stage: 'Design',
      col: 'Done',
      assignee: 'LS',
      role: 'Town Planner',
      dueDate: '18 Aug 2026',
      daysRemaining: 0,
      priority: 'Medium',
      moduleTarget: 'planning',
    },
    {
      id: 'TSK-106',
      title: 'Audit OHS Safety File and verify subcontractor Fall Protection Plan (CR 10)',
      stage: 'Design',
      col: 'In Progress',
      assignee: 'TC',
      role: 'Safety Officer',
      dueDate: '28 Aug 2026',
      daysRemaining: 8,
      priority: 'High',
      moduleTarget: 'safety',
    },
  ]);

  const [tradeSpecs, setTradeSpecs] = useState<TradeSpecItem[]>([
    {
      trade: 'Earthworks & Excavation',
      standard: 'SANS 1200 D / SANS 2001-BE1',
      status: 'Approved',
      clauses: 8,
      approvedClauses: 8,
      pricedValue: 'R 345,000',
      variance: '-0.5%',
      specForgeTarget: 'specforge',
    },
    {
      trade: 'Concrete, Formwork & Reinforcement',
      standard: 'SANS 2001-CC1 / SANS 10100-2',
      status: 'Approved',
      clauses: 14,
      approvedClauses: 13,
      pricedValue: 'R 1,480,000',
      variance: '+1.2%',
      specForgeTarget: 'specforge',
    },
    {
      trade: 'Masonry & Wall Cladding',
      standard: 'SANS 2001-CM1 / SANS 10021',
      status: 'Approved',
      clauses: 10,
      approvedClauses: 9,
      pricedValue: 'R 920,000',
      variance: '-1.8%',
      specForgeTarget: 'specforge',
    },
    {
      trade: 'Waterproofing & Damp-Proofing',
      standard: 'SANS 10400-L / SANS 10021',
      status: 'Review',
      clauses: 6,
      approvedClauses: 5,
      pricedValue: 'R 210,000',
      variance: '0.0%',
      specForgeTarget: 'specforge',
    },
    {
      trade: 'Glazing & Fenestration (XA Prescriptive)',
      standard: 'SANS 10400-XA / SANS 204',
      status: 'Approved',
      clauses: 12,
      approvedClauses: 11,
      pricedValue: 'R 780,000',
      variance: '-2.4%',
      specForgeTarget: 'specforge',
    },
    {
      trade: 'Structural Steelwork & Roof Framing',
      standard: 'SANS 2001-CS1 / SANS 10162',
      status: 'Draft',
      clauses: 9,
      approvedClauses: 6,
      pricedValue: 'R 645,000',
      variance: '+3.1%',
      specForgeTarget: 'specforge',
    },
  ]);

  const [filterRole, setFilterRole] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);

  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const moveTask = (taskId: string, targetCol: ActionTask['col']) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, col: targetCol } : t)));
    showToast(`Task ${taskId} moved to ${targetCol}`);
  };

  const handleDrillDown = (moduleKey: string, moduleName: string) => {
    if (onNavigateTool) {
      onNavigateTool(moduleKey);
      showToast(`Navigating to ${moduleName}...`);
    } else {
      showToast(`Opening ${moduleName}`);
    }
  };

  const filteredTasks = filterRole === 'All' ? tasks : tasks.filter((t) => t.role === filterRole);
  const urgentTasks = [...tasks].sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="space-y-4">
      {/* Module Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#19B7B0]/10 border border-[#19B7B0]/30 flex items-center justify-center text-[#167E79]">
            <OrigamiIcon name="practice_management" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#102033] tracking-tight">Practice & Project Command Centre</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#DFF5F2] text-[#167E79] text-xs font-bold">
                Live Operations & KPI Dashboard
              </span>
            </div>
            <p className="text-[13px] text-[#657287]">
              Multi-discipline project command, executive KPI tracking, deadline monitors, OHS safety audits, and interactive sub-module drill-downs.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white p-1 rounded-2xl border border-[#102033]/15 shadow-sm overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              aria-pressed={activeTab === t.key}
              onClick={() => setActiveTab(t.key || '')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === t.key ? 'bg-[#19B7B0] text-white shadow-sm' : 'text-[#657287] hover:text-[#102033]'
              }`}
            >
              <OrigamiIcon name={t.icon as any} size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* TAB 1: EXECUTIVE KPI DASHBOARD (FLAGSHIP DRILL-DOWN CAPABLE PROGRESS TRACKING) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4" data-tool-tab="dashboard">
          {/* Dashboard Sub-Filter / Quick Nav Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-[#102033]/10 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#102033] flex items-center gap-1.5">
                <OrigamiIcon name="projects" size={14} />
                KPI Categories:
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: 'All Indicators' },
                  { id: 'statutory', label: 'Statutory & Municipal' },
                  { id: 'commercial', label: 'SpecForge & Commercial' },
                  { id: 'safety', label: 'Safety & Quality' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedDisciplineFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all text-xs ${
                      selectedDisciplineFilter === f.id
                        ? 'bg-[#102033] text-white'
                        : 'bg-gray-100 text-[#657287] hover:text-[#102033]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#657287]">Quick Launch:</span>
              <button
                onClick={() => handleDrillDown('specforge', 'SpecForge Builder')}
                className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center gap-1"
              >
                <OrigamiIcon name="origami" size={12} />
                SpecForge
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl font-bold hover:bg-teal-100 transition-all flex items-center gap-1"
              >
                <OrigamiIcon name="inbox" size={12} />
                Action Centre
              </button>
              <button
                onClick={() => handleDrillDown('bom', 'BoM Takeoff Engine')}
                className="px-2.5 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-xl font-bold hover:bg-cyan-100 transition-all flex items-center gap-1"
              >
                <OrigamiIcon name="practice_management" size={12} />
                BoM Takeoff
              </button>
            </div>
          </div>

          {/* Top Grid: Interactive KPI Cards with Detailed Drill-Down Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Overall Project Health & Stage Progress */}
            <div
              onClick={() => setDrillDownModal('health')}
              className="bg-white border border-[#102033]/10 hover:border-[#19B7B0] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#657287]">
                      Overall Project Health
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-[#102033]">92</span>
                    <span className="text-xs font-bold text-[#167E79]">/ 100 · Optimal</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#DFF5F2] group-hover:bg-[#19B7B0] group-hover:text-white transition-all flex items-center justify-center text-[#167E79] font-bold text-xs">
                  +2.4%
                </div>
              </div>

              {/* Mini Health Meter Bars */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between text-[#657287]">
                  <span>Schedule Adherence</span>
                  <span className="font-bold text-[#102033]">94%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#19B7B0] h-full rounded-full" style={{ width: '94%' }} />
                </div>

                <div className="flex justify-between text-[#657287] pt-0.5">
                  <span>Statutory & SANS Clearance</span>
                  <span className="font-bold text-[#102033]">88%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="pt-2 border-t border-[#102033]/10 flex justify-between items-center text-[11px]">
                <span className="text-[#657287]">Stage: {activeProject.stage}</span>
                <span className="font-bold text-[#167E79] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Drill Down Details →
                </span>
              </div>
            </div>

            {/* KPI 2: Action Centre Critical Deadlines */}
            <div
              onClick={() => setDrillDownModal('actions')}
              className="bg-white border border-[#102033]/10 hover:border-amber-400 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#657287]">
                      Action Centre Deadlines
                    </span>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                      Live Kanban
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-[#102033]">4</span>
                    <span className="text-xs font-bold text-amber-600">Pending Review</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 group-hover:bg-amber-500 group-hover:text-white transition-all flex items-center justify-center text-amber-600 font-bold text-xs">
                  2d Max
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 bg-red-50/70 border border-red-200 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-red-800 truncate">SANS 10400-XA Calc</span>
                  <span className="text-[10px] font-mono font-bold text-red-700 bg-white px-1.5 py-0.5 rounded">
                    Due 2d
                  </span>
                </div>
                <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-amber-900 truncate">Municipal Pack A-200</span>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-white px-1.5 py-0.5 rounded">
                    Due 5d
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#102033]/10 flex justify-between items-center text-[11px]">
                <span className="text-[#657287]">Total: {tasks.length} tasks</span>
                <span className="font-bold text-amber-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Inspect Action Centre →
                </span>
              </div>
            </div>

            {/* KPI 3: Safety & OHS Compliance Status */}
            <div
              onClick={() => setDrillDownModal('safety')}
              className="bg-white border border-[#102033]/10 hover:border-green-500 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#657287]">
                      Safety & OHS Compliance
                    </span>
                    <span className="px-1.5 py-0.2 bg-green-100 text-green-800 text-[9px] font-bold rounded">
                      OHS Act 85
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-green-700">100%</span>
                    <span className="text-xs font-bold text-green-700">Zero-Harm</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-green-50 border border-green-200 group-hover:bg-green-600 group-hover:text-white transition-all flex items-center justify-center text-green-700 font-bold text-xs">
                  LTIFR 0.0
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#526074]">
                <div className="flex justify-between">
                  <span>CR 7 Safety File Readiness</span>
                  <span className="font-bold text-[#102033]">94% (Compliant)</span>
                </div>
                <div className="flex justify-between">
                  <span>Zero-Incident Days</span>
                  <span className="font-mono font-bold text-green-700">142 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Work Permits</span>
                  <span className="font-bold text-[#102033]">2 Permits</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#102033]/10 flex justify-between items-center text-[11px]">
                <span className="text-[#657287]">CR 2014 Framework</span>
                <span className="font-bold text-green-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Audit Safety File →
                </span>
              </div>
            </div>

            {/* KPI 4: SpecForge & BoM Approval Rates */}
            <div
              onClick={() => setDrillDownModal('specforge_bom')}
              className="bg-white border border-[#102033]/10 hover:border-indigo-500 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#657287]">
                      SpecForge & BoM Approval
                    </span>
                    <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded">
                      SANS 2001
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-[#102033]">88%</span>
                    <span className="text-xs font-bold text-[#167E79]">47/52 Trades</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center text-indigo-700 font-bold text-xs">
                  -1.2% Var
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#526074]">
                <div className="flex justify-between">
                  <span>Priced Bill of Quantities</span>
                  <span className="font-mono font-bold text-[#102033]">R 4,892,500</span>
                </div>
                <div className="flex justify-between">
                  <span>SpecForge Trade Preambles</span>
                  <span className="font-bold text-indigo-700">92% Signed (24/26)</span>
                </div>
                <div className="flex justify-between">
                  <span>Model Specifications</span>
                  <span className="font-bold text-[#102033]">6 Trade Packages</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#102033]/10 flex justify-between items-center text-[11px]">
                <span className="text-[#657287]">SACQSP Standard</span>
                <span className="font-bold text-indigo-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Drill Down SpecForge →
                </span>
              </div>
            </div>
          </div>

          {/* Middle Row: Interactive SpecForge Preview & Action Centre Triage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: SpecForge Trade Package Breakdown & Direct Sub-Module Drill-Down (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#102033]/10">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                      <OrigamiIcon name="origami" size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-[#102033]">SpecForge & BoM Trade Breakdown</h3>
                  </div>
                  <p className="text-[11px] text-[#657287] mt-0.5">
                    Model trade preambles, SANS deemed-to-satisfy clauses, and priced SACQSP Bill of Quantities integration.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDrillDown('specforge', 'SpecForge Builder')}
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <OrigamiIcon name="origami" size={13} />
                    Open SpecForge
                  </button>
                  <button
                    onClick={() => handleDrillDown('bom', 'BoM Takeoff Engine')}
                    className="text-xs font-bold text-[#167E79] bg-[#DFF5F2] hover:bg-[#c9efea] px-3 py-1.5 rounded-xl transition-all"
                  >
                    Open BoM Takeoff
                  </button>
                </div>
              </div>

              {/* Trade Packages Matrix */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {tradeSpecs.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50/80 hover:bg-[#f7f8fc] border border-gray-100 hover:border-indigo-200 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#102033] group-hover:text-indigo-900">
                          {item.trade}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.2 rounded-full border ${
                            item.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'Review'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#657287]">
                        Standard: <span className="font-mono text-[#102033]">{item.standard}</span> · {item.approvedClauses}/{item.clauses} Clauses Deemed
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-[#102033]">{item.pricedValue}</div>
                        <div className="text-[10px] text-[#657287]">Variance: <span className={item.variance.startsWith('-') ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>{item.variance}</span></div>
                      </div>

                      <button
                        onClick={() => handleDrillDown('specforge', `SpecForge Trade: ${item.trade}`)}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 text-indigo-700 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap"
                      >
                        Drill Down →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Action Centre Fast Triage & Sub-Module Drill-Down (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#102033]/10">
                <div>
                  <h3 className="text-sm font-bold text-[#102033]">Action Centre Triage</h3>
                  <p className="text-[11px] text-[#657287]">Imminent statutory hold points & tender gates</p>
                </div>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="text-xs font-bold text-[#167E79] bg-[#DFF5F2] hover:bg-[#c9efea] px-3 py-1.5 rounded-xl transition-all"
                >
                  Full Kanban →
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {urgentTasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-gray-50/70 hover:bg-[#f5faf9] border border-gray-100 hover:border-[#19B7B0]/40 rounded-2xl transition-all space-y-1.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-white border text-[#167E79] font-mono text-[9.5px] font-bold rounded">
                          {t.id}
                        </span>
                        <span className="text-xs font-bold text-[#102033] line-clamp-1">{t.title}</span>
                      </div>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          t.daysRemaining <= 2
                            ? 'bg-red-100 text-red-700'
                            : t.daysRemaining <= 5
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.daysRemaining === 0 ? 'Due Today' : `${t.daysRemaining}d Left`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px] text-[#657287] pt-1 border-t border-gray-100">
                      <span><strong>{t.role}</strong> ({t.assignee}) · {t.dueDate}</span>
                      <button
                        onClick={() => handleDrillDown(t.moduleTarget, t.title)}
                        className="text-[#167E79] font-bold hover:underline"
                      >
                        Drill Down →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Matrix: Discipline Sub-Module Drill-Down Hub */}
          <section className="bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#102033]">Direct Discipline Sub-Module Navigation</h3>
                <p className="text-[11px] text-[#657287]">1-Click drill-down into statutory calculation engines, specification builders, and audit workflows</p>
              </div>
              <span className="text-xs font-bold text-[#657287] bg-gray-100 px-2.5 py-1 rounded-xl">
                Active Project: {activeProject.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              {[
                {
                  id: 'specforge',
                  title: 'SpecForge Builder',
                  badge: '92% Approved',
                  status: '24/26 Clauses',
                  color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
                  icon: 'origami',
                  desc: 'SANS 2001 Model Preambles & Clauses',
                },
                {
                  id: 'bom',
                  title: 'BoM Takeoff Engine',
                  badge: 'R 4.89M Priced',
                  status: '47/52 Trades',
                  color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
                  icon: 'practice_management',
                  desc: 'SACQSP Standard Quantities',
                },
                {
                  id: 'planning',
                  title: 'Town Planning / SPLUMA',
                  badge: 'Res 1 · FAR 0.60',
                  status: 'Active Clearance',
                  color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  icon: 'planning',
                  desc: 'Zoning & Heritage Section 38',
                },
                {
                  id: 'municipal',
                  title: 'Municipal Submission',
                  badge: '82% Pack Ready',
                  status: '4 Hold Points',
                  color: 'text-amber-700 bg-amber-50 border-amber-200',
                  icon: 'document',
                  desc: 'Council Forms 1-4 & Drawing Index',
                },
                {
                  id: 'xa',
                  title: 'SANS 10400-XA Energy',
                  badge: 'Zone 2 · Rt 3.71',
                  status: 'Prescriptive Pass',
                  color: 'text-teal-700 bg-teal-50 border-teal-200',
                  icon: 'datum',
                  desc: 'Fenestration & Thermal Envelope',
                },
                {
                  id: 'forms',
                  title: 'Statutory Forms 1-4',
                  badge: '5 of 6 Complete',
                  status: 'Form 2 Appointed',
                  color: 'text-purple-700 bg-purple-50 border-purple-200',
                  icon: 'document',
                  desc: 'Competent Person Declarations',
                },
                {
                  id: 'itp',
                  title: 'ITP Quality Assurance',
                  badge: '2 Hold Cleared',
                  status: 'Concrete Sign-Off',
                  color: 'text-blue-700 bg-blue-50 border-blue-200',
                  icon: 'collaboration',
                  desc: 'Inspection Test Plans & Checklists',
                },
                {
                  id: 'safety',
                  title: 'OHS Safety File',
                  badge: '94% Audit Score',
                  status: 'Zero Harm LTIFR',
                  color: 'text-green-700 bg-green-50 border-green-200',
                  icon: 'safety',
                  desc: 'CR 2014 & Subcontractor Audits',
                },
                {
                  id: 'meetings',
                  title: 'Meetings & Minutes Hub',
                  badge: 'Audio Transcript',
                  status: 'Action Item Sync',
                  color: 'text-rose-700 bg-rose-50 border-rose-200',
                  icon: 'meetings',
                  desc: 'Site Meeting Minutes & Decisions',
                },
                {
                  id: 'wingman',
                  title: 'Wingman AI Copilot',
                  badge: 'Doc Summaries',
                  status: 'ISO-19650 Hash',
                  color: 'text-purple-700 bg-purple-50 border-purple-200',
                  icon: 'wingman',
                  desc: 'Multi-Discipline AI Workspace',
                },
              ].map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => handleDrillDown(mod.id, mod.title)}
                  className="p-3.5 bg-white hover:bg-gray-50/80 border border-[#102033]/10 hover:border-[#19B7B0]/50 rounded-2xl text-left transition-all group shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-[#DFF5F2] flex items-center justify-center text-[#102033] group-hover:text-[#167E79] transition-colors">
                        <OrigamiIcon name={mod.icon as any} size={16} />
                      </div>
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${mod.color}`}>
                        {mod.badge}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#102033] group-hover:text-[#167E79] leading-snug">
                      {mod.title}
                    </div>
                    <p className="text-[10.5px] text-[#657287] mt-0.5 line-clamp-1">{mod.desc}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] text-[#657287] pt-2.5 mt-2 border-t border-[#102033]/5">
                    <span className="truncate">{mod.status}</span>
                    <span className="text-[#167E79] font-bold ml-1">Drill Down →</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* DRILL DOWN MODAL / SLIDE-OVER DETAIL INSPECTOR */}
      {drillDownModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white border border-[#102033]/15 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-[#102033]/10">
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#657287]">
                  KPI Deep Drill-Down Inspector
                </span>
                <h2 className="text-xl font-bold text-[#102033]">
                  {drillDownModal === 'health' && 'Overall Project Health & Stage Milestone Audit'}
                  {drillDownModal === 'actions' && 'Action Centre Critical Path & Deadline Triage'}
                  {drillDownModal === 'safety' && 'OHS Construction Regulations 2014 Safety Audit'}
                  {drillDownModal === 'specforge_bom' && 'SpecForge Master Specifications & BoM Takeoff Audit'}
                </h2>
              </div>
              <button
                onClick={() => setDrillDownModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#102033] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Health */}
            {drillDownModal === 'health' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-2xl border">
                    <div className="text-[#657287]">Schedule Progress</div>
                    <div className="text-lg font-bold text-[#102033] mt-0.5">{activeProject.progress}%</div>
                    <div className="text-[10px] text-green-700 font-bold">On Schedule</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl border">
                    <div className="text-[#657287]">SACAP Stage</div>
                    <div className="text-lg font-bold text-[#102033] mt-0.5">Stage 3</div>
                    <div className="text-[10px] text-[#167E79] font-bold">Design Development</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl border">
                    <div className="text-[#657287]">Commercial Burn</div>
                    <div className="text-lg font-bold text-[#102033] mt-0.5">43%</div>
                    <div className="text-[10px] text-[#167E79] font-bold">R 475k Invoiced</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#102033]">Statutory & Milestone Clearance Checklist</h4>
                  <div className="space-y-1.5">
                    {[
                      { item: 'SANS 10400-XA Prescriptive Fenestration Calc (Zone 2)', status: 'Approved (Rt 3.71)', target: 'xa' },
                      { item: 'Municipal Submission Pack Drawings A-200 to A-210', status: 'In Review (82%)', target: 'municipal' },
                      { item: 'Town Planning Zoning & Heritage Section 38 Exemption', status: 'Cleared (FAR 0.60)', target: 'planning' },
                      { item: 'SACAP Form 1 & Form 2 Statutory Appointments', status: 'Signed (5/6)', target: 'forms' },
                    ].map((row, idx) => (
                      <div key={idx} className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                        <span className="font-medium text-[#102033]">{row.item}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#167E79]">{row.status}</span>
                          <button
                            onClick={() => {
                              setDrillDownModal(null);
                              handleDrillDown(row.target, row.item);
                            }}
                            className="px-2 py-0.5 bg-white border text-xs font-bold rounded hover:bg-gray-100"
                          >
                            Open →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDrillDownModal(null);
                      setActiveTab('programme');
                    }}
                    className="px-4 py-2 bg-[#19B7B0] text-white rounded-xl font-bold text-xs"
                  >
                    View Project Gantt Programme →
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - Actions */}
            {drillDownModal === 'actions' && (
              <div className="space-y-4 text-xs">
                <p className="text-[#657287]">
                  Critical discipline hold points requiring immediate intervention before tender pack release:
                </p>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {tasks.map((t) => (
                    <div key={t.id} className="p-3 border rounded-2xl bg-gray-50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#167E79]">{t.id}</span>
                          <span className="font-bold text-[#102033]">{t.title}</span>
                        </div>
                        <div className="text-[11px] text-[#657287]">
                          Assigned: <strong>{t.role} ({t.assignee})</strong> · Due: {t.dueDate} · Status: <span className="font-bold text-[#102033]">{t.col}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setDrillDownModal(null);
                          handleDrillDown(t.moduleTarget, t.title);
                        }}
                        className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl font-bold text-xs whitespace-nowrap"
                      >
                        Drill Down Sub-Module →
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDrillDownModal(null);
                          setActiveTab('actions');
                    }}
                    className="px-4 py-2 bg-[#102033] text-white rounded-xl font-bold text-xs"
                  >
                    Open Action Centre Kanban Board →
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - Safety */}
            {drillDownModal === 'safety' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 rounded-2xl border border-green-200">
                    <div className="text-green-800">LTIFR Metric</div>
                    <div className="text-xl font-bold text-green-900 mt-0.5">0.00</div>
                    <div className="text-[10px] text-green-700 font-bold">Zero Harm Compliant</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-2xl border border-green-200">
                    <div className="text-green-800">Safety File Readiness</div>
                    <div className="text-xl font-bold text-green-900 mt-0.5">94%</div>
                    <div className="text-[10px] text-green-700 font-bold">CR 7 Passed</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-2xl border border-green-200">
                    <div className="text-green-800">Active High-Risk Permits</div>
                    <div className="text-xl font-bold text-green-900 mt-0.5">2 Permits</div>
                    <div className="text-[10px] text-green-700 font-bold">Scaffold & Hot Work</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#102033]">Statutory Health & Safety Audits</h4>
                  <div className="divide-y border rounded-2xl overflow-hidden">
                    {[
                      { audit: 'CR 10 Fall Protection Plan & Working at Heights Protocol', status: 'Compliant · Signed by TC' },
                      { audit: 'CR 25 Hazardous Chemical Substances (HCS) Register', status: 'Compliant · MSDS on File' },
                      { audit: 'CR 8 Principal Contractor Appointment & Section 37(2) Mandate', status: 'Signed & Executed' },
                      { audit: 'Subcontractor Toolbox Talk & Daily Pre-Task Risk Assessment', status: '100% Up to Date' },
                    ].map((a, idx) => (
                      <div key={idx} className="p-3 bg-white flex justify-between items-center text-xs">
                        <span className="font-medium text-[#102033]">{a.audit}</span>
                        <span className="font-bold text-green-700 text-right">{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDrillDownModal(null);
                      handleDrillDown('safety', 'OHS Safety Module');
                    }}
                    className="px-4 py-2 bg-green-700 text-white rounded-xl font-bold text-xs"
                  >
                    Open Full OHS Safety File Sub-Module →
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - SpecForge & BoM */}
            {drillDownModal === 'specforge_bom' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <div className="text-indigo-800">SpecForge Approved</div>
                    <div className="text-xl font-bold text-indigo-950 mt-0.5">92%</div>
                    <div className="text-[10px] text-indigo-700 font-bold">24 of 26 Clauses</div>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200">
                    <div className="text-cyan-800">BoM Priced Items</div>
                    <div className="text-xl font-bold text-cyan-950 mt-0.5">47 / 52</div>
                    <div className="text-[10px] text-cyan-700 font-bold">Trades Measured</div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <div className="text-indigo-800">Priced Total</div>
                    <div className="text-lg font-bold text-indigo-950 mt-0.5">R 4,892,500</div>
                    <div className="text-[10px] text-emerald-700 font-bold">-1.2% Variance</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#102033]">SpecForge Master Specification Preambles (SANS 2001 Standard)</h4>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {tradeSpecs.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="font-bold text-[#102033]">{item.trade}</div>
                          <div className="text-[10.5px] text-[#657287]">Standard: {item.standard} · {item.approvedClauses}/{item.clauses} Clauses</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#102033]">{item.pricedValue}</span>
                          <button
                            onClick={() => {
                              setDrillDownModal(null);
                              handleDrillDown('specforge', `SpecForge Trade: ${item.trade}`);
                            }}
                            className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700"
                          >
                            Drill Down →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDrillDownModal(null);
                      handleDrillDown('bom', 'BoM Takeoff Engine');
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#102033] rounded-xl font-bold text-xs"
                  >
                    Open BoM Takeoff Engine →
                  </button>
                  <button
                    onClick={() => {
                      setDrillDownModal(null);
                      handleDrillDown('specforge', 'SpecForge Builder');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
                  >
                    Open Full SpecForge Builder Sub-Module →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-tool-tab="actions">
          <section className="lg:col-span-2 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#102033]/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#102033]">Action Centre Triage</h2>
                <p className="text-xs text-[#657287]">Prioritised decisions, approvals and statutory hold points requiring intervention.</p>
              </div>
              <button
                onClick={() => showToast('Action owner reminders sent.')}
                className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold"
              >
                Notify Owners
              </button>
            </div>
            <div className="space-y-2">
              {urgentTasks.slice(0, 5).map((task) => (
                <article key={task.id} className="p-3 border border-[#102033]/10 rounded-2xl bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#167E79]">{task.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{task.priority}</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#102033] mt-1">{task.title}</h3>
                    <p className="text-[11px] text-[#657287] mt-0.5">Owner {task.assignee} · {task.role} · due {task.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleDrillDown(task.moduleTarget, task.title)} className="px-2.5 py-1.5 border rounded-xl text-[11px] font-bold text-[#167E79] bg-white">Open Record</button>
                    <button onClick={() => moveTask(task.id, 'Review')} className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white bg-[#102033]">Send to Review</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <aside className="bg-[#102033] text-white rounded-3xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-bold">Today&apos;s Control Queue</h3>
            {[
              ['Critical decisions', '2'],
              ['Due within 5 days', '3'],
              ['Awaiting consultant', '2'],
              ['Ready to close', '1'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center border-b border-white/10 pb-2 text-xs">
                <span className="text-white/70">{label}</span>
                <span className="font-bold text-[#68D8D1]">{value}</span>
              </div>
            ))}
            <button onClick={() => setActiveTab('tasks')} className="w-full px-3 py-2 rounded-xl bg-white text-[#102033] text-xs font-bold">Open Tasks Board</button>
          </aside>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" data-tool-tab="notifications">
          <section className="lg:col-span-8 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#102033]">Operational Notifications</h2>
                <p className="text-xs text-[#657287]">Project events routed by urgency, discipline and required response.</p>
              </div>
              <button onClick={() => showToast('All notifications marked as reviewed.')} className="text-xs font-bold text-[#167E79]">Mark all reviewed</button>
            </div>
            {[
              { time: '08:42', title: 'Council submission pack returned for annotation', detail: 'Municipal reviewer requested a revised fire escape note on A-204.', tone: 'border-red-300 bg-red-50', owner: 'Architect · response today' },
              { time: '09:15', title: 'Fee stage threshold reached', detail: 'Stage 3 delivery is 65% complete while 66% of its fee is invoiced.', tone: 'border-amber-300 bg-amber-50', owner: 'Principal · review commercial position' },
              { time: '10:05', title: 'Concrete ITP witness point accepted', detail: 'Engineer signed the foundation reinforcement inspection record.', tone: 'border-emerald-300 bg-emerald-50', owner: 'Site team · no action' },
              { time: '11:20', title: 'RFI-027 response overdue', detail: 'Window head detail clarification is one business day beyond SLA.', tone: 'border-blue-300 bg-blue-50', owner: 'Technologist · escalate' },
            ].map((item) => (
              <article key={item.time} className={`border-l-4 rounded-2xl p-3 ${item.tone}`}>
                <div className="flex justify-between gap-3"><h3 className="text-xs font-bold text-[#102033]">{item.title}</h3><span className="font-mono text-[10px] text-[#657287]">{item.time}</span></div>
                <p className="text-[11px] text-[#526074] mt-1">{item.detail}</p>
                <p className="text-[10px] font-bold text-[#167E79] mt-2">{item.owner}</p>
              </article>
            ))}
          </section>
          <aside className="lg:col-span-4 bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-[#102033] mb-3">Routing Health</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-[#657287]">Unread</span><strong>4</strong></div>
              <div className="flex justify-between"><span className="text-[#657287]">Requires response</span><strong className="text-red-700">3</strong></div>
              <div className="flex justify-between"><span className="text-[#657287]">Acknowledged today</span><strong className="text-emerald-700">12</strong></div>
              <div className="pt-3 border-t"><span className="text-[#657287]">Median acknowledgement</span><div className="text-xl font-black text-[#102033] mt-1">18 min</div></div>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: PROGRAMME & GANTT */}
      {activeTab === 'programme' && (
        <div className="space-y-4" data-tool-tab="programme">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Overall Progress', value: `${activeProject.progress}%`, sub: 'On Schedule' },
              { label: 'Active Stage', value: activeProject.stage, sub: 'Stage 3 of 8' },
              { label: 'Next Critical Milestone', value: '14 Aug 2026', sub: 'Council Submission' },
              { label: 'Open Blockers', value: '2 Hold Points', sub: 'Fire & Heritage' },
            ].map((m, idx) => (
              <div key={idx} className="p-3.5 bg-white border border-[#102033]/10 rounded-2xl shadow-sm">
                <div className="text-[11px] font-bold text-[#657287] uppercase">{m.label}</div>
                <div className="text-xl font-extrabold text-[#102033] mt-0.5">{m.value}</div>
                <div className="text-[11px] text-[#167E79] font-medium mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Interactive Gantt Timeline */}
          <section className="bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#102033]/10">
              <h3 className="text-sm font-bold text-[#102033]">Project Stages Timeline & Critical Path</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#19B7B0] rounded-sm" /> Completed</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded-sm" /> In Progress</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded-sm" /> Upcoming</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {STAGES.map((st, idx) => {
                const isCurrent = st === activeProject.stage;
                const stageIdx = STAGES.indexOf(activeProject.stage);
                const isDone = idx < stageIdx;
                const widthPercent = isDone ? 100 : isCurrent ? 65 : 0;

                return (
                  <div key={st} className="flex items-center gap-3 text-xs">
                    <div className="w-32 font-bold text-[#102033] truncate">
                      {idx + 1}. {st}
                    </div>
                    <div className="flex-1 bg-gray-100 h-6 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full transition-all rounded-lg ${
                          isDone ? 'bg-[#19B7B0]' : isCurrent ? 'bg-amber-400 animate-pulse' : 'bg-transparent'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      />
                      <span className="absolute left-3 top-1 text-[10.5px] font-bold text-[#102033]">
                        {isDone ? 'Completed' : isCurrent ? 'Active Stage (65%)' : 'Scheduled'}
                      </span>
                    </div>
                    <div className="w-24 text-right text-[11px] text-[#657287]">
                      {isDone ? '100%' : isCurrent ? '65%' : '0%'}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-4" data-tool-tab="milestones">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Completed gates', '7', '58% of baseline'],
              ['Next gate', '25 Aug', 'Council pack issue'],
              ['At risk', '2', 'Fire and heritage'],
              ['Forecast finish', '18 Dec', '3 days ahead'],
            ].map(([label, value, detail]) => (
              <div key={label} className="bg-white border rounded-2xl p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#657287]">{label}</div>
                <div className="text-xl font-black text-[#102033] mt-1">{value}</div>
                <div className="text-[11px] text-[#167E79] mt-1">{detail}</div>
              </div>
            ))}
          </div>
          <section className="bg-white border rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div><h2 className="text-base font-bold text-[#102033]">Stage Gate Register</h2><p className="text-xs text-[#657287]">Evidence-led delivery gates with accountable owners and forecast dates.</p></div>
              <button onClick={() => showToast('Milestone baseline saved.')} className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold">Save Baseline</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-[#657287] border-b"><tr><th className="py-2">Milestone</th><th>Owner</th><th>Baseline</th><th>Forecast</th><th>Evidence</th><th>Status</th></tr></thead>
                <tbody className="divide-y">
                  {[
                    ['Design freeze', 'JK', '18 Aug', '18 Aug', 'Drawing issue P03', 'Complete'],
                    ['Council submission', 'SV', '25 Aug', '27 Aug', '4 documents outstanding', 'At risk'],
                    ['Tender package', 'DP', '30 Sep', '30 Sep', '47/52 trades priced', 'On track'],
                    ['Site handover', 'TC', '12 Oct', '10 Oct', 'Safety file 94%', 'On track'],
                  ].map((row) => <tr key={row[0]}><td className="py-3 font-bold text-[#102033]">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><span className={`px-2 py-1 rounded-full font-bold ${row[5] === 'At risk' ? 'bg-amber-100 text-amber-700' : row[5] === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{row[5]}</span></td></tr>)}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" data-tool-tab="calendar">
          <section className="lg:col-span-3 bg-white border rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4"><div><h2 className="text-base font-bold text-[#102033]">Delivery Calendar</h2><p className="text-xs text-[#657287]">Week of 24-28 August 2026 · project, statutory and resource commitments.</p></div><button onClick={() => showToast('Calendar event draft created.')} className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold">+ New Event</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {[
                { day: 'Mon 24', items: [['09:00', 'Design coordination'], ['14:00', 'XA review']] },
                { day: 'Tue 25', items: [['10:00', 'Council pack gate'], ['15:30', 'Client sign-off']] },
                { day: 'Wed 26', items: [['08:30', 'Site inspection'], ['13:00', 'QS cost review']] },
                { day: 'Thu 27', items: [['11:00', 'Fire engineer workshop']] },
                { day: 'Fri 28', items: [['09:00', 'Resource planning'], ['12:00', 'Weekly close-out']] },
              ].map((day) => (
                <div key={day.day} className="border rounded-2xl p-2.5 min-h-48 bg-gray-50/60">
                  <h3 className="text-xs font-bold text-[#102033] border-b pb-2">{day.day}</h3>
                  <div className="space-y-2 mt-2">{day.items.map(([time, title]) => <div key={time} className="bg-white border-l-4 border-[#19B7B0] rounded-lg p-2"><div className="font-mono text-[9px] text-[#657287]">{time}</div><div className="text-[11px] font-bold text-[#102033] mt-0.5">{title}</div></div>)}</div>
                </div>
              ))}
            </div>
          </section>
          <aside className="bg-[#102033] text-white rounded-3xl p-5 h-fit">
            <h3 className="text-sm font-bold">Capacity Conflicts</h3>
            <div className="mt-3 space-y-3 text-xs"><div className="p-3 bg-white/10 rounded-xl"><strong>SV · Tuesday</strong><p className="text-white/70 mt-1">Council gate overlaps client sign-off preparation.</p></div><div className="p-3 bg-white/10 rounded-xl"><strong>JK · Wednesday</strong><p className="text-white/70 mt-1">Site inspection leaves 2h travel buffer.</p></div></div>
          </aside>
        </div>
      )}

      {/* TAB 3: ACTION CENTRE (KANBAN) */}
      {activeTab === 'tasks' && (
        <div className="space-y-3" data-tool-tab="tasks">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white p-3 border rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#657287]">Filter by Discipline:</span>
              {['All', 'Architect', 'Fire Eng', 'QS', 'Town Planner', 'Safety Officer'].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    filterRole === r ? 'bg-[#19B7B0] text-white' : 'bg-gray-100 text-[#657287]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => showToast('New task draft created in Backlog.')}
              className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              + Add Action Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 min-h-[480px]">
            {(['Backlog', 'In Progress', 'Review', 'Done'] as const).map((colName) => {
              const colTasks = filteredTasks.filter((t) => t.col === colName);
              return (
                <div key={colName} className="bg-white border rounded-2xl p-3 flex flex-col space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-bold text-xs text-[#102033]">{colName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#657287] font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {colTasks.map((t) => (
                      <div key={t.id} className="p-3 border rounded-xl bg-gray-50 space-y-1.5 text-xs shadow-xs">
                        <div className="flex justify-between text-[10.5px]">
                          <span className="font-bold text-[#167E79]">{t.id}</span>
                          <span className="font-semibold text-[#657287]">{t.role}</span>
                        </div>
                        <div className="font-bold text-[#102033] leading-snug">{t.title}</div>
                        <div className="text-[10.5px] text-[#657287] flex justify-between">
                          <span>Due: {t.dueDate}</span>
                          <span className="font-mono text-amber-600 font-bold">{t.daysRemaining}d</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t text-[10px]">
                          <span className="w-5 h-5 rounded-full bg-[#102033] text-white flex items-center justify-center font-bold">
                            {t.assignee}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDrillDown(t.moduleTarget, t.title)}
                              className="text-[#167E79] font-bold hover:underline"
                            >
                              Drill Down →
                            </button>
                            <select
                              value={t.col}
                              onChange={(e) => moveTask(t.id, e.target.value as any)}
                              className="bg-white border rounded px-1 py-0.5 text-[10px] font-semibold text-[#102033]"
                            >
                              <option value="Backlog">Backlog</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">Review</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: FEES & COMMERCIAL */}
      {activeTab === 'fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-tool-tab="fees">
          <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#102033]">SACAP / SACQSP Fee Scales & Invoices</h3>
            <div className="divide-y text-xs">
              {[
                { stage: 'Stage 1: Inception', fee: 'R 85,000', invoiced: 'R 85,000', status: 'Paid', date: '10 Feb 2026' },
                { stage: 'Stage 2: Concept & Viability', fee: 'R 180,000', invoiced: 'R 180,000', status: 'Paid', date: '15 Apr 2026' },
                { stage: 'Stage 3: Design Development', fee: 'R 320,000', invoiced: 'R 210,000', status: 'Partially Invoiced', date: 'Current' },
                { stage: 'Stage 4: Documentation & Tender', fee: 'R 280,000', invoiced: 'R 0', status: 'Upcoming', date: 'Pending Stage 4' },
                { stage: 'Stage 5: Construction Contract Admin', fee: 'R 240,000', invoiced: 'R 0', status: 'Upcoming', date: 'Pending Stage 5' },
              ].map((row, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#102033]">{row.stage}</div>
                    <div className="text-[#657287]">Total Agreed Fee: {row.fee}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#102033]">Invoiced: {row.invoiced}</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        row.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-white border rounded-2xl p-4 shadow-sm space-y-3 h-fit text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[#96a0ad]">Commercial Snapshot</h4>
            <div className="space-y-2 text-[#526074]">
              <div><strong>Agreed Professional Fee:</strong> R 1,105,000</div>
              <div><strong>Billed to Date:</strong> R 475,000 (43%)</div>
              <div><strong>Disbursements Recovered:</strong> R 24,500</div>
              <div><strong>Cost to Complete:</strong> R 630,000</div>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 5: TEAM & UTILIZATION */}
      {activeTab === 'team' && (
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4" data-tool-tab="team">
          <h3 className="text-sm font-bold text-[#102033]">Multi-Discipline Project Team & Resource Load</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Justin Kruger', role: 'Principal Architect', hours: '32h / wk', load: '85%', color: 'bg-[#19B7B0]' },
              { name: 'Sarah van der Merwe', role: 'Senior Architectural Technologist', hours: '40h / wk', load: '95%', color: 'bg-amber-500' },
              { name: 'N. Mokoena', role: 'Consulting Fire Engineer', hours: '12h / wk', load: '60%', color: 'bg-[#19B7B0]' },
              { name: 'David Pieterse', role: 'Lead Quantity Surveyor', hours: '18h / wk', load: '75%', color: 'bg-[#19B7B0]' },
              { name: 'Lerato Sithole', role: 'Town Planning Consultant', hours: '8h / wk', load: '40%', color: 'bg-[#19B7B0]' },
            ].map((tm, idx) => (
              <div key={idx} className="p-3.5 border rounded-xl bg-gray-50 space-y-2 text-xs">
                <div className="font-bold text-[#102033] text-sm">{tm.name}</div>
                <div className="text-[#657287]">{tm.role}</div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span>Allocated: {tm.hours}</span>
                  <span className="font-bold text-[#167E79]">Load: {tm.load}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'site_diary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-tool-tab="site_diary">
          <section className="lg:col-span-2 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center"><div><h2 className="text-base font-bold text-[#102033]">Daily Site Record · 23 August 2026</h2><p className="text-xs text-[#657287]">Verified construction activity, labour, weather and instructions.</p></div><button onClick={() => showToast('Site diary entry opened for editing.')} className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold">Add Entry</button></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{[['Weather', 'Clear · 21°C'], ['Labour', '34 on site'], ['Deliveries', '3 received'], ['Visitors', '2 signed in']].map(([label, value]) => <div key={label} className="p-3 bg-gray-50 border rounded-xl"><div className="text-[10px] uppercase font-bold text-[#657287]">{label}</div><div className="text-sm font-bold text-[#102033] mt-1">{value}</div></div>)}</div>
            <div className="space-y-2">
              {[
                ['07:15', 'Pre-start and toolbox talk', 'Fall protection controls reviewed before roof truss work.'],
                ['10:40', 'Foundation inspection', 'Engineer accepted reinforcement to grid C4; photo set SD-184 attached.'],
                ['14:20', 'Material delivery', '12 pallets face brick received; 2 pallets quarantined for colour variance.'],
              ].map(([time, title, detail]) => <article key={time} className="flex gap-3 p-3 border rounded-2xl"><span className="font-mono text-[10px] font-bold text-[#167E79]">{time}</span><div><h3 className="text-xs font-bold text-[#102033]">{title}</h3><p className="text-[11px] text-[#657287] mt-1">{detail}</p></div></article>)}
            </div>
          </section>
          <aside className="bg-white border rounded-3xl p-5 shadow-sm h-fit space-y-3"><h3 className="text-sm font-bold text-[#102033]">Record Completeness</h3><div className="text-3xl font-black text-[#167E79]">92%</div>{['Attendance signed', 'Weather recorded', '3 photos geotagged', 'Contractor countersign pending'].map((item, index) => <div key={item} className="text-xs flex gap-2"><span className={index === 3 ? 'text-amber-600' : 'text-emerald-600'}>{index === 3 ? '!' : '✓'}</span>{item}</div>)}</aside>
        </div>
      )}

      {activeTab === 'rfis' && (
        <div className="bg-white border rounded-3xl p-5 shadow-sm space-y-4" data-tool-tab="rfis">
          <div className="flex justify-between items-center"><div><h2 className="text-base font-bold text-[#102033]">RFI & Site Instruction Register</h2><p className="text-xs text-[#657287]">Controlled technical queries, contractual responses and issued directions.</p></div><button onClick={() => showToast('New RFI draft created.')} className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold">+ Draft RFI</button></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[['Open RFIs', '6'], ['Overdue', '1'], ['Avg response', '2.4d'], ['Instructions issued', '14']].map(([label, value]) => <div key={label} className="p-3 border rounded-xl bg-gray-50"><div className="text-[10px] uppercase font-bold text-[#657287]">{label}</div><div className="text-xl font-black text-[#102033] mt-1">{value}</div></div>)}</div>
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-left text-[#657287] border-b"><tr><th className="py-2">Reference</th><th>Subject</th><th>Raised by</th><th>Due</th><th>Impact</th><th>Status</th></tr></thead><tbody className="divide-y">{[
            ['RFI-027', 'Window head waterproofing detail', 'Main contractor', '22 Aug', 'Programme · 1 day', 'Overdue'],
            ['RFI-029', 'Fire door ironmongery schedule', 'Joinery subcontractor', '26 Aug', 'Procurement', 'Open'],
            ['SI-014', 'Revise stormwater channel fall', 'Architect', 'Issued 21 Aug', 'R 18,500 estimate', 'Acknowledged'],
            ['RFI-030', 'Brick blend sample acceptance', 'Main contractor', '28 Aug', 'Quality hold', 'Under review'],
          ].map((row) => <tr key={row[0]}><td className="py-3 font-mono font-bold text-[#167E79]">{row[0]}</td><td className="font-bold text-[#102033]">{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><span className={`px-2 py-1 rounded-full font-bold ${row[5] === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{row[5]}</span></td></tr>)}</tbody></table></div>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" data-tool-tab="risks">
          <section className="lg:col-span-8 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <div><h2 className="text-base font-bold text-[#102033]">Issues & Risk Register</h2><p className="text-xs text-[#657287]">Live exposure assessment with mitigations, owners and residual ratings.</p></div>
            {[
              { id: 'RSK-018', title: 'Municipal fire review may delay submission', owner: 'NM', score: '16 High', mitigation: 'Close corridor mark-up before reviewer workshop', color: 'bg-red-100 text-red-700' },
              { id: 'RSK-021', title: 'Face brick colour batch variance', owner: 'SV', score: '9 Medium', mitigation: 'Quarantine stock and approve benchmark panel', color: 'bg-amber-100 text-amber-700' },
              { id: 'ISS-009', title: 'Consultant appointment annexure unsigned', owner: 'JK', score: '6 Medium', mitigation: 'Principal to execute revised appointment', color: 'bg-amber-100 text-amber-700' },
            ].map((risk) => <article key={risk.id} className="p-3 border rounded-2xl"><div className="flex justify-between gap-2"><div><span className="font-mono text-[10px] font-bold text-[#167E79]">{risk.id}</span><h3 className="text-xs font-bold text-[#102033] mt-1">{risk.title}</h3></div><span className={`h-fit px-2 py-1 rounded-full text-[10px] font-bold ${risk.color}`}>{risk.score}</span></div><div className="mt-2 pt-2 border-t text-[11px] text-[#657287] flex justify-between gap-3"><span>Mitigation: {risk.mitigation}</span><strong className="text-[#102033]">Owner {risk.owner}</strong></div></article>)}
          </section>
          <aside className="lg:col-span-4 bg-[#102033] text-white rounded-3xl p-5 h-fit"><h3 className="text-sm font-bold">Portfolio Exposure</h3><div className="grid grid-cols-2 gap-2 mt-4">{[['High', '1'], ['Medium', '4'], ['Low', '7'], ['Closed', '12']].map(([label, value]) => <div key={label} className="bg-white/10 rounded-xl p-3"><div className="text-[10px] text-white/60 uppercase">{label}</div><div className="text-xl font-black text-[#68D8D1]">{value}</div></div>)}</div><p className="text-xs text-white/70 mt-4">Total quantified exposure: <strong className="text-white">R 186,500</strong></p></aside>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="space-y-4" data-tool-tab="quality">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[['Open snags', '18', '5 closed this week'], ['NCRs', '2', 'Both contained'], ['ITP pass rate', '96%', '48 inspections'], ['Avg close-out', '3.2d', 'Target under 5d']].map(([label, value, detail]) => <div key={label} className="bg-white border rounded-2xl p-4 shadow-sm"><div className="text-[10px] uppercase font-bold text-[#657287]">{label}</div><div className="text-xl font-black text-[#102033] mt-1">{value}</div><div className="text-[11px] text-[#167E79]">{detail}</div></div>)}</div>
          <section className="bg-white border rounded-3xl p-5 shadow-sm"><div className="flex justify-between items-center mb-4"><div><h2 className="text-base font-bold text-[#102033]">Quality Hold-Point Queue</h2><p className="text-xs text-[#657287]">Inspections and defects blocking follow-on work.</p></div><button onClick={() => showToast('Inspection request created.')} className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold">Request Inspection</button></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[
            ['HP-031', 'Foundation reinforcement', 'Accepted', 'Engineer · grid C4'],
            ['SN-118', 'Face brick colour variance', 'Quarantined', 'Architect · sample panel'],
            ['NCR-006', 'Stormwater channel fall', 'Corrective work', 'Contractor · due 26 Aug'],
          ].map(([id, title, status, detail]) => <article key={id} className="p-4 border rounded-2xl bg-gray-50"><span className="font-mono text-[10px] font-bold text-[#167E79]">{id}</span><h3 className="text-xs font-bold text-[#102033] mt-2">{title}</h3><span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">{status}</span><p className="text-[11px] text-[#657287] mt-2">{detail}</p></article>)}</div></section>
        </div>
      )}

      {/* TAB 6: TIMESHEETS */}
      {activeTab === 'timesheets' && (
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3" data-tool-tab="timesheets">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#102033]">Timesheet Log & Activity Tracking</h3>
            <button
              onClick={() => showToast('Hours logged to active project.')}
              className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold"
            >
              + Log Hours
            </button>
          </div>
          <div className="divide-y text-xs text-[#526074]">
            {[
              { date: 'Today', person: 'Justin Kruger', activity: 'SANS 10400-XA prescriptive calculations & fenestration review', hours: '4.5 hrs' },
              { date: 'Yesterday', person: 'Sarah van der Merwe', activity: 'Drafting fire escape corridor widening on A-204', hours: '6.0 hrs' },
              { date: '21 Jul 2026', person: 'David Pieterse', activity: 'Extracting BoM line items for concrete and brickwork', hours: '3.5 hrs' },
            ].map((ts, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#102033]">{ts.person} · <span className="font-normal text-[#657287]">{ts.date}</span></div>
                  <div>{ts.activity}</div>
                </div>
                <div className="font-mono font-bold text-[#167E79] text-sm bg-[#DFF5F2] px-2 py-1 rounded-lg">
                  {ts.hours}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profitability' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-tool-tab="profitability">
          <section className="lg:col-span-2 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <div><h2 className="text-base font-bold text-[#102033]">Project Profitability</h2><p className="text-xs text-[#657287]">Earned fee performance against labour cost, write-offs and stage delivery.</p></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[['Net margin', '28.4%', '+2.1% vs plan'], ['Earned fees', 'R 512k', '46% of appointment'], ['Labour cost', 'R 341k', '1,284 hours'], ['Write-offs', 'R 18.5k', '3.6% of earned']].map(([label, value, detail]) => <div key={label} className="p-3 border rounded-xl bg-gray-50"><div className="text-[10px] uppercase font-bold text-[#657287]">{label}</div><div className="text-lg font-black text-[#102033] mt-1">{value}</div><div className="text-[10px] text-[#167E79]">{detail}</div></div>)}</div>
            <div className="space-y-3">{[
              ['Stage 1 · Inception', 'R 85,000', 'R 49,000', 42],
              ['Stage 2 · Concept', 'R 180,000', 'R 121,000', 33],
              ['Stage 3 · Design Development', 'R 247,000', 'R 171,000', 31],
            ].map(([stage, earned, cost, margin]) => <div key={String(stage)}><div className="flex justify-between text-xs"><span className="font-bold text-[#102033]">{stage}</span><span className="text-[#657287]">Earned {earned} · Cost {cost} · <strong className="text-[#167E79]">{margin}% margin</strong></span></div><div className="h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden"><div className="h-full bg-[#19B7B0] rounded-full" style={{ width: `${margin}%` }} /></div></div>)}</div>
          </section>
          <aside className="bg-[#102033] text-white rounded-3xl p-5 h-fit"><h3 className="text-sm font-bold">Commercial Diagnosis</h3><div className="text-4xl font-black text-[#68D8D1] mt-3">Healthy</div><p className="text-xs text-white/70 mt-2">Current margin remains above the practice target of 25%.</p><div className="mt-4 pt-4 border-t border-white/10 text-xs space-y-2"><div className="flex justify-between"><span>Fee recovery</span><strong>96%</strong></div><div className="flex justify-between"><span>Utilisation</span><strong>81%</strong></div><div className="flex justify-between"><span>WIP lock-up</span><strong>19 days</strong></div></div></aside>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="space-y-4" data-tool-tab="forecast">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border rounded-3xl p-5 shadow-sm"><div><h2 className="text-base font-bold text-[#102033]">Practice Forecasting</h2><p className="text-xs text-[#657287]">Rolling 12-week fee, workload and capacity outlook based on the current programme.</p></div><button onClick={() => showToast('Forecast recalculated from current programme.')} className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold">Recalculate Forecast</button></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="bg-white border rounded-3xl p-5 shadow-sm"><h3 className="text-sm font-bold text-[#102033] mb-4">Fee Billing Outlook</h3><div className="grid grid-cols-6 gap-2 items-end h-48">{[
              ['Sep', 62, 'R 92k'], ['Oct', 88, 'R 132k'], ['Nov', 75, 'R 112k'], ['Dec', 45, 'R 68k'], ['Jan', 68, 'R 102k'], ['Feb', 82, 'R 123k'],
            ].map(([month, height, value]) => <div key={String(month)} className="h-full flex flex-col justify-end items-center"><span className="text-[9px] font-bold text-[#167E79] mb-1">{value}</span><div className="w-full max-w-12 bg-[#19B7B0] rounded-t-lg" style={{ height: `${height}%` }} /><span className="text-[10px] text-[#657287] mt-2">{month}</span></div>)}</div></section>
            <section className="bg-white border rounded-3xl p-5 shadow-sm"><h3 className="text-sm font-bold text-[#102033] mb-4">Resource Pressure by Discipline</h3><div className="space-y-4">{[['Architecture', 92, '8h over capacity'], ['Technical', 84, '6h available'], ['Quantity Surveying', 71, '14h available'], ['Site Administration', 63, '22h available']].map(([name, load, note]) => <div key={String(name)}><div className="flex justify-between text-xs"><strong className="text-[#102033]">{name}</strong><span className={Number(load) > 90 ? 'text-red-700 font-bold' : 'text-[#657287]'}>{note}</span></div><div className="h-2 bg-gray-100 rounded-full mt-1.5"><div className={`h-full rounded-full ${Number(load) > 90 ? 'bg-red-500' : 'bg-[#19B7B0]'}`} style={{ width: `${load}%` }} /></div></div>)}</div></section>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" data-tool-tab="budget">
          <section className="lg:col-span-8 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center"><div><h2 className="text-base font-bold text-[#102033]">Project Budget & Cost Control</h2><p className="text-xs text-[#657287]">Approved construction budget, commitments, changes and forecast at completion.</p></div><button onClick={() => showToast('Cost report exported.')} className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold">Export Cost Report</button></div>
            <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-left text-[#657287] border-b"><tr><th className="py-2">Cost plan section</th><th>Approved</th><th>Committed</th><th>Forecast</th><th>Variance</th></tr></thead><tbody className="divide-y">{[
              ['Preliminaries', 'R 820,000', 'R 790,000', 'R 835,000', '+R 15,000'],
              ['Substructure', 'R 1,450,000', 'R 1,410,000', 'R 1,425,000', '-R 25,000'],
              ['Superstructure', 'R 3,280,000', 'R 2,940,000', 'R 3,315,000', '+R 35,000'],
              ['Finishes', 'R 2,160,000', 'R 1,480,000', 'R 2,105,000', '-R 55,000'],
              ['Services', 'R 1,890,000', 'R 1,225,000', 'R 1,920,000', '+R 30,000'],
            ].map((row) => <tr key={row[0]}><td className="py-3 font-bold text-[#102033]">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td className={row[4].startsWith('+') ? 'font-bold text-red-700' : 'font-bold text-emerald-700'}>{row[4]}</td></tr>)}</tbody></table></div>
          </section>
          <aside className="lg:col-span-4 bg-white border rounded-3xl p-5 shadow-sm h-fit space-y-4"><div><div className="text-[10px] uppercase font-bold text-[#657287]">Approved budget</div><div className="text-2xl font-black text-[#102033]">R 9.60M</div></div><div><div className="text-[10px] uppercase font-bold text-[#657287]">Forecast at completion</div><div className="text-2xl font-black text-[#167E79]">R 9.60M</div></div><div className="pt-3 border-t"><div className="flex justify-between text-xs"><span>Committed</span><strong>R 7.85M · 81.8%</strong></div><div className="h-2 bg-gray-100 rounded-full mt-2"><div className="h-full bg-[#19B7B0] rounded-full" style={{ width: '81.8%' }} /></div></div><div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900"><strong>Contingency remaining: R 412,000</strong><p className="mt-1">4.3% of approved budget after pending changes.</p></div></aside>
        </div>
      )}

      {/* Global Toast */}
      {toast && (
        <div className="fixed right-6 bottom-24 bg-[#102033] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
};
