'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ROLE_PROFILES } from '@/lib/data';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';

interface ScaffoldModuleProps {
  tool: ToolDefinition;
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey: string;
  isProjectMode: boolean;
  onOpenWingman: () => void;
  onTabChange?: (key: string) => void;
}

export const ScaffoldModule: React.FC<ScaffoldModuleProps> = ({
  tool,
  activeProject,
  currentRole,
  activeTabKey,
  isProjectMode,
  onOpenWingman,
  onTabChange,
}) => {
  const [tabKey, setTabKey] = useControlledToolTab(activeTabKey, tool.tabs, tool.tabs[0]?.key || '0', onTabChange);
  const [records, setRecords] = useState([
    { id: 'REC-001', name: `${tool.name} Primary Record`, status: 'Active', updated: '2 hours ago', owner: 'Justin Kruger' },
    { id: 'REC-002', name: `${tool.name} Baseline Specification`, status: 'Approved', updated: 'Yesterday', owner: 'N. Mokoena' },
    { id: 'REC-003', name: `${tool.name} Draft Verification`, status: 'Under Review', updated: '3 days ago', owner: 'Sarah van der Merwe' },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddRecord = () => {
    const newRec = {
      id: `REC-00${records.length + 1}`,
      name: `${tool.name} Entry ${records.length + 1}`,
      status: 'Active',
      updated: 'Just now',
      owner: profile.label,
    };
    setRecords([newRec, ...records]);
    showToast(`New record created and registered to ${isProjectMode ? activeProject.name : 'Practice Registry'}.`);
  };

  // Resolve the active tab: prefer the key passed by the navigator, fall back to index.
  const activeIdx = Math.max(0, tool.tabs.findIndex(t => (t.key || String(tool.tabs.indexOf(t))) === tabKey));
  const activeTab = tool.tabs[activeIdx] || tool.tabs[0];

  return (
    <div className="space-y-4">
      {/* Header with Standard Integration Contract */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#19B7B0]/10 border border-[#19B7B0]/30 flex items-center justify-center text-[#167E79]">
            <OrigamiIcon name={tool.icon} size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#102033] tracking-tight">{tool.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                Standard Integration Scaffold
              </span>
            </div>
            <p className="text-[13px] text-[#657287]">{tool.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRecord}
            className="px-4 py-2 bg-[#19B7B0] hover:bg-[#167E79] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            + Create Record
          </button>
          <button
            onClick={onOpenWingman}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>✦</span>
            <span>Ask Wingman</span>
          </button>
        </div>
      </div>

      {/* Orientation & Context Banner */}
      <div className="p-3.5 bg-white border border-[#102033]/10 rounded-2xl shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#657287]">
          <span className="font-bold text-[#102033]">Orientation:</span>
          <span className="px-2 py-0.5 rounded bg-[#DFF5F2] text-[#167E79] font-bold">
            {isProjectMode ? `Project Bound (${activeProject.name})` : 'Standalone Tool Mode'}
          </span>
          <span>·</span>
          <span>Stage: <strong>{tool.stage}</strong></span>
          <span>·</span>
          <span>Group: <strong>{tool.group}</strong></span>
        </div>
        <div className="text-[#96a0ad]">Schema Version: v2.4 (PSR-15 Compatible)</div>
      </div>

      {/* Dynamic Tab Selector from Tool Definition */}
      <div className="flex bg-white p-1 rounded-2xl border border-[#102033]/15 shadow-sm overflow-x-auto">
        {tool.tabs.map((tab, idx) => {
          const key = tab.key || String(idx);
          const isActive = key === tabKey || (activeIdx === idx && !tool.tabs.some(t => (t.key || '') === tabKey));
          return (
            <button
              key={key}
              onClick={() => setTabKey(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#19B7B0] text-white shadow-sm'
                  : 'text-[#657287] hover:text-[#102033]'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#657287]'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab-aware workspace */}
      {activeTab?.kind === 'scaffold' || !activeTab?.kind ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="text-sm font-bold text-[#102033]">{activeTab?.label || 'Overview'} Workspace</h3>
                <p className="text-[#657287]">Live records inherit data types and trigger immutable audit log entries.</p>
              </div>
              <span className="text-[11px] font-mono text-[#167E79]">{records.length} Total Entries</span>
            </div>

            <div className="space-y-2.5">
              {records.map((rec) => (
                <div key={rec.id} className="p-3.5 border rounded-xl bg-gray-50/60 flex items-center justify-between hover:bg-white transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#167E79]">{rec.id}</span>
                      <span className="font-bold text-[#102033]">{rec.name}</span>
                    </div>
                    <div className="text-[11px] text-[#657287] mt-0.5">
                      Owner: {rec.owner} · Updated: {rec.updated}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[10.5px]">
                      {rec.status}
                    </span>
                    <button
                      onClick={() => showToast(`Record ${rec.id} opened for modification.`)}
                      className="px-2.5 py-1 text-[#167E79] hover:bg-[#DFF5F2] rounded-lg font-bold"
                    >
                      View ›
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Integration & Regulatory Reference */}
          <aside className="bg-white border rounded-2xl p-5 shadow-sm space-y-3 h-fit text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[#96a0ad]">Integration Contract</h4>
            <div className="space-y-2 text-[#526074]">
              <div><strong>Audit Hook:</strong> `projects_audit_log` active</div>
              <div><strong>Access Control:</strong> Role-segregated (RBAC)</div>
              <div><strong>Offline Capability:</strong> IndexedDB cache enabled</div>
              <div><strong>Export Format:</strong> PDF/A, XLSX, IFC Property Set</div>
            </div>

            <div className="pt-2 border-t">
              <h5 className="font-bold text-[#102033] mb-1">Wingman Copilot Hook</h5>
              <p className="text-[#657287] leading-relaxed">
                Wingman can parse records from {tool.name} to identify regulatory risk, schedule variance, or cost creep.
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">{activeTab?.label || 'Overview'} Workspace</h3>
              <p className="text-[#657287]">Live records inherit data types and trigger immutable audit log entries.</p>
            </div>
            <span className="text-[11px] font-mono text-[#167E79]">{records.length} Total Entries</span>
          </div>
          <div className="space-y-2.5">
            {records.map((rec) => (
              <div key={rec.id} className="p-3.5 border rounded-xl bg-gray-50/60 flex items-center justify-between hover:bg-white transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#167E79]">{rec.id}</span>
                    <span className="font-bold text-[#102033]">{rec.name}</span>
                  </div>
                  <div className="text-[11px] text-[#657287] mt-0.5">
                    Owner: {rec.owner} · Updated: {rec.updated}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[10.5px]">
                    {rec.status}
                  </span>
                  <button
                    onClick={() => showToast(`Record ${rec.id} opened for modification.`)}
                    className="px-2.5 py-1 text-[#167E79] hover:bg-[#DFF5F2] rounded-lg font-bold"
                  >
                    View ›
                  </button>
                </div>
              </div>
            ))}
          </div>
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
