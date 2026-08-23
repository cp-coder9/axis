import { describe, expect, it, vi } from 'vitest';

describe('V8-P4-T01 engineering workflow feature flag', () => {
  it('enables only the literal true build-time value', async () => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_ENGINEERING_WORKFLOW_V2', 'true');
    expect((await import('@/lib/features')).engineeringWorkflowV2).toBe(true);
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_ENGINEERING_WORKFLOW_V2', 'TRUE');
    expect((await import('@/lib/features')).engineeringWorkflowV2).toBe(false);
    vi.unstubAllEnvs();
  });
});
