import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { authReducer, initialAuthState } from './AuthProvider';

describe('authenticated workspace provider', () => {
  it('moves from restoration to authenticated profile and back to unauthenticated', () => {
    const profile = {
      user: { id: 'user-1', name: 'Owner', email: 'owner@architex.co.za', status: 'active' },
      organization: { id: 'org-1', name: 'Architex', slug: 'architex' },
      roles: ['organisation_admin'],
      project_memberships: [],
      active_role: 'organisation_admin',
      permissions: ['users.manage'],
    };
    const authenticated = authReducer(initialAuthState, { type: 'authenticated', profile });
    expect(authenticated).toEqual({ status: 'authenticated', profile, error: null });
    expect(authReducer(authenticated, { type: 'signed_out' })).toEqual({ status: 'unauthenticated', profile: null, error: null });
  });

  it('contains no browser-storage or query-string access bypass', () => {
    const source = readFileSync(resolve('components/access/AccessGateway.tsx'), 'utf8');
    expect(source).not.toContain('architex-v8-access');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain("get('workspace')");
    expect(source).toContain("status === 'authenticated'");
  });

  it('exposes user-visible session revocation from the authenticated gateway', () => {
    const source = readFileSync(resolve('components/access/AccessGateway.tsx'), 'utf8');
    expect(source).toContain('logout');
    expect(source).toContain('Sign out');
    expect(source).toContain('disabled={pending}');
  });
});
