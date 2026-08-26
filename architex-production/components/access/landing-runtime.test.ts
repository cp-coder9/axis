import { describe, expect, it } from 'vitest';
import { bindLandingRuntime } from './landing-runtime';

describe('Preview 3 landing runtime bridge', () => {
  it('binds DOM access to the supplied bridge without currentScript discovery', () => {
    const runtime = '(() => { const qs = (sel, root = document) => root.querySelector(sel); document.getElementById("hero"); document.body.contains(canvas); })();';

    const bound = bindLandingRuntime(runtime);

    expect(bound).toContain('window.__architexLandingBridge.root');
    expect(bound).not.toContain('document.currentScript');
    expect(bound).not.toContain('root = document');
    expect(bound).not.toContain('document.getElementById');
    expect(bound).not.toContain('document.body.contains(canvas)');
  });
});
