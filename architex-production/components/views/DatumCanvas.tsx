'use client';

import React from 'react';
import { ALL_TOOLS, ROLE_PROFILES, ROLE_TOOL_MAP, STAGE_TOOL_MAP } from '@/lib/data';
import type { ProjectEntity, RoleKey, StageKey } from '@/lib/types';
import { V8DatumSequence } from '@/components/v8/V8DatumSequence';
import { V8DatumWorld } from '@/components/v8/V8DatumWorld';
import { V8PageHead } from '@/components/v8/V8PageHead';
import { V8ProjectHero } from '@/components/v8/V8ProjectHero';
import { V8RoleBanner } from '@/components/v8/V8RoleBanner';

interface DatumCanvasProps {
  project: ProjectEntity;
  currentRole: RoleKey;
  presentationStage?: StageKey | null;
  onSelectStage: (stage: StageKey) => void;
  onOpenTool: (toolId: string) => void;
  onOpenWingman: () => void;
  onOpenFeedback: () => void;
}

function getToolMetric(id: string): readonly [string, string] {
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
}

export const DatumCanvas: React.FC<DatumCanvasProps> = ({
  project,
  currentRole,
  presentationStage = null,
  onSelectStage,
  onOpenTool,
  onOpenFeedback,
}) => {
  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;
  const roleInitials = profile.label.split(/\s+/).map((word) => word[0]).join('').slice(0, 2);
  const displayedStage = presentationStage ?? project.stage;

  // God Mode is a presentation-only branch: it shows the complete selected
  // stage map without changing the authenticated role or durable project stage.
  const stageTools = STAGE_TOOL_MAP[displayedStage] || [];
  const roleTools = ROLE_TOOL_MAP[currentRole] || [];
  const priorityIds = stageTools.filter((id) => roleTools.includes(id));
  const fallbackIds = stageTools.filter((id) => !priorityIds.includes(id));
  const activeToolIds = presentationStage
    ? [...stageTools]
    : Array.from(new Set([...priorityIds, 'meetings', 'practice', ...fallbackIds])).slice(0, 8);
  const activeTools = activeToolIds.map((id) => ALL_TOOLS[id]).filter(Boolean);
  const metrics: Record<string, readonly [string, string]> = Object.fromEntries(
    activeTools.map((tool) => [tool.id, getToolMetric(tool.id)]),
  );

  return (
    <div className="v8-project-datum" data-testid="datum-canvas">
      {presentationStage && (
        <span className="sr-only" data-testid="god-mode-datum">{presentationStage} exploration</span>
      )}
      <V8PageHead
        title={project.name}
        description={presentationStage
          ? 'God Mode shows every stage-relevant workspace so users can understand the whole ecosystem and handoffs.'
          : 'A stage-driven project workflow navigation centre. The datum prioritises the workspaces relevant to this user and project stage.'}
        actions={[
          { id: 'plan-project', label: 'Plan project', icon: 'practice_management', onClick: () => onOpenTool('practice') },
          { id: 'engineering', label: 'Engineering', icon: 'engineering_hub', onClick: () => onOpenTool('engineering_calc') },
          { id: 'meetings', label: 'Meetings', icon: 'meetings', onClick: () => onOpenTool('meetings') },
          { id: 'give-feedback', label: 'Give feedback', icon: 'feedback', onClick: onOpenFeedback, primary: true },
        ]}
      />
      <V8RoleBanner
        code={roleInitials}
        label={profile.label}
        description={profile.description}
        godMode={presentationStage !== null}
      />
      <V8ProjectHero project={project} activeStage={displayedStage} onSelectStage={onSelectStage} />
      <V8DatumWorld
        tools={activeTools}
        metrics={metrics}
        stage={displayedStage}
        roleLabel={profile.label}
        godMode={presentationStage !== null}
        onOpenTool={onOpenTool}
      />
      <V8DatumSequence tools={activeTools} metrics={metrics} onOpenTool={onOpenTool} />
    </div>
  );
};
