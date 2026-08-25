import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  authenticatedFetch,
  authenticatedHeaders,
  clearAccessToken,
  refreshAccessToken,
  setAccessToken,
} from './auth-session';

afterEach(() => {
  clearAccessToken();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('in-memory authentication session', () => {
  it('adds and clears bearer authentication without browser storage', () => {
    setAccessToken('access-one');
    expect(authenticatedHeaders()).toEqual({ Authorization: 'Bearer access-one' });
    clearAccessToken();
    expect(authenticatedHeaders()).toEqual({});
  });

  it('includes credentials and bearer authentication on API requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('access-two');

    await authenticatedFetch('https://api.architex.co.za/api/v1/projects', { headers: { Accept: 'application/json' } });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.architex.co.za/api/v1/projects');
    expect(init.credentials).toBe('include');
    const headers = new Headers(init.headers);
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Authorization')).toBe('Bearer access-two');
  });

  it('restores an access token through the refresh cookie', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ access_token: 'rotated' }), { status: 200 })));
    await expect(refreshAccessToken()).resolves.toBe(true);
    expect(authenticatedHeaders()).toEqual({ Authorization: 'Bearer rotated' });
  });

  it('uses the audited invitation endpoint', () => {
    const source = readFileSync(resolve('lib/api.ts'), 'utf8');
    expect(source).toContain("apiPost<{ invitation: ApiInvitationRecord }>('/users/invitations'");
  });
});
