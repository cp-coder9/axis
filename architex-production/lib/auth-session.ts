const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token && token.trim() ? token : null;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function authenticatedHeaders(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        clearAccessToken();
        return false;
      }
      const payload = (await response.json()) as { access_token?: unknown };
      if (typeof payload.access_token !== 'string' || payload.access_token === '') {
        clearAccessToken();
        return false;
      }
      setAccessToken(payload.access_token);
      return true;
    } catch {
      clearAccessToken();
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  for (const [name, value] of Object.entries(authenticatedHeaders())) headers.set(name, value);
  const requestInit: RequestInit = { ...init, credentials: 'include', headers };
  let response = await fetch(input, requestInit);
  const url = String(input);
  const isAuthBoundary = /\/auth\/(login|register|refresh|logout)$/.test(url);
  if (response.status === 401 && !isAuthBoundary && await refreshAccessToken()) {
    const retryHeaders = new Headers(init.headers);
    for (const [name, value] of Object.entries(authenticatedHeaders())) retryHeaders.set(name, value);
    response = await fetch(input, { ...init, credentials: 'include', headers: retryHeaders });
  }
  return response;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  } finally {
    clearAccessToken();
  }
}
