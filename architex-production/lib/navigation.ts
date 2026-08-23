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

export interface GlobalContentCard {
  label: string;
  icon: string;
  description: string;
  tone: string;
  badge?: string;
  action: Extract<NavigationEvent, { type: 'select-global' | 'open-tool' }>;
}

export interface GlobalContentAction {
  label: string;
  icon: string;
  action: Extract<NavigationEvent, { type: 'select-global' | 'open-tool' }>;
}

export interface GlobalDestinationContent {
  heading: string;
  subheading: string;
  cards: GlobalContentCard[];
  primaryAction?: GlobalContentAction;
  warning?: string;
  tabs?: string[];
}

export const GLOBAL_DESTINATION_CONTENT: Record<
  Exclude<GlobalDestinationId, 'projects' | 'tools' | 'feedback' | 'god'>,
  GlobalDestinationContent
> = {
  command: {
    heading: 'Architex OS Command Centre',
    subheading: 'Platform-wide navigation, project datum, and workspace tools.',
    cards: [
      { label: 'Datum Project Space', icon: 'projects', description: 'Stage-driven single line of truth for the active project.', tone: '#19B7B0', action: { type: 'select-global', id: 'projects' } },
      { label: 'Practice & Command Centre', icon: 'practice_management', description: 'Progress, programme, actions, resources, cost, risk.', tone: '#2563EB', action: { type: 'open-tool', toolId: 'practice', mode: 'project', origin: 'command' } },
      { label: 'Workspace Tool Registry', icon: 'tools', description: 'All workspace tools across 8 lifecycle stages.', tone: '#8B5CF6', action: { type: 'select-global', id: 'tools' } },
      { label: 'Feedback Intelligence', icon: 'feedback', description: 'Track friction points, feature requests, and platform roadmap.', tone: '#FF6B6B', action: { type: 'open-tool', toolId: 'feedback', mode: 'standalone', origin: 'command' } },
    ],
  },
  inbox: {
    heading: 'Inbox & Collaboration',
    subheading: 'Meetings, messages, action approvals and collaboration tools.',
    cards: [
      { label: 'Architex Meetings', icon: 'meetings', description: 'Schedule, host and govern project meetings. 3 upcoming demo meetings.', tone: '#FF6B6B', badge: '3 demo', action: { type: 'open-tool', toolId: 'meetings', mode: 'standalone', origin: 'inbox' } },
      { label: 'Messages & Action Centre', icon: 'inbox', description: '7 demo unread messages, RFI responses, and drawing sign-off requests.', tone: '#FF6B6B', badge: '7 demo', action: { type: 'open-tool', toolId: 'inbox_action', mode: 'standalone', origin: 'inbox' } },
      { label: 'Approvals Queue', icon: 'approvals_queue', description: '2 demo multi-party sign-off gates awaiting a decision.', tone: '#FFB020', badge: '2 demo', action: { type: 'open-tool', toolId: 'approvals_queue', mode: 'standalone', origin: 'inbox' } },
    ],
    primaryAction: { label: 'Schedule a meeting', icon: 'meeting_invite', action: { type: 'open-tool', toolId: 'meetings', mode: 'standalone', origin: 'inbox' } },
  },
  documents: {
    heading: 'Documents & Drawings',
    subheading: '128 demo drawings, statutory certificates, and specifications on file.',
    cards: [
      { label: 'Architectural Set A-101 to A-210', icon: 'document', description: 'Rev P03 · 24.5 MB · demo record', tone: '#19B7B0', action: { type: 'open-tool', toolId: 'documents_drawings', mode: 'project', origin: 'documents' } },
      { label: 'Structural Footing Schedule S-201 to S-204', icon: 'document', description: 'Rev B · 14.2 MB · demo record', tone: '#19B7B0', action: { type: 'open-tool', toolId: 'documents_drawings', mode: 'project', origin: 'documents' } },
      { label: 'SANS 10400-XA Prescriptive Report', icon: 'document', description: 'Final · 3.1 MB · demo record', tone: '#19B7B0', action: { type: 'open-tool', toolId: 'documents_drawings', mode: 'project', origin: 'documents' } },
    ],
    primaryAction: { label: 'Open Documents & Drawings', icon: 'document', action: { type: 'open-tool', toolId: 'documents_drawings', mode: 'project', origin: 'documents' } },
  },
  finance: {
    heading: 'Finance & Payments',
    subheading: 'Invoices, valuations, retention, and escrow workflow.',
    cards: [
      { label: 'Payments & Escrow', icon: 'payments_escrow', description: 'Invoice, milestone, approval, retention and release-status workflow.', tone: '#FFB020', action: { type: 'open-tool', toolId: 'payments_escrow', mode: 'project', origin: 'finance' } },
      { label: 'Contract Admin', icon: 'contract_admin', description: 'JBCC/NEC payment certificates, variation orders, claims, and EoT records.', tone: '#FFB020', action: { type: 'open-tool', toolId: 'contract_admin', mode: 'project', origin: 'finance' } },
      { label: 'Fee Proposal Builder', icon: 'fee_proposal', description: 'SACAP/tariff-based professional fee agreements and work-stage allocations.', tone: '#FFB020', action: { type: 'open-tool', toolId: 'fee_proposal', mode: 'project', origin: 'finance' } },
    ],
    warning: 'Fund holding and true escrow are disabled pending legal review and a licensed partner. All payment records shown are workflow-only.',
  },
  knowledge: {
    heading: 'Knowledge & CPD',
    subheading: 'Standards library, learning tracks, and CPD credit management.',
    cards: [
      { label: 'SANS Standards Library', icon: 'knowledge', description: 'SANS 10400 Parts A–XA, SANS 10160, SANS 10162, SANS 3001, and NBR references.', tone: '#2563EB', action: { type: 'open-tool', toolId: 'cpd_learning', mode: 'project', origin: 'knowledge' } },
      { label: 'CPD Credit Tracker', icon: 'cpd_learning', description: 'Voluntary and Category 1 CPD credits, accredited courses, and statutory validation records.', tone: '#2563EB', action: { type: 'open-tool', toolId: 'cpd_learning', mode: 'project', origin: 'knowledge' } },
      { label: 'Learning Tracks', icon: 'cpd_learning', description: 'Structured learning paths for built-environment professionals and platform onboarding.', tone: '#2563EB', action: { type: 'open-tool', toolId: 'cpd_learning', mode: 'project', origin: 'knowledge' } },
    ],
    primaryAction: { label: 'Open CPD & Learning', icon: 'cpd_learning', action: { type: 'open-tool', toolId: 'cpd_learning', mode: 'project', origin: 'knowledge' } },
  },
  settings: {
    heading: 'Settings',
    subheading: 'Platform configuration, user access, security, and organisation management.',
    cards: [],
    tabs: ['User Management', 'Organisation', 'Security & RBAC', 'API Access', 'Data Retention'],
  },
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
