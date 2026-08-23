import { describe, expect, it } from 'vitest';
import { ALL_TOOLS } from '@/lib/data';
import {
  GLOBAL_DESTINATIONS,
  INITIAL_NAVIGATION_STATE,
  assertNavigationState,
  firstTabKey,
  resolveToolTabKey,
  transitionNavigation,
  visibleGlobalDestinations,
  type GlobalDestinationId,
  type NavigationEvent,
  type NavigationState,
} from '@/lib/navigation';

const destinationIds: GlobalDestinationId[] = [
  'command', 'projects', 'tools', 'inbox', 'documents',
  'finance', 'knowledge', 'feedback', 'settings', 'god',
];

describe('Phase 1 navigation contract', () => {
  it('V8-H07 initial navigation state is canonical', () => {
    expect(INITIAL_NAVIGATION_STATE).toEqual({
      mode: 'project',
      globalId: 'projects',
      toolId: null,
      tabKey: null,
      originGlobalId: 'projects',
      godSession: null,
    });
    expect(assertNavigationState(INITIAL_NAVIGATION_STATE, ALL_TOOLS)).toBe(true);
  });

  it('V8-H08 keyed and keyless first tabs share one canonical key', () => {
    const keyed = { ...ALL_TOOLS.meetings, tabs: [{ label: 'Agenda', key: 'agenda' }] };
    const labeled = { ...ALL_TOOLS.meetings, tabs: [{ label: 'Agenda' }] };
    const emptyLabel = { ...ALL_TOOLS.meetings, tabs: [{ label: '' }] };
    expect(firstTabKey(keyed)).toBe('agenda');
    expect(firstTabKey(labeled)).toBe('Agenda');
    expect(firstTabKey(emptyLabel)).toBe('');
    expect(resolveToolTabKey(labeled, 'Agenda')).toBe('Agenda');
  });

  it('V8-H05 God metadata and visibility are exact', () => {
    expect(Object.keys(GLOBAL_DESTINATIONS)).toEqual(destinationIds);
    expect(GLOBAL_DESTINATIONS.god).toEqual({
      id: 'god',
      label: 'God Mode Explorer',
      icon: 'god_mode',
      tone: '#8B5CF6',
      mode: 'standalone',
      view: 'god',
      defaultToolId: null,
      visibility: 'god-mode-only',
    });
    expect(visibleGlobalDestinations(INITIAL_NAVIGATION_STATE, 47).map((item) => item.id)).not.toContain('god');
    const entered = transitionNavigation(INITIAL_NAVIGATION_STATE, { type: 'enter-god', initialLens: 'architect' }, ALL_TOOLS);
    expect(visibleGlobalDestinations(entered, 47).filter((item) => item.id === 'god')).toHaveLength(1);
  });

  it('V8-H07 selects every destination atomically and fails closed for disabled God', () => {
    for (const id of destinationIds.filter((value) => value !== 'god')) {
      const next = transitionNavigation(INITIAL_NAVIGATION_STATE, { type: 'select-global', id }, ALL_TOOLS);
      expect(next.globalId).toBe(id);
      expect(next.mode).toBe(GLOBAL_DESTINATIONS[id].mode);
      expect(assertNavigationState(next, ALL_TOOLS)).toBe(true);
    }
    const invalidGod = transitionNavigation(INITIAL_NAVIGATION_STATE, { type: 'select-global', id: 'god' }, ALL_TOOLS);
    expect(invalidGod).toBe(INITIAL_NAVIGATION_STATE);
  });

  it('V8-H07 opens all 47 tools on the canonical first tab and Back restores origin', () => {
    expect(Object.keys(ALL_TOOLS)).toHaveLength(47);
    for (const tool of Object.values(ALL_TOOLS)) {
      const opened = transitionNavigation(
        INITIAL_NAVIGATION_STATE,
        { type: 'open-tool', toolId: tool.id, origin: 'documents', mode: 'project' },
        ALL_TOOLS,
      );
      expect(opened.toolId).toBe(tool.id);
      expect(opened.tabKey).toBe(firstTabKey(tool));
      expect(opened.originGlobalId).toBe('documents');
      expect(assertNavigationState(opened, ALL_TOOLS)).toBe(true);
      expect(transitionNavigation(opened, { type: 'back' }, ALL_TOOLS)).toMatchObject({
        globalId: 'documents', mode: 'project', toolId: null, tabKey: null,
      });
    }
  });

  it('V8-H08 accepts every canonical tab and preserves object identity for invalid events', () => {
    const tool = Object.values(ALL_TOOLS).find((candidate) => candidate.tabs.length > 1)!;
    let state = transitionNavigation(INITIAL_NAVIGATION_STATE, { type: 'open-tool', toolId: tool.id }, ALL_TOOLS);
    tool.tabs.forEach((tab, index) => {
      const key = tab.key ?? tab.label ?? String(index);
      state = transitionNavigation(state, { type: 'select-tab', tabKey: key }, ALL_TOOLS);
      expect(state.tabKey).toBe(key);
    });
    expect(transitionNavigation(state, { type: 'select-tab', tabKey: '__invalid__' }, ALL_TOOLS)).toBe(state);
    expect(transitionNavigation(state, { type: 'open-tool', toolId: '__invalid__' }, ALL_TOOLS)).toBe(state);
  });

  it('V8-H05 enters, presents, changes lens, and exits God without losing return state', () => {
    const origin = transitionNavigation(INITIAL_NAVIGATION_STATE, { type: 'select-global', id: 'documents' }, ALL_TOOLS);
    const entered = transitionNavigation(origin, { type: 'enter-god', initialLens: 'architect' }, ALL_TOOLS);
    expect(entered).toMatchObject({ globalId: 'god', mode: 'standalone', toolId: null, tabKey: null });
    expect(entered.godSession?.returnTo).toEqual({
      mode: origin.mode,
      globalId: origin.globalId,
      toolId: origin.toolId,
      tabKey: origin.tabKey,
      originGlobalId: origin.originGlobalId,
    });
    const staged = transitionNavigation(entered, { type: 'open-god-stage', stage: 'Design' }, ALL_TOOLS);
    expect(staged.globalId).toBe('projects');
    expect(staged.godSession?.presentationStage).toBe('Design');
    const relensed = transitionNavigation(staged, { type: 'set-god-lens', lens: 'engineer' }, ALL_TOOLS);
    expect(relensed.godSession?.lens).toBe('engineer');
    expect(transitionNavigation(relensed, { type: 'exit-god' }, ALL_TOOLS)).toEqual(origin);
  });

  it('NavigationEvent remains an extensible typed union', () => {
    const event: NavigationEvent = { type: 'set-mode', mode: 'standalone' };
    const state: NavigationState = transitionNavigation(INITIAL_NAVIGATION_STATE, event, ALL_TOOLS);
    expect(state).toMatchObject({ mode: 'standalone', globalId: 'tools' });
  });
});
