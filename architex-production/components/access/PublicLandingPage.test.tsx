import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const reference = readFileSync(resolve('..', 'preview(3).html'), 'utf8');

describe('Preview 3 public homepage contract', () => {
  it('ports every canonical public section from the supplied homepage', () => {
    const source = readFileSync(resolve('components/access/PublicLandingPage.tsx'), 'utf8');
    const publicAsset = readFileSync(resolve('public/preview3.html'), 'utf8');
    const markers = [
      'The Operating System<br>for the Built Environment',
      'Find the right people and services',
      'Your always-on guide for building projects',
      'Explore Architex public spaces',
      'No sign-in required for this public guidance space',
    ];

    for (const marker of markers) {
      expect(reference).toContain(marker);
      expect(publicAsset).toContain(marker);
    }
    expect(createHash('sha256').update(publicAsset).digest('hex'))
      .toBe(createHash('sha256').update(reference).digest('hex'));
    expect(source).toContain("fetch('/preview3.html')");
  });

  it('connects the supplied public entry controls to real authentication callbacks', () => {
    const source = readFileSync(resolve('components/access/PublicLandingPage.tsx'), 'utf8');
    expect(source).toContain('onSignIn: () => void');
    expect(source).toContain('onSignUp: () => void');
    expect(source).toContain('onClick={onSignIn}');
    expect(source).toContain('onClick={onSignUp}');
  });

  it('retains the interactive Datum canvas as a native page element', () => {
    const source = readFileSync(resolve('components/access/PublicLandingPage.tsx'), 'utf8');
    expect(reference).toContain('id="datumCanvas"');
    expect(source).toContain("querySelector<HTMLCanvasElement>('#datumCanvas')");
    expect(source).not.toContain('<iframe');
  });
});
