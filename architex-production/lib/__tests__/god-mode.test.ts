import { describe, expect, it } from 'vitest';
import { ALL_TOOLS, STAGES, STAGE_TOOL_MAP } from '@/lib/data';
import { GOD_MODE_HANDOFFS, handoffsForStage, stageExplorationToolIds, validateGodModeDomain } from '@/lib/god-mode';

describe('God Mode domain contract', () => {
  it('resolves exact exploration tools', () => {
    for (const stage of STAGES) {
      expect(stageExplorationToolIds(stage)).toEqual(STAGE_TOOL_MAP[stage]);
      expect(stageExplorationToolIds(stage)).not.toBe(STAGE_TOOL_MAP[stage]);
    }
  });

  it('validates every governed handoff', () => {
    expect(validateGodModeDomain()).toEqual([]);
    expect(GOD_MODE_HANDOFFS).toHaveLength(8);
    for (const handoff of GOD_MODE_HANDOFFS) {
      expect(ALL_TOOLS[handoff.sourceToolId]).toBeDefined();
      expect(ALL_TOOLS[handoff.destinationToolId]).toBeDefined();
      expect(STAGE_TOOL_MAP[handoff.stage]).toContain(handoff.sourceToolId);
      expect(STAGE_TOOL_MAP[handoff.stage]).toContain(handoff.destinationToolId);
      expect(handoffsForStage(handoff.stage, handoff.sourceRole)).toContainEqual(handoff);
    }
  });
});
