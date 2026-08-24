'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, StageKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS, ROLE_PROFILES, STAGES, STAGE_COPY, STAGE_TOOL_MAP, ROLE_TOOL_MAP } from '@/lib/data';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Surface } from '@/components/ui/Surface';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
      <PageHeader
        title={project.name}
        origami={<OrigamiIcon name="projects" size={26} />}
        metadata="The Datum is the project's single line of truth. All tools attach as viewports and write back governed records."
        datum
        actions={<div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => onOpenTool('practice')}><OrigamiIcon name="practice_management" size={16} /> Plan Project</Button><Button variant="quiet" size="sm" onClick={onOpenWingman}><OrigamiIcon name="wingman" size={16} /> Ask Wingman</Button><Button size="sm" onClick={onOpenFeedback}><OrigamiIcon name="feedback" size={16} /> Give Feedback</Button></div>}
      />

      {/* Role Experience Banner */}
      <Surface level="inset" className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--ax-radius-sm)] bg-[var(--ax-text)] font-bold text-[var(--ax-surface-1)]">
          {profile.code}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 font-bold text-[var(--ax-text)]">
            <span>{profile.label} Experience</span>
            <StatusBadge tone="success" label="Active" />
          </div>
          <p className="truncate text-[var(--ax-text-muted)]">
            {profile.description}. The Datum surface prioritises tools and decision gates for your role.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1.5">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--ax-radius-pill)] border border-[var(--ax-border)] bg-[var(--ax-surface-1)] px-2 py-0.5 font-medium text-[var(--ax-action-primary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </Surface>

      {/* Project Hero Card with 8-Stage Progress Bar */}
      <Surface level="raised" className="space-y-4">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--ax-border)] pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--ax-text)]">{project.name}</h2>
            <p className="text-[var(--ax-text-muted)]">
              {project.location} · {project.client} · {project.professional} · Code: {project.code}
            </p>
          </div>
          <StatusBadge tone="success" label={`In Progress · ${project.progress}%`} />
        </div>

        {/* Interactive 8-Stage Lifecycle Selection */}
        <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
          {STAGES.map((s, idx) => {
            const isCurrent = s === project.stage;
            const stageIndex = STAGES.indexOf(project.stage);
            const isPast = idx < stageIndex;

            return (
              <button
                key={s}
                type="button"
                onClick={() => onSelectStage(s)}
                className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all text-center group ${
                  isCurrent
                    ? 'border-[var(--ax-action-primary)] bg-[var(--ax-surface-2)] text-[var(--ax-text)] font-bold shadow-sm ring-2 ring-[var(--ax-action-primary)]/20'
                    : isPast
                    ? 'border-[var(--ax-border)] bg-[var(--ax-surface-1)] text-[var(--ax-text)] hover:border-[var(--ax-action-primary)]/40'
                    : 'border-[var(--ax-border)] bg-[var(--ax-surface-2)] text-[var(--ax-text-muted)] hover:bg-[var(--ax-surface-1)]'
                }`}
                title={`Switch to ${s} stage`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mb-1 transition-all ${
                    isCurrent
                      ? 'bg-[var(--ax-action-primary)] text-[var(--ax-surface-1)] shadow-md'
                      : isPast
                      ? 'bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]'
                      : 'bg-[var(--ax-border)] text-[var(--ax-text-muted)]'
                  }`}
                >
                  {isPast ? '✓' : idx + 1}
                </div>
                <span className="text-[11.5px] truncate w-full">{s}</span>
              </button>
            );
          })}
        </div>

        <Surface level="inset" className="text-[var(--ax-text-muted)]">
          <strong className="text-[var(--ax-text)]">{project.stage} Stage:</strong> {STAGE_COPY[project.stage]}
        </Surface>
      </Surface>

      {/* Mobile Datum Sequence — derived from the same ordered activeTools collection as the desktop plane. */}
      <section data-testid="datum-mobile-sequence" className="md:hidden space-y-2 rounded-3xl border border-[var(--ax-border)] bg-[var(--ax-surface-1)] p-3">
        <div className="px-1 pb-1">
          <h2 className="font-[var(--ax-font-display)] text-[var(--ax-text-16)] font-bold">Datum-connected tools</h2>
          <p className="mt-1 text-[var(--ax-text-12)] text-[var(--ax-text-muted)]">The same stage and role sequence as the Datum plane.</p>
        </div>
        {activeTools.map((tool, index) => {
          const metricInfo = getToolMetric(tool.id);
          return (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              key={tool.id}
              data-testid="datum-mobile-tool"
              onClick={() => onOpenTool(tool.id)}
              className="h-auto w-full items-center gap-3 p-3 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]"><OrigamiIcon name={tool.icon} size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[var(--ax-text-13)] font-bold text-[var(--ax-text)]">{index + 1}. {tool.name}</span>
                <span className="mt-0.5 block truncate text-[var(--ax-text-12)] text-[var(--ax-text-muted)]">{metricInfo[0]}</span>
              </span>
              <StatusBadge tone={tool.status === 'live' ? 'success' : 'neutral'} label={tool.status === 'live' ? 'Live' : 'Scaffold'} />
            </Button>
          );
        })}
      </section>

      {/* 2D Spatial Datum Plane (Desktop / Fluid Canvas) */}
      <Surface level="raised" className="relative hidden min-h-[580px] overflow-hidden datum-grid-pattern md:block">
        {/* Stage & Role Tool Count Badge — informational only, must not intercept clicks */}
        <Surface level="overlay" className="pointer-events-none absolute right-5 top-5 z-20 max-w-[260px] text-[var(--ax-text-muted)]">
          <strong className="mb-0.5 block font-bold text-[var(--ax-text)]">
            {project.stage} Stage Tools for {profile.label}
          </strong>
          {activeTools.length} role-prioritized tools are connected to the central datum line of truth.
        </Surface>

        {/* Scaled Spatial Canvas */}
        <div
          className="relative w-full h-[520px] transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Central Datum Line of Truth */}
          <div className="absolute left-[8%] right-[4%] top-1/2 z-0 h-[3px] -translate-y-1/2 rounded-full bg-[var(--ax-datum)] shadow-lg" />

          {/* Datum Origin Badge with Architex Logo */}
          <div className="absolute left-[3%] top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--ax-datum)] bg-[var(--ax-surface-1)] shadow-xl">
            <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L6 10v12l10 6 10-6V10L16 4z" fill="#19B7B0" opacity="0.25" />
              <path d="M16 8l-6 4v8l6 4 6-4v-8l-6-4z" fill="#167E79" />
              <circle cx="16" cy="16" r="3" fill="#ffffff" />
            </svg>
          </div>

          <div className="absolute left-[3.2%] top-[58%] font-bold uppercase tracking-widest text-[var(--ax-text)]">
            DATUM
            <span className="block normal-case tracking-normal text-[var(--ax-text-muted)] font-normal">
              Line of Truth
            </span>
          </div>

          {/* Top Row Cards (Above the line) */}
          <div className="absolute left-[14%] right-[4%] top-[4%] flex justify-around items-end gap-3 h-[180px]">
            {topCards.map((tool, idx) => {
              const metricInfo = getToolMetric(tool.id);
              return (
                <div key={tool.id} className="relative flex flex-col items-center">
                  <Button
                    data-testid="datum-card"
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenTool(tool.id)}
                    className="h-auto w-[200px] flex-col items-stretch p-3.5 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]">
                        <OrigamiIcon name={tool.icon} size={18} />
                      </div>
                      <strong className="truncate font-bold text-[var(--ax-text)]">{tool.name}</strong>
                    </div>
                    <p className="mb-2 line-clamp-2 leading-relaxed text-[var(--ax-text-muted)]">{tool.summary}</p>
                    <div className="flex items-center justify-between border-t border-[var(--ax-border)] pt-2">
                      <span className="max-w-[120px] truncate font-semibold text-[var(--ax-text)]">{metricInfo[0]}</span>
                      <StatusBadge tone={tool.status === 'live' ? 'success' : 'neutral'} label={tool.status === 'live' ? 'Live' : 'Scaffold'} />
                    </div>
                  </Button>

                  {/* Vertical Connector Stem to Datum Line */}
                  <div className="my-1 h-[36px] w-[2px] bg-[var(--ax-datum)]" />
                  <div className="z-10 h-3 w-3 rounded-full border-2 border-[var(--ax-datum)] bg-[var(--ax-surface-1)] shadow-sm" />
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
                  <div className="z-10 h-3 w-3 rounded-full border-2 border-[var(--ax-datum)] bg-[var(--ax-surface-1)] shadow-sm" />
                  <div className="my-1 h-[36px] w-[2px] bg-[var(--ax-datum)]" />

                  <Button
                    data-testid="datum-card"
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenTool(tool.id)}
                    className="h-auto w-[200px] flex-col items-stretch p-3.5 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]">
                        <OrigamiIcon name={tool.icon} size={18} />
                      </div>
                      <strong className="truncate font-bold text-[var(--ax-text)]">{tool.name}</strong>
                    </div>
                    <p className="mb-2 line-clamp-2 leading-relaxed text-[var(--ax-text-muted)]">{tool.summary}</p>
                    <div className="flex items-center justify-between border-t border-[var(--ax-border)] pt-2">
                      <span className="max-w-[120px] truncate font-semibold text-[var(--ax-text)]">{metricInfo[0]}</span>
                      <StatusBadge tone={tool.status === 'live' ? 'success' : 'neutral'} label={tool.status === 'live' ? 'Live' : 'Scaffold'} />
                    </div>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Zoom Controls */}
        <Surface level="overlay" className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 p-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setZoom((prev) => Math.max(0.65, prev - 0.1))}
            className="w-8 px-0"
            title="Zoom Out"
          >
            −
          </Button>
          <input
            type="range"
            aria-label="Datum canvas zoom"
            min="0.65"
            max="1.35"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 cursor-pointer accent-[var(--ax-datum)]"
          />
          <span className="w-9 text-center font-bold text-[var(--ax-text-muted)]">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setZoom((prev) => Math.min(1.35, prev + 0.1))}
            className="w-8 px-0"
            title="Zoom In"
          >
            +
          </Button>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={() => setZoom(1.0)}
            title="Reset to 100%"
          >
            Reset
          </Button>
        </Surface>
      </Surface>
    </div>
  );
};
