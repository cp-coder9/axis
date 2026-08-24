'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { OrientationMode, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Surface } from '@/components/ui/Surface';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface ToolRegistryViewProps {
  mode: OrientationMode;
  onOpenTool: (toolId: string) => void;
  onSetMode: (mode: OrientationMode) => void;
}

export const ToolRegistryView: React.FC<ToolRegistryViewProps> = ({
  mode,
  onOpenTool,
  onSetMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'scaffold'>('all');

  const tools = Object.values(ALL_TOOLS);
  const groups = ['All', ...Array.from(new Set(tools.map((t) => t.group)))];
  const liveCount = tools.filter((t) => t.status === 'live').length;
  const scaffoldCount = tools.filter((t) => t.status === 'scaffold').length;

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || tool.group === selectedGroup;
    const matchesStatus = filterStatus === 'all' || tool.status === filterStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Workspace Tool Registry"
        origami={<OrigamiIcon name="tools" size={26} />}
        metadata={<p>Browse all {tools.length} integrated capabilities. Live modules retain their full functional workflows; scaffolds reserve standard integration contracts.</p>}
        actions={<Button variant="secondary" size="sm" onClick={() => onSetMode('project')}><OrigamiIcon name="projects" size={16} /> Open Project Datum</Button>}
      />

      {/* Mode Explanation Notice */}
      <Surface level="inset" className="flex items-center justify-between">
        <div className="text-[var(--ax-text)]">
          <strong>One Capability, Two Orientations.</strong>
          <span className="ml-1.5 text-[var(--ax-text-muted)]">
            Every tool operates standalone or connected to a project. Scope, data persistence, and audit logging adjust dynamically.
          </span>
        </div>
      </Surface>

      {/* Search & Filter Toolbar */}
      <Surface level="raised" className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              aria-label="Search workspace tools"
              placeholder={`Search across all ${tools.length} tools by name, discipline or standard...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[var(--ax-radius-sm)] border border-[var(--ax-border-strong)] bg-[var(--ax-surface-1)] py-2 pl-9 pr-4 text-[var(--ax-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ax-action-primary)]"
            />
            <span className="absolute left-3 top-2.5 text-[var(--ax-text-muted)]">🔍</span>
          </div>

          <div className="flex gap-1.5">
            {(['all', 'live', 'scaffold'] as const).map((st) => (
              <Button
                key={st}
                type="button"
                variant={filterStatus === st ? 'ink' : 'secondary'}
                size="sm"
                aria-pressed={filterStatus === st}
                onClick={() => setFilterStatus(st)}
                className="capitalize"
              >
                {st === 'all' ? `All (${tools.length})` : st === 'live' ? `Live (${liveCount})` : `Scaffold (${scaffoldCount})`}
              </Button>
            ))}
          </div>
        </div>

        {/* Group category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {groups.map((grp) => (
            <Button
              key={grp}
              type="button"
              variant={selectedGroup === grp ? 'quiet' : 'secondary'}
              size="sm"
              aria-pressed={selectedGroup === grp}
              onClick={() => setSelectedGroup(grp)}
              className="whitespace-nowrap"
            >
              {grp}
            </Button>
          ))}
        </div>
      </Surface>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTools.map((tool) => {
          return (
            <Button
              type="button"
              variant="secondary"
              key={tool.id}
              onClick={() => onOpenTool(tool.id)}
              className={`h-auto w-full flex-col items-stretch justify-between p-4 text-left ${tool.status === 'scaffold' ? 'border-dashed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--ax-radius-sm)] bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]">
                    <OrigamiIcon name={tool.icon} size={22} />
                  </div>
                  <StatusBadge tone={tool.status === 'live' ? 'success' : 'neutral'} label={tool.status === 'live' ? 'Live Flagship' : 'Scaffold'} />
                </div>

                <h3 className="mb-1 font-bold">{tool.name}</h3>
                <div className="mb-1.5 font-semibold text-[var(--ax-action-primary)]">{tool.group}</div>
                <p className="mb-3 line-clamp-3 leading-relaxed text-[var(--ax-text-muted)]">{tool.summary}</p>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--ax-border)] pt-2.5 text-[var(--ax-text-muted)]">
                <span>Stage: {tool.stage}</span>
                <span className="font-bold text-[var(--ax-action-primary)]">Open Tool ›</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
