import { describe, expect, it } from 'vitest';

import {
  REFERENCE_ROLE_TOOL_MAP,
  REFERENCE_STAGE_TOOL_MAP,
  REFERENCE_TOOLS,
} from '@/lib/reference/godmode-reference';
import { referenceToolIdsForContext } from '@/lib/reference/reference-navigation';

const COMMON_TOOL_IDS = ['meetings', 'wingman', 'project_passport', 'forms'];

describe('reference navigation policy', () => {
  it('returns every known stage tool in reference order for God Mode', () => {
    for (const [stage, ids] of Object.entries(REFERENCE_STAGE_TOOL_MAP)) {
      expect(referenceToolIdsForContext({ stage, presentationRole: 'architect', godMode: true })).toEqual(
        ids.filter((id) => REFERENCE_TOOLS[id]),
      );
    }
  });

  it('applies every reference role lens plus common tools in stage order', () => {
    for (const [stage, stageIds] of Object.entries(REFERENCE_STAGE_TOOL_MAP)) {
      for (const [presentationRole, roleIds] of Object.entries(REFERENCE_ROLE_TOOL_MAP)) {
        const expected = stageIds.filter((id) =>
          REFERENCE_TOOLS[id] && (roleIds.includes(id) || COMMON_TOOL_IDS.includes(id)),
        );
        expect(referenceToolIdsForContext({ stage, presentationRole, godMode: false })).toEqual(expected);
      }
    }
  });

  it('rejects unknown presentation stages and roles', () => {
    expect(() => referenceToolIdsForContext({ stage: 'Unknown', presentationRole: 'architect', godMode: true }))
      .toThrow(/Unknown reference stage/);
    expect(() => referenceToolIdsForContext({ stage: 'Design', presentationRole: 'unknown', godMode: false }))
      .toThrow(/Unknown reference presentation role/);
  });

  it('returns only tool ids and cannot mutate authenticated authorization identity', () => {
    const input = Object.freeze({ stage: 'Design', presentationRole: 'client', godMode: false });
    const output = referenceToolIdsForContext(input);
    expect(input).toEqual({ stage: 'Design', presentationRole: 'client', godMode: false });
    expect(output.every((id) => typeof id === 'string')).toBe(true);
  });
});
