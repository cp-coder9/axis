'use client';

import React, { useMemo, useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ALL_TOOLS, ROLE_PROFILES, STAGES } from '@/lib/data';
import { RoleKey } from '@/lib/types';
import { type NavigationEvent } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { Card, Surface } from '@/components/ui/Surface';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Dialog } from '@/components/ui/Dialog';
import { handoffsForStage, type GodHandoff } from '@/lib/god-mode';

interface GodModeViewProps {
  currentRole: RoleKey;
  onNavigate: (event: NavigationEvent) => void;
}

export const GodModeView: React.FC<GodModeViewProps> = ({
  currentRole,
  onNavigate,
}) => {
  const currentProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;
  const [handoffsOpen, setHandoffsOpen] = useState(false);
  const [selectedHandoff, setSelectedHandoff] = useState<GodHandoff | null>(null);
  const handoffs = STAGES.flatMap((stage) => handoffsForStage(stage, currentRole));

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
      <Surface level="inset" className="flex items-start gap-3">
        <PageHeader
          title="God Mode · Ecosystem Explorer"
          origami={<OrigamiIcon name="god_mode" size={24} />}
          metadata={<p className="leading-relaxed">
            All Architex workspaces are visible for demonstration, learning and cross-discipline understanding. In production this is an exploration/sandbox layer: it does not grant contractual authority, professional sign-off or access to another party&apos;s protected project data.
          </p>}
          actions={<div className="flex flex-wrap justify-end gap-2"><StatusBadge tone="exploration" label="All tools visible" /><StatusBadge tone="neutral" label={`Demo lens: ${currentProfile.label}`} /></div>}
        />
      </Surface>

      {/* God Hero */}
      <Surface level="raised" className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--ax-text)]">See the whole system. Learn where you fit.</h2>
        <p className="max-w-2xl leading-relaxed text-[var(--ax-text-muted)]">
          God Mode intentionally removes the normal UX filtering so any user can explore how clients, professionals, contractors, suppliers and project administrators collaborate across the same project spine. Use the role selector as a viewing lens, then open any workspace to understand inputs, outputs and handoffs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[[Object.keys(ALL_TOOLS).length, 'Live and scaffolded tools'], [8, 'Project workflow stages'], [roleEntries.length, 'User role lenses'], [1, 'Datum / single line of truth']].map(([value, label]) => (
            <Card key={String(label)} level="flat" className="text-center">
              <div className="text-2xl font-extrabold text-[var(--ax-action-primary)]">{value}</div>
              <div className="text-[var(--ax-text-muted)]">{label}</div>
            </Card>
          ))}
        </div>
      </Surface>

      {/* Lifecycle Explorer */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--ax-text)]">Explore the project lifecycle</h3>
          <p className="text-[var(--ax-text-muted)]">Select a stage to open the project datum with every stage-relevant workspace visible.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STAGES.map((stage, i) => (
            <Button
              key={stage}
              variant="secondary"
              onClick={() => onNavigate({ type: 'open-god-stage', stage })}
              className="h-auto justify-start gap-3 p-3 text-left"
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]">
                {i + 1}
              </span>
              <span className="font-semibold">{stage}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Role Grid */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--ax-text)]">Understand the ecosystem of roles</h3>
          <p className="text-[var(--ax-text-muted)]">Change the selected role lens without losing God Mode access.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5" role="group" aria-label="Role lenses">
          {roleEntries.map(([key, profile]) => (
            <Button
              key={key}
              type="button"
              variant={currentRole === key ? 'quiet' : 'secondary'}
              aria-pressed={currentRole === key}
              onClick={() => onNavigate({ type: 'set-god-lens', lens: key as RoleKey })}
              className="h-auto justify-start gap-3 p-3 text-left"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]">
                {profile.code}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold">{profile.label}</span>
                <span className="mt-0.5 block line-clamp-2 text-[var(--ax-text-muted)]">{profile.description}</span>
              </span>
            </Button>
          ))}
        </div>
      </section>

      {/* Tool Groups */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--ax-text)]">Workspace registry by group</h3>
          <p className="text-[var(--ax-text-muted)]">Open any workspace in standalone mode to explore its inputs, outputs and handoffs.</p>
        </div>
        <div className="space-y-4">
          {Object.entries(toolGroups).map(([group, tools]) => (
            <div key={group}>
              <div className="mb-2 font-bold uppercase tracking-wider text-[var(--ax-text-muted)]">{group}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant="secondary"
                    onClick={() => onNavigate({ type: 'open-tool', toolId: tool.id, mode: 'standalone', origin: 'god' })}
                    className="h-auto justify-start gap-3 p-2.5 text-left"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]">
                      <OrigamiIcon name={tool.icon} size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{tool.name}</span>
                      <span className="block text-[var(--ax-text-muted)]">
                        {tool.status === 'live' ? 'Live workspace' : 'Integration scaffold'}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="quiet" onClick={() => setHandoffsOpen(true)}>Explore handoffs</Button>
        <Button
          variant="secondary"
          onClick={() => onNavigate({ type: 'open-god-stage', stage: 'Brief' })}
          className="gap-2"
        >
          <OrigamiIcon name="projects" size={16} /> Open project datum
        </Button>
        <Button
          onClick={() => onNavigate({ type: 'open-tool', toolId: 'engineering_calc', mode: 'standalone', origin: 'god' })}
          className="gap-2"
        >
          <OrigamiIcon name="engineering_hub" size={16} /> Engineering hub
        </Button>
      </div>
      <Dialog open={handoffsOpen} onOpenChange={setHandoffsOpen} title="Governed handoffs" description="Learning-only workflow explanations; access is unchanged.">
        <div className="space-y-2">{handoffs.map((handoff) => <Button key={handoff.id} type="button" variant="secondary" onClick={() => setSelectedHandoff(handoff)} className="w-full justify-start text-left">{handoff.stage} · {handoff.artifact}</Button>)}</div>
        {selectedHandoff && <div className="mt-4 rounded-xl border border-[var(--ax-border)] p-3 text-sm"><strong>{selectedHandoff.artifact}</strong><p>{selectedHandoff.decisionGate}</p><p>{selectedHandoff.sourceToolId} → {selectedHandoff.destinationToolId}</p></div>}
      </Dialog>
    </div>
  );
};
