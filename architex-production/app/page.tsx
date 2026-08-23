'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OsRail } from '@/components/layout/OsRail';
import { ContextNavigator } from '@/components/layout/ContextNavigator';
import { TopBar } from '@/components/layout/TopBar';
import { ContextInspector } from '@/components/layout/ContextInspector';
import { FeedbackWidget } from '@/components/layout/FeedbackWidget';
import { DatumCanvas } from '@/components/views/DatumCanvas';
import { ToolRegistryView } from '@/components/views/ToolRegistryView';
import { GlobalDestinations } from '@/components/views/GlobalDestinations';
import { GodModeView } from '@/components/views/GodModeView';
import { ModuleRouter } from '@/lib/module-registry';

import { OrientationMode, ProjectEntity, RoleKey, StageKey, ToolDefinition } from '@/lib/types';
import { ALL_PROJECTS, ALL_TOOLS, ROLE_TOOL_MAP, STAGE_TOOL_MAP } from '@/lib/data';
import { GLOBAL_DESTINATIONS, firstTabKey } from '@/lib/navigation';
import { architexApi, ApiProject, CreateProjectPayload, demoIdentity } from '@/lib/api';
import { AccessGateway } from '@/components/access/AccessGateway';

/** Map a MariaDB-backed API project row onto the frontend ProjectEntity shape. */
function apiProjectToEntity(project: ApiProject): ProjectEntity {
  return {
    id: project.id,
    name: project.name,
    code: project.code,
    location: project.location,
    stage: project.stage,
    progress: project.progress,
    client: project.client,
    professional: project.professional,
    municipality: project.municipality,
    revision: project.revision,
    budget: project.budget ?? 0,
  } as ProjectEntity;
}

function ArchitexOSPage() {
  // Navigation & Spatial State
  const [mode, setMode] = useState<OrientationMode>('project');
  const [projects, setProjects] = useState<ProjectEntity[]>(ALL_PROJECTS);
  const [activeProject, setActiveProject] = useState<ProjectEntity>(ALL_PROJECTS[0]);
  const [activeGlobal, setActiveGlobal] = useState<string>('projects');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activeToolTabKey, setActiveToolTabKey] = useState<string>('0');
  const [currentRole, setCurrentRole] = useState<RoleKey>('architect');

  // Hydrate the project register from the MariaDB-backed API; the seeded
  // ALL_PROJECTS list renders immediately and is replaced as soon as the live
  // register responds. The active project is kept in sync with the register.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    architexApi.projects
      .list({ role: 'architect', userId: 'user-demo-architect' })
      .then((live) => {
        if (!live || live.length === 0) return;
        const mapped = live.map(apiProjectToEntity);
        setProjects(mapped);
        setActiveProject((prev) => mapped.find((p) => p.id === prev.id) ?? prev);
      })
      .catch(() => {
        // API unreachable — keep the seeded local project register.
      });
  }, []);

  /** Create a project in MariaDB via the API and register it locally. */
  const handleCreateProject = useCallback(
    async (payload: CreateProjectPayload): Promise<ProjectEntity> => {
      const identity = demoIdentity(currentRole);
      const created = await architexApi.projects.create(payload, identity);
      const entity = apiProjectToEntity(created);
      setProjects((prev) => [...prev.filter((p) => p.id !== entity.id), entity]);
      setActiveProject(entity);
      setActiveGlobal('projects');
      setActiveToolId(null);
      setActiveToolTabKey('0');
      setMode('project');
      return entity;
    },
    [currentRole],
  );

  // Layout Drawers & Sidebars
  const [railExpanded, setRailExpanded] = useState<boolean>(false);
  const [navCompact, setNavCompact] = useState<boolean>(false);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);

  // God Mode (v8 ecosystem explorer)
  const [godMode, setGodMode] = useState<boolean>(false);

  // Active Tool Resolution
  const activeTool: ToolDefinition | null = activeToolId ? ALL_TOOLS[activeToolId] || null : null;

  // Role filtered tools
  const roleFilteredToolIds = ROLE_TOOL_MAP[currentRole] || [];

  // Handlers
  const handleSelectGlobal = (id: string) => {
    if (id === 'god') {
      setGodMode(true);
      setActiveGlobal('god');
      setMode('standalone');
      setActiveToolId(null);
      setActiveToolTabKey('0');
      return;
    }
    const dest = GLOBAL_DESTINATIONS[id];
    if (!dest) return;
    setActiveGlobal(dest.id);
    setMode(dest.mode);
    if (dest.defaultToolId && ALL_TOOLS[dest.defaultToolId]) {
      setActiveToolId(dest.defaultToolId);
      setActiveToolTabKey(firstTabKey(ALL_TOOLS[dest.defaultToolId]));
    } else {
      setActiveToolId(null);
      setActiveToolTabKey('0');
    }
  };

  const handleToggleGodMode = () => {
    setGodMode((prev) => {
      const next = !prev;
      if (next) {
        setActiveGlobal('god');
        setMode('standalone');
        setActiveToolId(null);
        setActiveToolTabKey('0');
      } else if (activeGlobal === 'god') {
        setActiveGlobal('projects');
        setMode('project');
        setActiveToolId(null);
        setActiveToolTabKey('0');
      }
      return next;
    });
  };

  const handleOpenTool = (toolId: string, opts?: { mode?: OrientationMode; global?: string }) => {
    const tool = ALL_TOOLS[toolId];
    if (!tool) return;
    const nextMode = opts?.mode ?? (activeGlobal === 'tools' ? 'standalone' : 'project');
    setActiveToolId(toolId);
    setMode(nextMode);
    if (opts?.global) setActiveGlobal(opts.global);
    setActiveToolTabKey(firstTabKey(tool));
  };

  const handleSelectStage = (stage: StageKey) => {
    setActiveProject((prev) => ({
      ...prev,
      stage,
    }));
  };

  const handleBackToProjectSpace = () => {
    setActiveToolId(null);
    setActiveGlobal('projects');
    setMode('project');
    setActiveToolTabKey('0');
  };

  const handleBackToStandaloneLibrary = () => {
    setActiveToolId(null);
    setActiveGlobal('tools');
    setMode('standalone');
    setActiveToolTabKey('0');
  };

  const handleBackToCollabHub = () => {
    setActiveToolId(null);
    setActiveGlobal('inbox');
    setMode('standalone');
    setActiveToolTabKey('0');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f5faf9] text-[#102033] select-none font-sans">
      {/* Layer 1: Global OS Rail */}
      <OsRail
        activeGlobal={activeGlobal}
        onSelectGlobal={handleSelectGlobal}
        railExpanded={railExpanded}
        onToggleRail={() => setRailExpanded(!railExpanded)}
        currentRole={currentRole}
        totalToolsCount={Object.keys(ALL_TOOLS).length}
        godMode={godMode}
      />

      {/* Layer 2: Context Navigator */}
      <ContextNavigator
        mode={mode}
        onSetMode={setMode}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        projects={projects}
        onCreateProject={handleCreateProject}
        activeTool={activeTool}
        activeToolTabKey={activeToolTabKey}
        onSelectToolTab={(key) => setActiveToolTabKey(key)}
        onOpenTool={handleOpenTool}
        onBackToProjectSpace={handleBackToProjectSpace}
        onBackToStandaloneLibrary={handleBackToStandaloneLibrary}
        onBackToCollabHub={handleBackToCollabHub}
        currentRole={currentRole}
        compact={navCompact}
        roleFilteredToolIds={roleFilteredToolIds}
        activeGlobal={activeGlobal}
      />

      {/* Layer 3: Central Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar
          mode={mode}
          activeProject={activeProject}
          activeTool={activeTool}
          activeGlobal={activeGlobal}
          currentRole={currentRole}
          onSetRole={setCurrentRole}
          onToggleCompactNav={() => setNavCompact(!navCompact)}
          onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
          onOpenWingman={() => handleOpenTool('wingman')}
          onToggleGodMode={handleToggleGodMode}
          godMode={godMode}
          inspectorOpen={inspectorOpen}
        />

        {/* Dynamic Screen Viewport Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Tool Module View — registry-driven dispatch */}
          {activeToolId && activeTool ? (
            <ModuleRouter
              toolId={activeToolId}
              tool={activeTool}
              activeProject={activeProject}
              currentRole={currentRole}
              activeTabKey={activeToolTabKey}
              isProjectMode={mode === 'project'}
              onNavigateTool={handleOpenTool}
              onOpenWingman={() => handleOpenTool('wingman')}
              onTabChange={setActiveToolTabKey}
            />
          ) : activeGlobal === 'projects' ? (
            <DatumCanvas
              project={activeProject}
              currentRole={currentRole}
              onSelectStage={handleSelectStage}
              onOpenTool={handleOpenTool}
              onOpenWingman={() => handleOpenTool('wingman')}
              onOpenFeedback={() => handleOpenTool('feedback')}
            />
          ) : godMode && activeGlobal === 'god' && !activeToolId ? (
            <GodModeView
              currentRole={currentRole}
              onSelectStage={handleSelectStage}
              onOpenTool={handleOpenTool}
              onSetRole={setCurrentRole}
              onOpenProjectSpace={handleBackToProjectSpace}
            />
          ) : activeGlobal === 'tools' ? (
            <ToolRegistryView
              mode={mode}
              onOpenTool={handleOpenTool}
              onSetMode={setMode}
            />
          ) : ['command', 'inbox', 'documents', 'finance', 'knowledge', 'settings'].includes(activeGlobal) ? (
            <GlobalDestinations
              view={activeGlobal}
              mode={mode}
              activeProject={activeProject}
              currentRole={currentRole}
              onOpenTool={handleOpenTool}
              onSelectGlobal={handleSelectGlobal}
            />
          ) : (
            <div className="bg-white border rounded-2xl p-6 shadow-sm text-xs text-[#526074]">
              <h2 className="text-base font-bold text-[#102033] capitalize mb-2">{activeGlobal} Module</h2>
              <p>Module active and synchronized with Architex OS environment.</p>
            </div>
          )}
        </div>
      </main>

      {/* Layer 4: Contextual Inspector */}
      {inspectorOpen && (
        <ContextInspector
          mode={mode}
          activeProject={activeProject}
          activeTool={activeTool}
          currentRole={currentRole}
          onClose={() => setInspectorOpen(false)}
          onOpenWingmanTool={() => handleOpenTool('wingman')}
          onAttachProject={() => setMode('project')}
          godMode={godMode}
        />
      )}

      {/* Universal Floating Feedback Widget with Ctrl+Shift+F */}
      <FeedbackWidget
        currentRole={currentRole}
        activeProject={activeProject}
        activeToolName={activeTool ? activeTool.name : 'Project Datum'}
        activeTabLabel={activeToolTabKey}
      />
    </div>
  );
}

export default function ArchitexEntryPage() {
  return (
    <AccessGateway>
      <ArchitexOSPage />
    </AccessGateway>
  );
}
