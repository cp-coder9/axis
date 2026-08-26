'use client';

import { useMemo, useState } from 'react';

import { SpecForgeOverview } from '@/components/modules/specforge/SpecForgeOverview';
import { SpecForgeRecords } from '@/components/modules/specforge/SpecForgeRecords';
import { SpecForgeSmartAdd } from '@/components/modules/specforge/SpecForgeSmartAdd';
import { useSpecForgeWorkspace } from '@/components/modules/specforge/useSpecForgeWorkspace';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Surface } from '@/components/ui/Surface';
import { ToolVersionBadge } from '@/components/ui/ToolVersionBadge';
import { demoIdentity } from '@/lib/api';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import type { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';

interface SpecForgeModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  isProjectMode?: boolean;
  onTabChange?: (key: string) => void;
}

const tool = ALL_TOOLS.specforge as ToolDefinition;
const TABS = tool.tabs;
const AUTHOR_ROLES = new Set<RoleKey>(['architect','bep','engineer','energy_professional','fire_engineer','contractor','subcontractor','supplier','platform_admin']);
const CREATE_ROLES = new Set<RoleKey>(['architect','bep','organisation_admin','admin','platform_admin']);
const ISSUE_ROLES = new Set<RoleKey>(['architect','bep','platform_admin']);

export function SpecForgeModule({ activeProject, currentRole, activeTabKey, isProjectMode = true, onTabChange }: SpecForgeModuleProps) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key ?? 'overview', onTabChange);
  const [smartAddOpen, setSmartAddOpen] = useState(false);
  const localIdentity = useMemo(() => demoIdentity(currentRole), [currentRole]);
  const identity = useMemo(() => ({ role: currentRole, userId: localIdentity.userId }), [currentRole, localIdentity.userId]);
  const state = useSpecForgeWorkspace(isProjectMode ? activeProject.id : null, identity, isProjectMode);
  const canEdit = AUTHOR_ROLES.has(currentRole);
  const canCreate = CREATE_ROLES.has(currentRole);
  const canIssue = ISSUE_ROLES.has(currentRole);
  const workspace = state.workspace;
  const revision = workspace?.revision ?? (/^P\d{2,}$/i.test(activeProject.revision) ? activeProject.revision : 'P01');

  const createWorkspace = () => state.actions.createWorkspace({ profile: `${activeProject.name} project specification`, stage: activeProject.stage, revision });

  return (
    <section className="specforge-v8" aria-label="SpecForge specification workspace" data-specforge-state={state.status}>
      <PageHeader
        title="SpecForge V2"
        origami={<OrigamiIcon name="specification" size={26} />}
        metadata={<div className="specforge-identity"><p>{activeProject.name} · {workspace?.profile ?? 'project specification'} · {revision}</p><ToolVersionBadge version="1.1" /></div>}
        actions={<div className="specforge-header-actions">{workspace && canEdit && <Button type="button" size="sm" onClick={() => setSmartAddOpen(true)}>Add specification</Button>}{workspace && canIssue && <Button type="button" variant="ink" size="sm" onClick={() => setTab('issue')}>Prepare issue</Button>}<nav aria-label="SpecForge workflow"><div>{TABS.map(item => <Button key={item.key} type="button" variant={tab === item.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === item.key} aria-current={tab === item.key ? 'page' : undefined} onClick={() => setTab(item.key ?? 'overview')}>{item.icon && <OrigamiIcon name={item.icon} size={13} />}{item.label}</Button>)}</div></nav></div>}
      />

      {!isProjectMode && <StatePanel title="Open SpecForge from a project" detail="Specification records are project-scoped. Choose a project datum before opening this workspace." />}
      {isProjectMode && state.status === 'loading' && <Surface level="inset" className="specforge-loading" role="status"><span /><div><h2>Loading specification workspace</h2><p>Reading authenticated project records from Architex.</p></div></Surface>}
      {isProjectMode && state.status === 'forbidden' && <StatePanel title="SpecForge is not available for this project scope" detail="Your authenticated role or project membership does not grant access to these specification records." />}
      {isProjectMode && state.status === 'error' && <StatePanel title="SpecForge could not load" detail={state.message ?? 'The persistence service is unavailable.'} action={state.retryable ? <Button onClick={() => void state.actions.reload()}>Retry</Button> : undefined} />}
      {isProjectMode && state.status === 'empty' && <StatePanel title="No specification workspace yet" detail="This production state contains no fabricated records. An authorized professional can create the persisted workspace for this project." action={canCreate ? <Button onClick={() => void createWorkspace()}>Create specification workspace</Button> : undefined} />}

      {workspace && state.status === 'conflict' && <Surface level="inset" className="specforge-conflict" role="alert"><div><strong>A newer version exists</strong><p>{state.message ?? 'Reload the record before saving again.'}</p>{Object.values(state.drafts).map((value, index) => <small key={index}>Unsaved draft: {String(value)}</small>)}</div><Button variant="secondary" onClick={() => void state.actions.reload()}>Reload current record</Button></Surface>}
      {workspace && (state.status === 'ready' || state.status === 'conflict') && <>
        {smartAddOpen && canEdit && <SpecForgeSmartAdd section={workspace.sections[0] ?? null} revision={workspace.revision} onConfirm={state.actions.createItem} onClose={() => setSmartAddOpen(false)} />}
        {tab === 'overview' ? <SpecForgeOverview workspace={workspace} onOpenTab={setTab} /> : <SpecForgeRecords tab={tab} workspace={workspace} role={currentRole} canEdit={canEdit} onDuplicate={state.actions.duplicateItem} onDecide={(approvalId, decision) => state.actions.decideApproval(approvalId, decision, null)} onValidateIssue={state.actions.validateIssue} onIssue={state.actions.issue} onDrawingScan={state.actions.requestDrawingScan} />}
      </>}
    </section>
  );
}

function StatePanel({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <Surface level="inset" className="specforge-state-panel"><OrigamiIcon name="specification" size={42} /><div><h2>{title}</h2><p>{detail}</p>{action}</div></Surface>;
}
