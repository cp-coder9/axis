'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { OrientationMode, ProjectEntity, RoleKey, StageKey, ToolDefinition } from '@/lib/types';
import { ALL_PROJECTS, ALL_TOOLS, ROLE_PROFILES, STAGES } from '@/lib/data';
import { groupTabsByGroup, tabKeyAt, type GlobalDestinationId, type NavigationEvent } from '@/lib/navigation';
import { ToolVersionBadge } from '@/components/ui/ToolVersionBadge';

interface ContextNavigatorProps {
  mode: OrientationMode;
  onNavigate: (event: NavigationEvent) => void;
  activeProject: ProjectEntity;
  onSelectProject: (project: ProjectEntity) => void;
  /** Live project register (MariaDB-backed). Falls back to ALL_PROJECTS. */
  projects?: ProjectEntity[];
  /** Create a project via the API. Resolves with the created entity. */
  onCreateProject?: (payload: {
    name: string;
    code: string;
    location?: string;
    stage?: StageKey;
    client?: string;
    professional?: string;
    municipality?: string;
  }) => Promise<unknown>;
  activeTool: ToolDefinition | null;
  activeToolTabKey: string;
  currentRole: RoleKey;
  compact: boolean;
  roleFilteredToolIds: string[];
  activeGlobal: GlobalDestinationId;
}

/** Client-side RBAC parity for project creation (PRD §10.3; the API enforces it server-side). */
const PROJECT_CREATE_ROLES: RoleKey[] = ['architect', 'cpm', 'firm_admin', 'developer', 'admin', 'platform_admin'];

export const ContextNavigator: React.FC<ContextNavigatorProps> = ({
  mode,
  onNavigate,
  activeProject,
  onSelectProject,
  projects,
  onCreateProject,
  activeTool,
  activeToolTabKey,
  currentRole,
  compact,
  roleFilteredToolIds,
  activeGlobal,
}) => {
  const currentProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;
  const projectList = projects && projects.length > 0 ? projects : ALL_PROJECTS;

  // Inline "Add project" form state
  const [addingProject, setAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', code: '', location: '', client: '', municipality: '', stage: 'Brief' as StageKey });
  const [projectFormError, setProjectFormError] = useState<string | null>(null);
  const [projectFormBusy, setProjectFormBusy] = useState(false);

  const canCreateProjects = PROJECT_CREATE_ROLES.includes(currentRole);

  const handleSubmitProject = async () => {
    if (!onCreateProject) return;
    const name = projectForm.name.trim();
    const code = projectForm.code.trim();
    if (name === '' || code === '') {
      setProjectFormError('Project name and code are required.');
      return;
    }
    if (projectList.some((p) => p.code.toLowerCase() === code.toLowerCase())) {
      setProjectFormError('A project with this code already exists.');
      return;
    }
    setProjectFormError(null);
    setProjectFormBusy(true);
    try {
      await onCreateProject({
        name,
        code,
        location: projectForm.location.trim() || undefined,
        stage: projectForm.stage,
        client: projectForm.client.trim() || undefined,
        municipality: projectForm.municipality.trim() || undefined,
        professional: `${currentProfile.label} · Architex OS`,
      });
      setProjectForm({ name: '', code: '', location: '', client: '', municipality: '', stage: 'Brief' });
      setAddingProject(false);
    } catch (err) {
      setProjectFormError(err instanceof Error ? err.message.replace(/^Architex API \d+: /, '') : 'Could not create the project.');
    } finally {
      setProjectFormBusy(false);
    }
  };

  // When a tool is opened from the Collaboration Hub (inbox global), the back
  // action returns to the hub instead of the project datum or standalone registry.
  const isCollabToolContext = activeGlobal === 'inbox' && mode === 'standalone' && !!activeTool;
  const isGodContext = activeGlobal === 'god' && !activeTool;

  // Group all tools by category
  const toolCategories: Record<string, ToolDefinition[]> = {};
  Object.values(ALL_TOOLS).forEach((tool) => {
    if (mode === 'project' && !roleFilteredToolIds.includes(tool.id) && tool.id !== 'meetings' && tool.id !== 'practice') {
      return;
    }
    if (!toolCategories[tool.group]) {
      toolCategories[tool.group] = [];
    }
    toolCategories[tool.group].push(tool);
  });

  return (
    <aside
      data-v8-region="navigator"
      className={`relative z-10 flex shrink-0 flex-col h-full bg-white/95 border-r border-[#102033]/10 backdrop-blur-md transition-all duration-300 ${
        compact ? 'w-[78px]' : 'w-[306px]'
      }`}
    >
      {/* Header / Orientation & Project Selector */}
      <div className="p-3.5 border-b border-[#102033]/10">
        {compact ? (
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#DFF5F2] border border-[#19B7B0]/20 flex items-center justify-center text-[var(--ax-action-primary)]">
            <OrigamiIcon name={activeTool ? activeTool.icon : mode === 'project' ? 'projects' : 'tools'} size={22} />
          </div>
        ) : (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ax-action-primary)]">
              {activeTool ? (mode === 'project' ? 'Project Tool' : 'Standalone Tool') : mode === 'project' ? 'Active Project' : 'Standalone Tools'}
            </div>
            <div className="text-[15px] font-bold text-[#102033] mt-0.5 flex min-w-0 items-center gap-1.5">
              <span className="truncate">{activeTool ? activeTool.name : mode === 'project' ? activeProject.name : 'Workspace Tool Registry'}</span>
              {activeTool && <ToolVersionBadge version={activeTool.version} />}
            </div>
            <div className="text-[11px] text-[var(--ax-text-muted)] mt-0.5 truncate">
              {activeTool
                ? mode === 'project'
                  ? `${activeProject.name} · ${activeProject.stage} stage`
                  : 'Portfolio-wide unassigned mode'
                : mode === 'project'
                ? `${activeProject.location} · ${activeProject.stage} · Rev ${activeProject.revision}`
                : 'Browse all workspace capabilities'}
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex bg-[#f2f7f6] p-1 rounded-xl border border-[#102033]/10 mt-2.5">
              <button
                data-testid="mode-project"
                onClick={() => onNavigate({ type: 'set-mode', mode: 'project' })}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                  mode === 'project'
                    ? 'bg-white text-[var(--ax-action-primary)] shadow-sm'
                    : 'text-[var(--ax-text-muted)] hover:text-[#102033]'
                }`}
              >
                Project
              </button>
              <button
                data-testid="mode-standalone"
                onClick={() => onNavigate({ type: 'set-mode', mode: 'standalone' })}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                  mode === 'standalone'
                    ? 'bg-white text-[var(--ax-action-primary)] shadow-sm'
                    : 'text-[var(--ax-text-muted)] hover:text-[#102033]'
                }`}
              >
                Standalone
              </button>
            </div>

            {/* Project dropdown if in project mode */}
            {mode === 'project' && (
              <div className="mt-2">
                <select
                  aria-label="Active project"
                  value={activeProject.id}
                  onChange={(e) => {
                    const p = projectList.find((proj) => proj.id === e.target.value);
                    if (p) onSelectProject(p);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#102033]/15 rounded-lg text-[12px] text-[#102033] focus:outline-none focus:border-[#19B7B0]"
                >
                  {projectList.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.stage})
                    </option>
                  ))}
                </select>

                {/* Add Project */}
                {canCreateProjects && onCreateProject && !addingProject && (
                  <button
                    data-testid="add-project"
                    onClick={() => { setAddingProject(true); setProjectFormError(null); }}
                    className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 border border-dashed border-[#19B7B0]/40 rounded-lg text-[11px] font-medium text-[var(--ax-action-primary)] hover:bg-[#DFF5F2]/50 transition-colors"
                  >
                    <OrigamiIcon name="projects" size={13} />
                    Add project
                  </button>
                )}

                {addingProject && canCreateProjects && onCreateProject && (
                  <div className="mt-1.5 p-2.5 bg-[#f2f7f6] border border-[#19B7B0]/25 rounded-xl space-y-1.5">
                    <input
                      placeholder="Project name"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-[#102033]/15 rounded-lg text-[11px] focus:outline-none focus:border-[#19B7B0]"
                    />
                    <input
                      placeholder="Project code (e.g. ABC-2026)"
                      value={projectForm.code}
                      onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-[#102033]/15 rounded-lg text-[11px] focus:outline-none focus:border-[#19B7B0]"
                    />
                    <input
                      placeholder="Location"
                      value={projectForm.location}
                      onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-[#102033]/15 rounded-lg text-[11px] focus:outline-none focus:border-[#19B7B0]"
                    />
                    <input
                      placeholder="Client"
                      value={projectForm.client}
                      onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-[#102033]/15 rounded-lg text-[11px] focus:outline-none focus:border-[#19B7B0]"
                    />
                    <select
                      aria-label="Project stage"
                      value={projectForm.stage}
                      onChange={(e) => setProjectForm({ ...projectForm, stage: e.target.value as StageKey })}
                      className="w-full px-2 py-1.5 bg-white border border-[#102033]/15 rounded-lg text-[11px] text-[#102033] focus:outline-none focus:border-[#19B7B0]"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {projectFormError && (
                      <p className="text-[10px] text-[#b34b3e] leading-snug">{projectFormError}</p>
                    )}
                    <div className="flex gap-1.5">
                      <button
                        data-testid="add-project-submit"
                        onClick={handleSubmitProject}
                        disabled={projectFormBusy}
                        className="flex-1 px-2 py-1.5 bg-[#167E79] text-white rounded-lg text-[11px] font-bold disabled:opacity-50 hover:bg-[#116d68] transition-colors"
                      >
                        {projectFormBusy ? 'Creating…' : 'Create project'}
                      </button>
                      <button
                        onClick={() => { setAddingProject(false); setProjectFormError(null); }}
                      className="px-2.5 py-1.5 bg-white border border-[#102033]/15 rounded-lg text-[11px] text-[var(--ax-text-muted)] hover:bg-[#f3f8f7] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back Button when inside a Tool */}
      {activeTool && (
        <button
          onClick={() => onNavigate({ type: 'back' })}
          className="flex items-center gap-2 px-4 py-2 border-b border-[#102033]/10 text-[12px] text-[var(--ax-action-primary)] hover:bg-[#DFF5F2]/40 font-medium transition-colors"
        >
          <OrigamiIcon name="projects" size={16} />
          {!compact && (
            <span>
              {isCollabToolContext
                ? 'Back to Collaboration Hub'
                : mode === 'project'
                ? 'Back to Datum Project Space'
                : 'Back to Standalone Registry'}
            </span>
          )}
        </button>
      )}

      {/* Role Card Banner */}
      {!compact && !activeTool && mode === 'project' && (
        <div className="mx-3 mt-2.5 p-2.5 bg-[#DFF5F2]/60 border border-[#19B7B0]/20 rounded-xl text-[11px] text-[var(--ax-text)] leading-relaxed">
          <strong>{currentProfile.label} view</strong>
          <p className="text-[var(--ax-text-muted)] mt-0.5">{currentProfile.description}. The datum surface filters tools relevant to your role.</p>
        </div>
      )}

      {/* God Mode Navigator */}
      {isGodContext && (
        <div className="flex-1 overflow-y-auto py-2">
          <div className="space-y-0.5">
            <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5B21B6]">
              Explore
            </div>
            <button
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#102033] font-semibold"
              title="Ecosystem Explorer"
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <OrigamiIcon name="god_mode" size={17} />
              </span>
              {!compact && <span className="truncate flex-1 text-left">Ecosystem Explorer</span>}
            </button>
            <button
              onClick={() => onNavigate({ type: 'open-god-stage', stage: activeProject.stage })}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
              title="Project datum"
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <OrigamiIcon name="projects" size={17} />
              </span>
              {!compact && <span className="truncate flex-1 text-left">Project datum</span>}
            </button>
            <button
              onClick={() => onNavigate({ type: 'select-global', id: 'tools' })}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
              title="All workspace tools"
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <OrigamiIcon name="tools" size={17} />
              </span>
              {!compact && <span className="truncate flex-1 text-left">All workspace tools</span>}
            </button>
            <button
              onClick={() => onNavigate({ type: 'open-tool', toolId: 'engineering_calc', mode: 'standalone', origin: 'god' })}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
              title="Engineer's Calculation Hub"
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <OrigamiIcon name="engineering_hub" size={17} />
              </span>
              {!compact && <span className="truncate flex-1 text-left">Engineering Hub</span>}
            </button>
            <button
              onClick={() => onNavigate({ type: 'open-tool', toolId: 'meetings', mode: 'standalone', origin: 'god' })}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
              title="Architex Meetings"
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <OrigamiIcon name="meetings" size={17} />
              </span>
              {!compact && <span className="truncate flex-1 text-left">Meetings</span>}
            </button>
            <button
              onClick={() => onNavigate({ type: 'open-tool', toolId: 'practice', mode: 'standalone', origin: 'god' })}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
              title="Practice & Project Management"
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <OrigamiIcon name="practice_management" size={17} />
              </span>
              {!compact && <span className="truncate flex-1 text-left">Practice & Project Management</span>}
            </button>
            <button
              onClick={() => onNavigate({ type: 'open-tool', toolId: 'wingman', mode: 'standalone', origin: 'god' })}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
              title="Wingman"
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <OrigamiIcon name="wingman" size={17} />
              </span>
              {!compact && <span className="truncate flex-1 text-left">Wingman</span>}
            </button>
          </div>
          <div className="mx-3 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-relaxed">
            <strong>Important:</strong> God Mode is a demo/education experience. It should use safe demo data or read-only projections in production.
          </div>
        </div>
      )}

      {/* Navigation List Body */}
      {!isGodContext && (
      <div className="flex-1 overflow-y-auto py-2">
        {/* If a tool is active, display its inner tabs grouped by section */}
        {activeTool ? (
          <div className="space-y-2">
            {!compact && (
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#657287]">
                Inside {activeTool.name}
              </div>
            )}
            {groupTabsByGroup(activeTool.tabs).map(({ group, tabs }) => (
              <div key={group} className="space-y-0.5">
                {!compact && group !== 'General' && (
                  <div className="px-4 pt-1 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--ax-text-muted)]">
                    {group}
                  </div>
                )}
                {tabs.map(({ tab, index: idx }) => {
                  const tabKey = tabKeyAt(tab, idx);
                  const isActive = activeToolTabKey === tabKey;
                  return (
                    <button
                      key={tab.label + idx}
                      aria-pressed={isActive}
                      onClick={() => onNavigate({ type: 'select-tab', tabKey })}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 transition-all ${
                        isActive
                          ? 'border-[#19B7B0] bg-[#19B7B0]/10 text-[#102033] font-semibold'
                          : 'border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]'
                      }`}
                      title={tab.label}
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <OrigamiIcon name={tab.icon || activeTool.icon} size={16} />
                      </div>
                      {!compact && <span className="truncate flex-1 text-left">{tab.label}</span>}
                      {!compact && tab.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#102033]/5 text-[#102033]">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* Main Workspace Tools Grouping */
          <div className="space-y-3">
            {/* Quick Access Top Items */}
            <div className="space-y-0.5">
              {!compact && (
                <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#657287]">
                  {mode === 'project' ? 'Project Space' : 'Quick Access'}
                </div>
              )}
              {mode === 'project' ? (
                <>
                  <button
                    onClick={() => onNavigate({ type: 'select-global', id: 'projects' })}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-[#19B7B0] bg-[#19B7B0]/10 text-[#102033] font-semibold"
                    title="Datum Workspace"
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <OrigamiIcon name="projects" size={17} />
                    </div>
                    {!compact && <span>Datum Workspace</span>}
                  </button>
                  <button
                    onClick={() => onNavigate({ type: 'open-tool', toolId: 'meetings' })}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
                    title="Architex Meetings"
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <OrigamiIcon name="meetings" size={17} />
                    </div>
                    {!compact && (
                      <>
                        <span className="truncate flex-1 text-left">Architex Meetings</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF6B6B]/15 text-[#FF6B6B] font-bold">
                          3
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onNavigate({ type: 'open-tool', toolId: 'practice' })}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
                    title="Command Centre"
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <OrigamiIcon name="practice_management" size={17} />
                    </div>
                    {!compact && <span className="truncate flex-1 text-left">Command Centre</span>}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate({ type: 'select-global', id: 'tools' })}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#102033] font-semibold"
                    title="All Workspace Tools"
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <OrigamiIcon name="tools" size={17} />
                    </div>
                    {!compact && (
                      <>
                        <span className="truncate flex-1 text-left">All Workspace Tools</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#102033]/5 text-[#657287]">
                          {Object.keys(ALL_TOOLS).length}
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onNavigate({ type: 'open-tool', toolId: 'meetings' })}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033]"
                    title="Architex Meetings"
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <OrigamiIcon name="meetings" size={17} />
                    </div>
                    {!compact && (
                      <>
                        <span className="truncate flex-1 text-left">Meetings (Native)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF6B6B]/15 text-[#FF6B6B] font-bold">
                          Live
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Categorized Tool Groups */}
            {Object.entries(toolCategories).map(([groupName, groupTools]) => (
              <div key={groupName} className="space-y-0.5">
                {!compact && (
                  <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ax-text-muted)]">
                    {groupName}
                  </div>
                )}
                {groupTools.map((tool) => (
                  <button
                    key={tool.id}
                    data-testid={`tool-${tool.id}`}
                    onClick={() => onNavigate({ type: 'open-tool', toolId: tool.id })}
                    className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-[12.5px] border-l-2 border-transparent text-[#526074] hover:bg-[#19B7B0]/5 hover:text-[#102033] transition-colors"
                    title={tool.name}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <OrigamiIcon name={tool.icon} size={16} />
                    </div>
                    {!compact && (
                      <>
                        <span className="truncate flex-1 text-left">{tool.name}</span>
                        {tool.status === 'scaffold' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-50 text-purple-600 border border-purple-200/60 font-medium">
                            Scaffold
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Footer Info Box */}
      {!compact && (
        <div className="p-3 border-t border-[#102033]/10 bg-[#f7fbfa] text-[11px] text-[#657287] leading-tight">
          <strong>{mode === 'project' ? 'Project Connected' : 'Standalone Practice Mode'}</strong>
          <p className="mt-1 text-[10.5px]">
            {mode === 'project'
              ? 'Tools inherit project stage, stakeholders, and write back to the datum audit line.'
              : 'Standalone tools operate without project context with 1-click project attachment.'}
          </p>
        </div>
      )}
    </aside>
  );
};
