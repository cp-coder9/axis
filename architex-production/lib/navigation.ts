import { OrientationMode, RoleKey, StageKey, ToolDefinition, ToolTabConfig } from '@/lib/types';

export type GlobalDestinationId =
  | 'command' | 'projects' | 'tools' | 'inbox' | 'documents'
  | 'finance' | 'knowledge' | 'feedback' | 'settings' | 'god';

export type GlobalDestinationView = 'datum' | 'registry' | 'tool' | 'global' | 'god';
export type GlobalDestinationVisibility = 'always' | 'god-mode-only';

export interface GlobalDestination {
  id: GlobalDestinationId;
  label: string;
  icon: string;
  tone: string;
  mode: OrientationMode;
  view: GlobalDestinationView;
  defaultToolId: string | null;
  visibility: GlobalDestinationVisibility;
}

export interface VisibleGlobalDestination extends GlobalDestination {
  meta?: string;
}

export interface NavigationSnapshot {
  mode: OrientationMode;
  globalId: GlobalDestinationId;
  toolId: string | null;
  tabKey: string | null;
  originGlobalId: GlobalDestinationId;
}

export interface GodModeSession {
  lens: RoleKey;
  presentationStage: StageKey | null;
  returnTo: NavigationSnapshot;
}

export interface NavigationState extends NavigationSnapshot {
  godSession: GodModeSession | null;
}

export interface NavigationEventMap {
  'select-global': { id: GlobalDestinationId };
  'set-mode': { mode: OrientationMode };
  'open-tool': { toolId: string; origin?: GlobalDestinationId; mode?: OrientationMode };
  'select-tab': { tabKey: string };
  'back': Record<string, never>;
  'enter-god': { initialLens: RoleKey };
  'open-god-home': Record<string, never>;
  'open-god-stage': { stage: StageKey };
  'set-god-lens': { lens: RoleKey };
  'exit-god': Record<string, never>;
}

export type NavigationEvent = {
  [K in keyof NavigationEventMap]: { type: K } & (
    NavigationEventMap[K] extends Record<string, never> ? object : NavigationEventMap[K]
  )
}[keyof NavigationEventMap];

export const GLOBAL_DESTINATIONS: Record<GlobalDestinationId, GlobalDestination> = {
  command: { id: 'command', label: 'Command Centre', icon: 'dashboard', tone: '#19B7B0', mode: 'project', view: 'global', defaultToolId: null, visibility: 'always' },
  projects: { id: 'projects', label: 'Project Space', icon: 'projects', tone: '#19B7B0', mode: 'project', view: 'datum', defaultToolId: null, visibility: 'always' },
  tools: { id: 'tools', label: 'Workspace Tools', icon: 'tools', tone: '#8B5CF6', mode: 'standalone', view: 'registry', defaultToolId: null, visibility: 'always' },
  inbox: { id: 'inbox', label: 'Inbox & Collaboration', icon: 'inbox', tone: '#FF6B6B', mode: 'standalone', view: 'global', defaultToolId: null, visibility: 'always' },
  documents: { id: 'documents', label: 'Documents', icon: 'document', tone: '#19B7B0', mode: 'project', view: 'global', defaultToolId: null, visibility: 'always' },
  finance: { id: 'finance', label: 'Finance & Payments', icon: 'finance', tone: '#FFB020', mode: 'project', view: 'global', defaultToolId: null, visibility: 'always' },
  knowledge: { id: 'knowledge', label: 'Knowledge & CPD', icon: 'knowledge', tone: '#2563EB', mode: 'project', view: 'global', defaultToolId: null, visibility: 'always' },
  feedback: { id: 'feedback', label: 'Feedback Intelligence', icon: 'feedback', tone: '#8B5CF6', mode: 'standalone', view: 'tool', defaultToolId: 'feedback', visibility: 'always' },
  settings: { id: 'settings', label: 'Settings', icon: 'settings', tone: '#19B7B0', mode: 'project', view: 'global', defaultToolId: null, visibility: 'always' },
  god: { id: 'god', label: 'God Mode Explorer', icon: 'god_mode', tone: '#8B5CF6', mode: 'standalone', view: 'god', defaultToolId: null, visibility: 'god-mode-only' },
};

export const INITIAL_NAVIGATION_STATE: NavigationState = {
  mode: 'project',
  globalId: 'projects',
  toolId: null,
  tabKey: null,
  originGlobalId: 'projects',
  godSession: null,
};

const GLOBAL_META: Partial<Record<GlobalDestinationId, string>> = {
  command: 'Home',
  projects: 'Datum',
  inbox: '7 demo',
  documents: '128 demo',
  finance: '4 demo',
  feedback: 'Loop',
  god: 'ALL',
};

export function firstTabKey(tool?: ToolDefinition | null): string {
  const tab = tool?.tabs?.[0];
  if (!tab) return '0';
  return tab.key ?? tab.label ?? '0';
}

export function tabKeyAt(tab: ToolTabConfig, index: number): string {
  return tab.key ?? tab.label ?? String(index);
}

export function resolveToolTabKey(tool: ToolDefinition | null, tabKey: string): string {
  if (!tool) return '0';
  const match = tool.tabs.find((tab, index) => tabKeyAt(tab, index) === tabKey);
  return match ? tabKey : firstTabKey(tool);
}

export function visibleGlobalDestinations(
  state: NavigationState,
  totalToolsCount: number,
): VisibleGlobalDestination[] {
  return Object.values(GLOBAL_DESTINATIONS)
    .filter((destination) => destination.visibility === 'always' || state.godSession !== null)
    .map((destination) => ({
      ...destination,
      meta: destination.id === 'tools' ? String(totalToolsCount) : GLOBAL_META[destination.id],
    }));
}

function snapshot(state: NavigationState): NavigationSnapshot {
  return {
    mode: state.mode,
    globalId: state.globalId,
    toolId: state.toolId,
    tabKey: state.tabKey,
    originGlobalId: state.originGlobalId,
  };
}

function destinationState(
  destination: GlobalDestination,
  godSession: GodModeSession | null,
  tools: Record<string, ToolDefinition>,
): NavigationState | null {
  const tool = destination.defaultToolId ? tools[destination.defaultToolId] : null;
  if (destination.defaultToolId && !tool) return null;
  return {
    mode: destination.mode,
    globalId: destination.id,
    toolId: tool?.id ?? null,
    tabKey: tool ? firstTabKey(tool) : null,
    originGlobalId: destination.id,
    godSession,
  };
}

export function assertNavigationState(
  state: NavigationState,
  tools: Record<string, ToolDefinition>,
): true {
  const destination = GLOBAL_DESTINATIONS[state.globalId];
  const origin = GLOBAL_DESTINATIONS[state.originGlobalId];
  if (!destination || !origin) throw new Error('Unknown navigation destination');
  if (state.globalId === 'god' && state.godSession === null) throw new Error('God destination is disabled');
  if (state.toolId === null && state.tabKey !== null) throw new Error('Tab requires an active tool');
  if (state.toolId !== null) {
    const tool = tools[state.toolId];
    if (!tool) throw new Error('Unknown active tool');
    if (state.tabKey === null || !tool.tabs.some((tab, index) => tabKeyAt(tab, index) === state.tabKey)) {
      throw new Error('Invalid active tool tab');
    }
  }
  return true;
}

export function transitionNavigation(
  state: NavigationState,
  event: NavigationEvent,
  tools: Record<string, ToolDefinition> = {},
): NavigationState {
  switch (event.type) {
    case 'select-global': {
      const destination = GLOBAL_DESTINATIONS[event.id];
      if (!destination || (event.id === 'god' && state.godSession === null)) return state;
      return destinationState(destination, state.godSession, tools) ?? state;
    }
    case 'set-mode': {
      const destination = GLOBAL_DESTINATIONS[event.mode === 'project' ? 'projects' : 'tools'];
      return destinationState(destination, state.godSession, tools) ?? state;
    }
    case 'open-tool': {
      const tool = tools[event.toolId];
      if (!tool) return state;
      const origin = event.origin ?? state.globalId;
      const originDestination = GLOBAL_DESTINATIONS[origin];
      if (!originDestination || (origin === 'god' && state.godSession === null)) return state;
      const mode = event.mode ?? originDestination.mode;
      if (mode !== 'project' && mode !== 'standalone') return state;
      return {
        ...state,
        mode,
        globalId: origin,
        toolId: tool.id,
        tabKey: firstTabKey(tool),
        originGlobalId: origin,
      };
    }
    case 'select-tab': {
      if (!state.toolId) return state;
      const tool = tools[state.toolId];
      if (!tool || !tool.tabs.some((tab, index) => tabKeyAt(tab, index) === event.tabKey)) return state;
      if (state.tabKey === event.tabKey) return state;
      return { ...state, tabKey: event.tabKey };
    }
    case 'back': {
      const destination = GLOBAL_DESTINATIONS[state.originGlobalId];
      if (!destination || (destination.id === 'god' && state.godSession === null)) return state;
      return destinationState(destination, state.godSession, tools) ?? state;
    }
    case 'enter-god': {
      if (state.godSession !== null) return state;
      return {
        mode: 'standalone',
        globalId: 'god',
        toolId: null,
        tabKey: null,
        originGlobalId: 'god',
        godSession: {
          lens: event.initialLens,
          presentationStage: null,
          returnTo: snapshot(state),
        },
      };
    }
    case 'open-god-home': {
      if (!state.godSession) return state;
      return { ...state, mode: 'standalone', globalId: 'god', toolId: null, tabKey: null, originGlobalId: 'god' };
    }
    case 'open-god-stage': {
      if (!state.godSession) return state;
      return {
        ...state,
        mode: 'project',
        globalId: 'projects',
        toolId: null,
        tabKey: null,
        originGlobalId: 'projects',
        godSession: { ...state.godSession, presentationStage: event.stage },
      };
    }
    case 'set-god-lens': {
      if (!state.godSession || state.godSession.lens === event.lens) return state;
      return { ...state, godSession: { ...state.godSession, lens: event.lens } };
    }
    case 'exit-god': {
      if (!state.godSession) return state;
      return { ...state.godSession.returnTo, godSession: null };
    }
    default:
      return state;
  }
}

export function groupTabsByGroup(tabs: ToolTabConfig[]): { group: string; tabs: { tab: ToolTabConfig; index: number }[] }[] {
  const grouped: Record<string, { tab: ToolTabConfig; index: number }[]> = {};
  tabs.forEach((tab, idx) => {
    const group = tab.group || 'General';
    (grouped[group] ??= []).push({ tab, index: idx });
  });
  return Object.entries(grouped).map(([group, items]) => ({ group, tabs: items }));
}
