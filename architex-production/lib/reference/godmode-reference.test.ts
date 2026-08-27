import { describe, expect, it } from 'vitest';

import { ALL_TOOLS } from '@/lib/data';
import { REFERENCE_TOOLS } from '@/lib/reference/godmode-reference';

const comparableTool = (tool: (typeof ALL_TOOLS)[string]) => ({
  id: tool.id,
  name: tool.name,
  icon: tool.icon,
  tone: tool.tone,
  group: tool.group,
  stage: tool.stage,
  summary: tool.summary,
  status: tool.status,
  source: tool.source ?? '',
  tabs: tool.tabs.map(({ label, kind, fn, arg }) => ({
    label,
    kind: kind ?? '',
    fn: fn ?? '',
    arg: arg ?? '',
  })),
});

const comparableReferenceTool = (tool: (typeof REFERENCE_TOOLS)[string]) => ({
  ...tool,
  tabs: tool.tabs.map(({ label, kind, fn, arg }) => ({
    label,
    kind: kind ?? '',
    fn: fn ?? '',
    arg: arg ?? '',
  })),
});

describe('God Mode reference adapter', () => {
  it('keeps the runtime registry identical to the 47-tool reference contract', () => {
    expect(Object.keys(ALL_TOOLS).sort()).toEqual(Object.keys(REFERENCE_TOOLS).sort());

    for (const [id, referenceTool] of Object.entries(REFERENCE_TOOLS)) {
      expect(comparableTool(ALL_TOOLS[id]), id).toEqual(comparableReferenceTool(referenceTool));
    }
  });

  it('preserves all fourteen SpecForge reference views in order', () => {
    expect(ALL_TOOLS.specforge.tabs.map((tab) => tab.label)).toEqual(
      REFERENCE_TOOLS.specforge.tabs.map((tab) => tab.label),
    );
  });

  it('assigns every tab a unique deterministic identity inside its tool', () => {
    for (const tool of Object.values(ALL_TOOLS)) {
      const keys = tool.tabs.map((tab) => tab.key);
      expect(keys.every(Boolean), tool.id).toBe(true);
      expect(new Set(keys).size, tool.id).toBe(keys.length);
    }
  });
});
