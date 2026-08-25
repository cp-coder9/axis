'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OsRail } from '@/components/layout/OsRail';
import { ContextNavigator } from '@/components/layout/ContextNavigator';
import { TopBar } from '@/components/layout/TopBar';
import { ContextInspector } from '@/components/layout/ContextInspector';
import { ResponsiveDrawer } from '@/components/layout/ResponsiveDrawer';
import { FeedbackWidget } from '@/components/layout/FeedbackWidget';
import { DatumCanvas } from '@/components/views/DatumCanvas';
import { ToolRegistryView } from '@/components/views/ToolRegistryView';
import { GlobalDestinations } from '@/components/views/GlobalDestinations';
import { GodModeView } from '@/components/views/GodModeView';
import { ModuleRouter } from '@/lib/module-registry';

import { OrientationMode, ProjectEntity, RoleKey, StageKey, ToolDefinition } from '@/lib/types';
import { ALL_PROJECTS, ALL_TOOLS, ROLE_TOOL_MAP, STAGE_TOOL_MAP } from '@/lib/data';
import {
  GLOBAL_DESTINATIONS,
  INITIAL_NAVIGATION_STATE,
  transitionNavigation,
  type GlobalDestinationId,
  type NavigationEvent,
  type NavigationState,
} from '@/lib/navigation';
import { architexApi, ApiProject, CreateProjectPayload, demoIdentity } from '@/lib/api';
import { AccessGateway } from '@/components/access/AccessGateway';
import { EngineeringWorkflowProvider } from '@/components/providers/EngineeringWorkflowProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { godModeAvailable } from '@/lib/god-mode';
import { useWorkspaceTheme } from '@/lib/useWorkspaceTheme';

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
  const { theme, toggleTheme } = useWorkspaceTheme();
  // Navigation & Spatial State
  const [navigation, setNavigation] = useState<NavigationState>(INITIAL_NAVIGATION_STATE);
  const [projects, setProjects] = useState<ProjectEntity[]>(ALL_PROJECTS);
  const [activeProject, setActiveProject] = useState<ProjectEntity>(ALL_PROJECTS[0]);
  const [currentRole, setCurrentRole] = useState<RoleKey>('architect');
  const godModeEnabled = godModeAvailable();
  const dispatchNavigation = useCallback((event: NavigationEvent) => {
    if (event.type === 'enter-god' && !godModeEnabled) return;
    setNavigation((state) => transitionNavigation(state, event, ALL_TOOLS));
  }, [godModeEnabled]);
  const { mode, globalId: activeGlobal, toolId: activeToolId, tabKey: activeToolTabKey } = navigation;
  const godMode = navigation.godSession !== null;

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
      dispatchNavigation({ type: 'select-global', id: 'projects' });
      return entity;
    },
    [currentRole, dispatchNavigation],
  );

  // Layout Drawers & Sidebars
  const [railExpanded, setRailExpanded] = useState<boolean>(false);
  const [navCompact, setNavCompact] = useState<boolean>(false);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [narrowLayout, setNarrowLayout] = useState(false);
  const [globalDrawerOpen, setGlobalDrawerOpen] = useState(false);
  const [navigatorDrawerOpen, setNavigatorDrawerOpen] = useState(false);
  const [inspectorDrawerOpen, setInspectorDrawerOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1279px)');
    const update = () => setNarrowLayout(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const mobileLayout = narrowLayout && typeof window !== 'undefined' && window.innerWidth < 768;

  // Active Tool Resolution
  const activeTool: ToolDefinition | null = activeToolId ? ALL_TOOLS[activeToolId] || null : null;

  // Role filtered tools
  const roleFilteredToolIds = ROLE_TOOL_MAP[currentRole] || [];

  // Handlers
  const handleOpenTool = (toolId: string, opts?: { mode?: OrientationMode; global?: string }) => {
    const origin = opts?.global && opts.global in GLOBAL_DESTINATIONS
      ? opts.global as GlobalDestinationId
      : undefined;
    dispatchNavigation({ type: 'open-tool', toolId, mode: opts?.mode, origin });
  };

  const handleSelectStage = (stage: StageKey) => {
    setActiveProject((prev) => ({
      ...prev,
      stage,
    }));
  };

  return (
    <div data-theme={theme} className="flex h-screen w-screen overflow-hidden bg-[var(--ax-canvas)] text-[var(--ax-text)] select-none font-sans">
      {/* Layer 1: Global OS Rail */}
      {!mobileLayout && <OsRail
        navigation={navigation}
        onNavigate={dispatchNavigation}
        railExpanded={railExpanded}
        onToggleRail={() => setRailExpanded(!railExpanded)}
        currentRole={currentRole}
        totalToolsCount={Object.keys(ALL_TOOLS).length}
      />}

      {/* Layer 2: Context Navigator */}
      {!narrowLayout && <ContextNavigator
        mode={mode}
        onNavigate={dispatchNavigation}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        projects={projects}
        onCreateProject={handleCreateProject}
        activeTool={activeTool}
        activeToolTabKey={activeToolTabKey ?? '0'}
        currentRole={currentRole}
        compact={navCompact}
        roleFilteredToolIds={roleFilteredToolIds}
        activeGlobal={activeGlobal}
      />}

      {/* Layer 3: Central Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar
          navigation={navigation}
          activeProject={activeProject}
          activeTool={activeTool}
          currentRole={currentRole}
          onSetRole={setCurrentRole}
          onToggleCompactNav={() => narrowLayout ? setNavigatorDrawerOpen(true) : setNavCompact(!navCompact)}
          onOpenGlobalNavigation={() => setGlobalDrawerOpen(true)}
          onToggleInspector={() => narrowLayout ? setInspectorDrawerOpen(true) : setInspectorOpen(!inspectorOpen)}
          onOpenWingman={() => handleOpenTool('wingman')}
          onNavigate={dispatchNavigation}
          godModeEnabled={godModeEnabled}
          theme={theme}
          onToggleTheme={toggleTheme}
          inspectorOpen={narrowLayout ? inspectorDrawerOpen : inspectorOpen}
          narrowLayout={narrowLayout}
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
              activeTabKey={activeToolTabKey ?? '0'}
              isProjectMode={mode === 'project'}
              onNavigateTool={handleOpenTool}
              onOpenWingman={() => handleOpenTool('wingman')}
              onTabChange={(tabKey) => dispatchNavigation({ type: 'select-tab', tabKey })}
            />
          ) : activeGlobal === 'projects' ? (
            <DatumCanvas
              project={activeProject}
              currentRole={currentRole}
              presentationStage={navigation.godSession?.presentationStage}
              onSelectStage={(stage) => godMode
                ? dispatchNavigation({ type: 'open-god-stage', stage })
                : handleSelectStage(stage)}
              onOpenTool={handleOpenTool}
              onOpenWingman={() => handleOpenTool('wingman')}
              onOpenFeedback={() => handleOpenTool('feedback')}
            />
          ) : godMode && activeGlobal === 'god' && !activeToolId ? (
            <GodModeView
              currentRole={navigation.godSession?.lens ?? currentRole}
              onNavigate={dispatchNavigation}
            />
          ) : activeGlobal === 'tools' ? (
            <ToolRegistryView
              mode={mode}
              onOpenTool={handleOpenTool}
              onSetMode={(nextMode) => dispatchNavigation({ type: 'set-mode', mode: nextMode })}
            />
          ) : ['command', 'inbox', 'documents', 'finance', 'knowledge', 'settings'].includes(activeGlobal) ? (
            <GlobalDestinations
              view={activeGlobal}
              currentRole={currentRole}
              onNavigate={dispatchNavigation}
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
      {!narrowLayout && inspectorOpen && (
        <ContextInspector
          mode={mode}
          activeProject={activeProject}
          activeTool={activeTool}
          currentRole={currentRole}
          onClose={() => setInspectorOpen(false)}
          onOpenWingmanTool={() => handleOpenTool('wingman')}
          onAttachProject={() => dispatchNavigation({ type: 'set-mode', mode: 'project' })}
          godMode={godMode}
        />
      )}

      {mobileLayout && (
        <ResponsiveDrawer open={globalDrawerOpen} title="Global navigation" side="start" onClose={() => setGlobalDrawerOpen(false)}>
          <OsRail
            navigation={navigation}
            onNavigate={(event) => { dispatchNavigation(event); setGlobalDrawerOpen(false); }}
            railExpanded
            onToggleRail={() => setGlobalDrawerOpen(false)}
            currentRole={currentRole}
            totalToolsCount={Object.keys(ALL_TOOLS).length}
            variant="drawer"
          />
        </ResponsiveDrawer>
      )}

      {narrowLayout && (
        <ResponsiveDrawer open={navigatorDrawerOpen} title="Context navigation" side="start" onClose={() => setNavigatorDrawerOpen(false)}>
          <ContextNavigator
            mode={mode}
            onNavigate={(event) => { dispatchNavigation(event); setNavigatorDrawerOpen(false); }}
            activeProject={activeProject}
            onSelectProject={setActiveProject}
            projects={projects}
            onCreateProject={handleCreateProject}
            activeTool={activeTool}
            activeToolTabKey={activeToolTabKey ?? '0'}
            currentRole={currentRole}
            compact={false}
            roleFilteredToolIds={roleFilteredToolIds}
            activeGlobal={activeGlobal}
          />
        </ResponsiveDrawer>
      )}

      {narrowLayout && (
        <ResponsiveDrawer open={inspectorDrawerOpen} title="Context inspector" side="end" onClose={() => setInspectorDrawerOpen(false)}>
          <ContextInspector
            mode={mode}
            activeProject={activeProject}
            activeTool={activeTool}
            currentRole={currentRole}
            onClose={() => setInspectorDrawerOpen(false)}
            onOpenWingmanTool={() => { handleOpenTool('wingman'); setInspectorDrawerOpen(false); }}
            onAttachProject={() => { dispatchNavigation({ type: 'set-mode', mode: 'project' }); setInspectorDrawerOpen(false); }}
            godMode={godMode}
          />
        </ResponsiveDrawer>
      )}

      {/* Universal Floating Feedback Widget with Ctrl+Shift+F */}
      <FeedbackWidget
        currentRole={currentRole}
        activeProject={activeProject}
        activeToolName={activeTool ? activeTool.name : 'Project Datum'}
        activeTabLabel={activeToolTabKey ?? '0'}
      />
    </div>
  );
}

export default function ArchitexEntryPage() {
  return (
    <EngineeringWorkflowProvider><AuthProvider><AccessGateway><ArchitexOSPage /></AccessGateway></AuthProvider></EngineeringWorkflowProvider>
  );
}
