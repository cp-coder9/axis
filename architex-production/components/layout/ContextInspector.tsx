'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { OrientationMode, ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ROLE_PROFILES } from '@/lib/data';
import { useEngineeringWorkflow } from '@/components/providers/EngineeringWorkflowProvider';

interface ContextInspectorProps {
  mode: OrientationMode;
  activeProject: ProjectEntity;
  activeTool: ToolDefinition | null;
  currentRole: RoleKey;
  onClose: () => void;
  onOpenWingmanTool: () => void;
  onAttachProject: () => void;
  godMode?: boolean;
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({
  mode,
  activeProject,
  activeTool,
  currentRole,
  onClose,
  onOpenWingmanTool,
  onAttachProject,
  godMode,
}) => {
  const [activeTab, setActiveTab] = useState<'context' | 'wingman' | 'activity'>('context');
  const engineeringWorkflow = useEngineeringWorkflow().state;
  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;

  const mockActivity = [
    { user: 'Justin Kruger', action: 'Approved Spec Item FIN-WT-001 porcelain wall tile', time: '18 min ago', code: 'JK' },
    { user: 'N. Mokoena', action: 'Uploaded fire rational design mark-up for A-204', time: '1 hour ago', code: 'NM' },
    { user: 'Sarah van der Merwe', action: 'Logged public objection response for APP-2026-001', time: '3 hours ago', code: 'SV' },
    { user: 'System (Wingman)', action: 'Completed SANS 10400-XA prescriptive calculations', time: '5 hours ago', code: 'AI' },
    { user: 'David van der Merwe', action: 'Signed Form TC1 Building Plan Application', time: 'Yesterday', code: 'DM' },
  ];

  return (
    <aside className="w-[344px] flex flex-col h-full bg-white border-l border-[#102033]/10 shadow-lg transition-all">
      {/* Inspector Header */}
      <div className="p-4 border-b border-[#102033]/10 flex items-start justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-[#102033]">
            {activeTool ? activeTool.name : mode === 'project' ? 'Project Context' : 'Standalone Inspector'}
          </h3>
          <p className="text-[11px] text-[var(--ax-text-muted)] mt-0.5">
            {mode === 'project' ? activeProject.name : 'Portfolio / Unassigned Context'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--ax-text-muted)] hover:text-[#102033] text-lg font-bold p-1 leading-none"
          title="Close Inspector"
        >
          ×
        </button>
      </div>

      {/* Inspector Navigation Tabs */}
      <div className="flex border-b border-[#102033]/10 px-4 gap-4">
        {(['context', 'wingman', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 text-[12px] font-bold capitalize border-b-2 transition-all ${
              activeTab === tab
                ? 'border-[#19B7B0] text-[var(--ax-action-primary)]'
                : 'border-transparent text-[var(--ax-text-muted)] hover:text-[#102033]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Inspector Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[13px]">
        {godMode && (
          <div className="p-3 bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 rounded-xl text-[12px] text-[#8B5CF6] leading-relaxed">
            <strong>God Mode active</strong>
            <p className="text-[var(--ax-text-muted)] mt-1 text-[11px]">
              Full-system visibility is for exploration. Authority, professional responsibility and protected records remain governed.
            </p>
          </div>
        )}
        {activeTab === 'context' && (
          <>
            <div className="p-3 bg-[#DFF5F2]/50 border border-[#19B7B0]/20 rounded-xl text-[12px] text-[var(--ax-text)] leading-relaxed">
              <strong>{mode === 'project' ? 'Project-Connected Datum' : 'Standalone Mode'}</strong>
              <p className="text-[#657287] mt-1 text-[11px]">
                {mode === 'project'
                  ? `Active project entity '${activeProject.name}' synchronizes records, drawing revisions, and decisions to the single line of truth.`
                  : 'Independent tool instance. Attach an active project to bind outputs to a registered datum.'}
              </p>
            </div>

            {mode === 'standalone' && (
              <button
                onClick={onAttachProject}
                className="w-full py-2 bg-[#19B7B0] hover:bg-[#167E79] text-white rounded-xl font-semibold text-[12px] transition-colors shadow-sm"
              >
                Attach to {activeProject.name}
              </button>
            )}

            <div className="border-b border-[#102033]/10 pb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ax-text-muted)] mb-1.5">
                Active Professional Persona
              </h4>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#102033] text-white font-bold text-[11px] flex items-center justify-center">
                  {profile.code}
                </div>
                <div>
                  <div className="font-bold text-[12.5px] text-[#102033]">{profile.label}</div>
                  <div className="text-[11px] text-[#657287]">{profile.focus}</div>
                </div>
              </div>
            </div>

            {activeTool && (
              <div className="border-b border-[#102033]/10 pb-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ax-text-muted)] mb-1">
                  Module Summary & Lifecycle
                </h4>
                <p className="text-[#526074] text-[12px] leading-relaxed">{activeTool.summary}</p>
                <div className="mt-2 flex gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-[#f2f7f6] text-[var(--ax-action-primary)] font-medium border border-[#19B7B0]/20">
                    Stage: {activeTool.stage}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#f2f7f6] text-[#526074] font-medium border border-[#102033]/10">
                    Status: {activeTool.status === 'live' ? 'Live Module' : 'Scaffold'}
                  </span>
                </div>
              </div>
            )}

            {activeTool?.id === 'engineering_calc' && engineeringWorkflow && (
              <section className="border-b border-[#102033]/10 pb-3" aria-label="Engineering workflow state">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ax-text-muted)] mb-1">Engineering workflow</h4>
                <p className="text-[12px] font-bold text-[#102033]">{engineeringWorkflow.calcId}</p>
                <p className="text-[11px] text-[#657287]">{engineeringWorkflow.phase} · {engineeringWorkflow.dirty ? 'Unsaved changes' : 'No unsaved changes'}</p>
                <p className="text-[11px] text-[#657287]">{engineeringWorkflow.record ? `Record ${engineeringWorkflow.record.id}` : 'No controlled record'}</p>
              </section>
            )}

            <div className="border-b border-[#102033]/10 pb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ax-text-muted)] mb-1">
                South African Regulatory Governance
              </h4>
              <ul className="text-[11.5px] text-[#657287] space-y-1 list-disc pl-4">
                <li>SANS 10400 National Building Regulations</li>
                <li>Construction Regulations 2014 & OHS Act 85 of 1993</li>
                <li>Municipal Planning By-laws & SPLUMA</li>
                <li>POPIA Data Protection Enforced</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'wingman' && (
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[12px] text-purple-900 leading-relaxed">
              <strong>Wingman AI Copilot</strong>
              <p className="text-purple-700 mt-1 text-[11px]">
                Contextually grounded in {activeProject.name} at {activeProject.stage} stage. Outputs require professional sign-off.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ax-text-muted)] mb-2">
                Suggested Actions for {profile.label}
              </h4>
              <div className="space-y-2">
                {[
                  'Summarise municipal submission blockers',
                  'Draft RFI for Level 3 column grid spacing',
                  'Scan drawings for SANS 10400-XA compliance gaps',
                  'Explain JBCC Practical Completion clause 17.0',
                  'Check unconfirmed BoM item unit rates',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={onOpenWingmanTool}
                    className="w-full text-left p-2.5 bg-[#fcfaff] hover:bg-purple-50 border-l-2 border-[#8B5CF6] border-y border-r border-[#102033]/10 rounded-r-xl text-[12px] text-[#526074] hover:text-purple-900 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onOpenWingmanTool}
              className="w-full py-2.5 bg-[#102033] hover:bg-[#167E79] text-white rounded-xl font-bold text-[12px] transition-colors shadow-sm mt-2"
            >
              Open Full Wingman Workspace
            </button>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--ax-text-muted)]">
              Immutable Project Audit Stream
            </h4>
            <div className="space-y-2.5">
              {mockActivity.map((act, idx) => (
                <div key={idx} className="flex gap-2.5 pb-2.5 border-b border-[#102033]/10 last:border-none">
                  <div className="w-6 h-6 rounded-lg bg-[#DFF5F2] text-[var(--ax-action-primary)] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    {act.code}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[#102033] leading-snug">{act.user}</div>
                    <div className="text-[11.5px] text-[#657287] leading-snug">{act.action}</div>
                    <div className="text-[10px] text-[var(--ax-text-muted)] mt-0.5">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
