'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, StageKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS, ROLE_PROFILES, STAGES, STAGE_COPY, STAGE_TOOL_MAP, ROLE_TOOL_MAP } from '@/lib/data';

interface DatumCanvasProps {
  project: ProjectEntity;
  currentRole: RoleKey;
  onSelectStage: (stage: StageKey) => void;
  onOpenTool: (toolId: string) => void;
  onOpenWingman: () => void;
  onOpenFeedback: () => void;
}

export const DatumCanvas: React.FC<DatumCanvasProps> = ({
  project,
  currentRole,
  onSelectStage,
  onOpenTool,
  onOpenWingman,
  onOpenFeedback,
}) => {
  const [zoom, setZoom] = useState<number>(1.0);
  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;

  // Determine stage & role filtered tools
  const stageTools = STAGE_TOOL_MAP[project.stage] || [];
  const roleTools = ROLE_TOOL_MAP[currentRole] || [];

  // Prioritize tools that match both stage and role
  const priorityIds = stageTools.filter((id) => roleTools.includes(id));
  const fallbackIds = stageTools.filter((id) => !priorityIds.includes(id));
  const activeToolIds = Array.from(new Set([...priorityIds, 'meetings', 'practice', ...fallbackIds])).slice(0, 8);

  const activeTools = activeToolIds.map((id) => ALL_TOOLS[id]).filter(Boolean);

  // Split cards above (top) and below (bottom) the datum line
  const topCount = Math.ceil(activeTools.length / 2);
  const topCards = activeTools.slice(0, topCount);
  const bottomCards = activeTools.slice(topCount);

  // Metrics preview helper for each datum card
  const getToolMetric = (id: string) => {
    switch (id) {
      case 'meetings':
        return ['Live coordination session', '3 review drafts'];
      case 'practice':
        return ['68% overall progress', '14 open actions'];
      case 'planning':
        return ['2 active SPLUMA apps', 'Next deadline 4 Aug'];
      case 'municipal':
        return ['Readiness 82%', '4 blockers identified'];
      case 'xa':
        return ['7 / 9 components pass', 'Fenestration review'];
      case 'forms':
        return ['6 forms exported', '2 signatures pending'];
      case 'specforge':
        return ['64 sections active', '12 clauses flagged'];
      case 'bom':
        return ['47 line items priced', 'R 4.29M estimate'];
      case 'itp':
        return ['3 hold points', '1 NCR linked'];
      case 'safety':
        return ['Safety file 91%', '0 lost-time incidents'];
      case 'wingman':
        return ['Project memory active', '6 AI prompts'];
      default:
        return ['Project connected', 'Integration ready'];
    }
  };

  return (
    <div className="space-y-4" data-testid="datum-canvas">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#19B7B0]/10 border border-[#19B7B0]/30 flex items-center justify-center text-[#167E79]">
            <OrigamiIcon name="projects" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#102033] tracking-tight">{project.name}</h1>
            <p className="text-[13px] text-[#657287]">
              The Datum is the project&apos;s single line of truth. All tools attach as viewports and write back governed records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTool('practice')}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-[#102033]/15 text-[#102033] rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <OrigamiIcon name="practice_management" size={16} />
            <span>Plan Project</span>
          </button>
          <button
            onClick={onOpenWingman}
            className="px-3 py-1.5 bg-white hover:bg-purple-50 border border-[#8B5CF6]/30 text-[var(--ax-ref-violet-600)] rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <OrigamiIcon name="wingman" size={16} />
            <span>Ask Wingman</span>
          </button>
          <button
            onClick={onOpenFeedback}
            className="px-3 py-1.5 bg-gradient-to-r from-[#19B7B0] to-[#167E79] text-white rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-md"
          >
            <OrigamiIcon name="feedback" size={16} />
            <span>Give Feedback</span>
          </button>
        </div>
      </div>

      {/* Role Experience Banner */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#DFF5F2]/80 to-white border border-[#19B7B0]/20 rounded-2xl">
        <div className="w-9 h-9 rounded-xl bg-[#102033] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
          {profile.code}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-[#102033] flex items-center gap-2">
            <span>{profile.label} Experience</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#19B7B0]/15 text-[#167E79]">
              Active
            </span>
          </div>
          <p className="text-[11.5px] text-[#657287] truncate">
            {profile.description}. The Datum surface prioritises tools and decision gates for your role.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1.5">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10.5px] px-2 py-0.5 rounded-full bg-white border border-[#102033]/10 text-[#167E79] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Project Hero Card with 8-Stage Progress Bar */}
      <section className="bg-white border border-[#102033]/10 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#102033]/10">
          <div>
            <h2 className="text-[17px] font-bold text-[#102033]">{project.name}</h2>
            <p className="text-[12px] text-[#657287]">
              {project.location} · {project.client} · {project.professional} · Code: {project.code}
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-green-50 text-green-700 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>In Progress · {project.progress}%</span>
          </span>
        </div>

        {/* Interactive 8-Stage Lifecycle Selection */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 pt-4">
          {STAGES.map((s, idx) => {
            const isCurrent = s === project.stage;
            const stageIndex = STAGES.indexOf(project.stage);
            const isPast = idx < stageIndex;

            return (
              <button
                key={s}
                onClick={() => onSelectStage(s)}
                className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all text-center group ${
                  isCurrent
                    ? 'border-[#19B7B0] bg-[#DFF5F2]/50 text-[#167E79] font-bold shadow-sm ring-2 ring-[#19B7B0]/20'
                    : isPast
                    ? 'border-[#102033]/10 bg-white text-[#102033] hover:border-[#19B7B0]/40'
                    : 'border-[#102033]/5 bg-gray-50/50 text-[var(--ax-text-muted)] hover:bg-white'
                }`}
                title={`Switch to ${s} stage`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mb-1 transition-all ${
                    isCurrent
                      ? 'bg-[#19B7B0] text-white shadow-md'
                      : isPast
                      ? 'bg-[#167E79]/15 text-[#167E79]'
                      : 'bg-[#102033]/5 text-[var(--ax-text-muted)]'
                  }`}
                >
                  {isPast ? '✓' : idx + 1}
                </div>
                <span className="text-[11.5px] truncate w-full">{s}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3.5 px-3 py-2 bg-[#f7fbfa] rounded-xl text-[12px] text-[#526074]">
          <strong className="text-[#167E79]">{project.stage} Stage:</strong> {STAGE_COPY[project.stage]}
        </div>
      </section>

      {/* Mobile Datum Sequence — derived from the same ordered activeTools collection as the desktop plane. */}
      <section data-testid="datum-mobile-sequence" className="md:hidden space-y-2 rounded-3xl border border-[var(--ax-border)] bg-[var(--ax-surface-1)] p-3">
        <div className="px-1 pb-1">
          <h2 className="font-[var(--ax-font-display)] text-[var(--ax-text-16)] font-bold">Datum-connected tools</h2>
          <p className="mt-1 text-[var(--ax-text-12)] text-[var(--ax-text-muted)]">The same stage and role sequence as the Datum plane.</p>
        </div>
        {activeTools.map((tool, index) => {
          const metricInfo = getToolMetric(tool.id);
          return (
            <button
              type="button"
              key={tool.id}
              data-testid="datum-mobile-tool"
              onClick={() => onOpenTool(tool.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-[var(--ax-border)] bg-[var(--ax-surface-1)] p-3 text-left hover:border-[#19B7B0]/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#DFF5F2] text-[var(--ax-action-primary)]"><OrigamiIcon name={tool.icon} size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[var(--ax-text-13)] font-bold text-[var(--ax-text)]">{index + 1}. {tool.name}</span>
                <span className="mt-0.5 block truncate text-[var(--ax-text-12)] text-[var(--ax-text-muted)]">{metricInfo[0]}</span>
              </span>
              <span className="rounded-full border border-[var(--ax-border)] px-2 py-0.5 text-[10px] font-bold text-[var(--ax-text-muted)]">{tool.status === 'live' ? 'Live' : 'Scaffold'}</span>
            </button>
          );
        })}
      </section>

      {/* 2D Spatial Datum Plane (Desktop / Fluid Canvas) */}
      <section className="relative hidden min-h-[580px] overflow-hidden rounded-3xl border border-[#102033]/10 bg-white/80 p-6 shadow-md datum-grid-pattern md:block">
        {/* Stage & Role Tool Count Badge — informational only, must not intercept clicks */}
        <div className="absolute right-5 top-5 z-20 max-w-[260px] p-3 bg-white/95 border border-[#102033]/10 rounded-2xl text-[11.5px] text-[#657287] shadow-sm leading-snug pointer-events-none">
          <strong className="block text-[#167E79] font-bold mb-0.5">
            {project.stage} Stage Tools for {profile.label}
          </strong>
          {activeTools.length} role-prioritized tools are connected to the central datum line of truth.
        </div>

        {/* Scaled Spatial Canvas */}
        <div
          className="relative w-full h-[520px] transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Central Datum Line of Truth */}
          <div className="absolute left-[8%] right-[4%] top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-[#19B7B0] via-[#58C8BC] to-[#167E79] rounded-full shadow-lg z-0" />

          {/* Datum Origin Badge with Architex Logo */}
          <div className="absolute left-[3%] top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border-2 border-[#19B7B0] shadow-xl flex items-center justify-center z-10">
            <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L6 10v12l10 6 10-6V10L16 4z" fill="#19B7B0" opacity="0.25" />
              <path d="M16 8l-6 4v8l6 4 6-4v-8l-6-4z" fill="#167E79" />
              <circle cx="16" cy="16" r="3" fill="#ffffff" />
            </svg>
          </div>

          <div className="absolute left-[3.2%] top-[58%] text-[10px] font-bold uppercase tracking-widest text-[#167E79]">
            DATUM
            <span className="block text-[8.5px] normal-case tracking-normal text-[#657287] font-normal">
              Line of Truth
            </span>
          </div>

          {/* Top Row Cards (Above the line) */}
          <div className="absolute left-[14%] right-[4%] top-[4%] flex justify-around items-end gap-3 h-[180px]">
            {topCards.map((tool, idx) => {
              const metricInfo = getToolMetric(tool.id);
              return (
                <div key={tool.id} className="relative flex flex-col items-center">
                  <article
                    data-testid="datum-card"
                    onClick={() => onOpenTool(tool.id)}
                    className="w-[200px] bg-white hover:-translate-y-1 p-3.5 border border-[#102033]/10 hover:border-[#19B7B0]/50 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79] flex-shrink-0 group-hover:bg-[#19B7B0] group-hover:text-white transition-colors">
                        <OrigamiIcon name={tool.icon} size={18} />
                      </div>
                      <strong className="text-[12.5px] font-bold text-[#102033] truncate">{tool.name}</strong>
                    </div>
                    <p className="text-[11px] text-[#657287] line-clamp-2 leading-relaxed mb-2">{tool.summary}</p>
                    <div className="pt-2 border-t border-[#102033]/5 flex justify-between items-center text-[10.5px]">
                      <span className="font-semibold text-[#102033] truncate max-w-[120px]">{metricInfo[0]}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#f2f7f6] text-[#167E79] font-bold">
                        {tool.status === 'live' ? 'Live' : 'Scaffold'}
                      </span>
                    </div>
                  </article>

                  {/* Vertical Connector Stem to Datum Line */}
                  <div className="w-[2px] h-[36px] bg-[#19B7B0]/60 my-1" />
                  <div className="w-3 h-3 rounded-full bg-white border-2 border-[#19B7B0] shadow-sm z-10" />
                </div>
              );
            })}
          </div>

          {/* Bottom Row Cards (Below the line) */}
          <div className="absolute left-[14%] right-[4%] bottom-[4%] flex justify-around items-start gap-3 h-[180px]">
            {bottomCards.map((tool, idx) => {
              const metricInfo = getToolMetric(tool.id);
              return (
                <div key={tool.id} className="relative flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-white border-2 border-[#19B7B0] shadow-sm z-10" />
                  <div className="w-[2px] h-[36px] bg-[#19B7B0]/60 my-1" />

                  <article
                    data-testid="datum-card"
                    onClick={() => onOpenTool(tool.id)}
                    className="w-[200px] bg-white hover:translate-y-1 p-3.5 border border-[#102033]/10 hover:border-[#19B7B0]/50 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79] flex-shrink-0 group-hover:bg-[#19B7B0] group-hover:text-white transition-colors">
                        <OrigamiIcon name={tool.icon} size={18} />
                      </div>
                      <strong className="text-[12.5px] font-bold text-[#102033] truncate">{tool.name}</strong>
                    </div>
                    <p className="text-[11px] text-[#657287] line-clamp-2 leading-relaxed mb-2">{tool.summary}</p>
                    <div className="pt-2 border-t border-[#102033]/5 flex justify-between items-center text-[10.5px]">
                      <span className="font-semibold text-[#102033] truncate max-w-[120px]">{metricInfo[0]}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#f2f7f6] text-[#167E79] font-bold">
                        {tool.status === 'live' ? 'Live' : 'Scaffold'}
                      </span>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex items-center gap-2 bg-white/95 border border-[#102033]/15 px-3 py-1.5 rounded-2xl shadow-lg backdrop-blur-md">
          <button
            onClick={() => setZoom((prev) => Math.max(0.65, prev - 0.1))}
            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-[#102033] font-bold text-sm"
            title="Zoom Out"
          >
            −
          </button>
          <input
            type="range"
            aria-label="Datum canvas zoom"
            min="0.65"
            max="1.35"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 accent-[#19B7B0] cursor-pointer"
          />
          <span className="text-[11px] font-bold text-[#657287] w-9 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((prev) => Math.min(1.35, prev + 0.1))}
            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-[#102033] font-bold text-sm"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="px-2 py-1 text-[11px] font-semibold text-[#167E79] hover:bg-[#DFF5F2] rounded-lg transition-colors"
            title="Reset to 100%"
          >
            Reset
          </button>
        </div>
      </section>
    </div>
  );
};
