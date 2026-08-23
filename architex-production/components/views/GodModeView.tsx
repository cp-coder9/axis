'use client';

import React, { useMemo } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ALL_TOOLS, ROLE_PROFILES, STAGES } from '@/lib/data';
import { RoleKey, StageKey } from '@/lib/types';

interface GodModeViewProps {
  currentRole: RoleKey;
  onSelectStage: (stage: StageKey) => void;
  onOpenTool: (toolId: string, opts?: { mode?: 'project' | 'standalone'; global?: string }) => void;
  onSetRole: (role: RoleKey) => void;
  onOpenProjectSpace: () => void;
}

export const GodModeView: React.FC<GodModeViewProps> = ({
  currentRole,
  onSelectStage,
  onOpenTool,
  onSetRole,
  onOpenProjectSpace,
}) => {
  const currentProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;

  const toolGroups = useMemo(() => {
    const groups: Record<string, { id: string; name: string; icon: string; status: string }[]> = {};
    Object.entries(ALL_TOOLS).forEach(([id, t]) => {
      (groups[t.group] ??= []).push({ id, name: t.name, icon: t.icon, status: t.status });
    });
    return groups;
  }, []);

  const roleEntries = Object.entries(ROLE_PROFILES);

  return (
    <div className="space-y-6">
      {/* God Banner */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20 rounded-2xl">
        <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center flex-shrink-0">
          <OrigamiIcon name="god_mode" size={24} />
        </div>
        <div>
          <div className="text-sm font-bold text-[#102033]">God Mode · Ecosystem Explorer</div>
          <p className="text-[11px] text-[#657287] mt-0.5 leading-relaxed">
            All Architex workspaces are visible for demonstration, learning and cross-discipline understanding. In production this is an exploration/sandbox layer: it does not grant contractual authority, professional sign-off or access to another party&apos;s protected project data.
          </p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6]">All tools visible</span>
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#DFF5F2] text-[#167E79]">Demo lens: {currentProfile.label}</span>
        </div>
      </div>

      {/* God Hero */}
      <section className="p-6 bg-gradient-to-br from-white to-[#DFF5F2]/30 border border-[#102033]/10 rounded-3xl shadow-sm">
        <h2 className="text-lg font-bold text-[#102033]">See the whole system. Learn where you fit.</h2>
        <p className="text-[12px] text-[#657287] mt-1.5 max-w-2xl leading-relaxed">
          God Mode intentionally removes the normal UX filtering so any user can explore how clients, professionals, contractors, suppliers and project administrators collaborate across the same project spine. Use the role selector as a viewing lens, then open any workspace to understand inputs, outputs and handoffs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="p-3 bg-white border border-[#102033]/10 rounded-xl text-center">
            <div className="text-2xl font-extrabold text-[#167E79]">{Object.keys(ALL_TOOLS).length}</div>
            <div className="text-[10px] text-[#657287]">Live and scaffolded tools</div>
          </div>
          <div className="p-3 bg-white border border-[#102033]/10 rounded-xl text-center">
            <div className="text-2xl font-extrabold text-[#167E79]">8</div>
            <div className="text-[10px] text-[#657287]">Project workflow stages</div>
          </div>
          <div className="p-3 bg-white border border-[#102033]/10 rounded-xl text-center">
            <div className="text-2xl font-extrabold text-[#167E79]">{roleEntries.length}</div>
            <div className="text-[10px] text-[#657287]">User role lenses</div>
          </div>
          <div className="p-3 bg-white border border-[#102033]/10 rounded-xl text-center">
            <div className="text-2xl font-extrabold text-[#167E79]">1</div>
            <div className="text-[10px] text-[#657287]">Datum / single line of truth</div>
          </div>
        </div>
      </section>

      {/* Lifecycle Explorer */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[#102033]">Explore the project lifecycle</h3>
          <p className="text-[11px] text-[#657287]">Select a stage to open the project datum with every stage-relevant workspace visible.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STAGES.map((stage, i) => (
            <button
              key={stage}
              onClick={() => onSelectStage(stage)}
              className="flex items-center gap-3 p-3 bg-white border border-[#102033]/10 rounded-xl text-left hover:border-[#19B7B0]/40 hover:shadow-sm transition-all"
            >
              <span className="w-7 h-7 rounded-full bg-[#DFF5F2] text-[#167E79] font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-[12px] font-semibold text-[#102033]">{stage}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Role Grid */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[#102033]">Understand the ecosystem of roles</h3>
          <p className="text-[11px] text-[#657287]">Change the selected role lens without losing God Mode access.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {roleEntries.map(([key, profile]) => (
            <button
              key={key}
              onClick={() => onSetRole(key as RoleKey)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                currentRole === key
                  ? 'border-[#8B5CF6]/40 bg-[#8B5CF6]/5'
                  : 'border-[#102033]/10 bg-white hover:border-[#8B5CF6]/30'
              }`}
            >
              <span className="w-8 h-8 rounded-lg bg-[#DFF5F2] text-[#167E79] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                {profile.code}
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-bold text-[#102033] truncate">{profile.label}</span>
                <span className="block text-[10.5px] text-[#657287] mt-0.5 line-clamp-2">{profile.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Tool Groups */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[#102033]">Workspace registry by group</h3>
          <p className="text-[11px] text-[#657287]">Open any workspace in standalone mode to explore its inputs, outputs and handoffs.</p>
        </div>
        <div className="space-y-4">
          {Object.entries(toolGroups).map(([group, tools]) => (
            <div key={group}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#657287] mb-2">{group}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => onOpenTool(tool.id, { mode: 'standalone' })}
                    className="flex items-center gap-3 p-2.5 bg-white border border-[#102033]/10 rounded-xl text-left hover:border-[#19B7B0]/40 hover:shadow-sm transition-all"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#DFF5F2]/60 text-[#167E79] flex items-center justify-center flex-shrink-0">
                      <OrigamiIcon name={tool.icon} size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold text-[#102033] truncate">{tool.name}</span>
                      <span className="block text-[10px] text-[#657287]">
                        {tool.status === 'live' ? 'Live workspace' : 'Integration scaffold'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={onOpenProjectSpace}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#102033]/15 text-[#102033] text-[12px] font-bold rounded-xl hover:bg-[#DFF5F2]/40 transition-colors"
        >
          <OrigamiIcon name="projects" size={16} /> Open project datum
        </button>
        <button
          onClick={() => onOpenTool('engineering_calc', { mode: 'standalone' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#167E79] text-white text-[12px] font-bold rounded-xl hover:bg-[#116d68] transition-colors"
        >
          <OrigamiIcon name="engineering_hub" size={16} /> Engineering hub
        </button>
      </div>
    </div>
  );
};