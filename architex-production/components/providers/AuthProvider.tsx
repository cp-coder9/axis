'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { authenticatedFetch, logout as revokeSession, refreshAccessToken, setAccessToken } from '@/lib/auth-session';

export type AuthProfile = {
  user: { id: string; name: string; email: string; status: string };
  organization: { id: string; name: string; slug: string };
  roles: string[];
  project_memberships: string[];
  active_role: string;
  permissions: string[];
};

export type AuthState = {
  status: 'restoring' | 'unauthenticated' | 'authenticated';
  profile: AuthProfile | null;
  error: string | null;
};

type AuthAction =
  | { type: 'restoring' }
  | { type: 'authenticated'; profile: AuthProfile }
  | { type: 'signed_out' }
  | { type: 'error'; message: string };

export const initialAuthState: AuthState = { status: 'restoring', profile: null, error: null };

export function authReducer(_state: AuthState, action: AuthAction): AuthState {
  if (action.type === 'restoring') return initialAuthState;
  if (action.type === 'authenticated') return { status: 'authenticated', profile: action.profile, error: null };
  if (action.type === 'error') return { status: 'unauthenticated', profile: null, error: action.message };
  return { status: 'unauthenticated', profile: null, error: null };
}

type RegistrationInput = { name: string; organization_name: string; email: string; password: string; role_key?: string; profile?: Record<string, string> };
type AuthContextValue = AuthState & {
  login(email: string, password: string): Promise<void>;
  register(input: RegistrationInput): Promise<{ status: string; verification_token?: string }>;
  logout(): Promise<void>;
  restore(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function responsePayload<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `Authentication failed (${response.status})`);
  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const loadProfile = useCallback(async (): Promise<AuthProfile> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/me`, { headers: { Accept: 'application/json' } });
    return responsePayload<AuthProfile>(response);
  }, []);

  const restore = useCallback(async () => {
    dispatch({ type: 'restoring' });
    if (!await refreshAccessToken()) {
      dispatch({ type: 'signed_out' });
      return;
    }
    try {
      dispatch({ type: 'authenticated', profile: await loadProfile() });
    } catch {
      await revokeSession();
      dispatch({ type: 'signed_out' });
    }
  }, [loadProfile]);

  useEffect(() => { void restore(); }, [restore]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    try {
      const payload = await responsePayload<{ access_token: string }>(response);
      setAccessToken(payload.access_token);
      dispatch({ type: 'authenticated', profile: await loadProfile() });
    } catch (error) {
      dispatch({ type: 'error', message: error instanceof Error ? error.message : 'Authentication failed' });
      throw error;
    }
  }, [loadProfile]);

  const register = useCallback(async (input: RegistrationInput) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return responsePayload<{ status: string; verification_token?: string }>(response);
  }, []);

  const logout = useCallback(async () => {
    await revokeSession();
    dispatch({ type: 'signed_out' });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ ...state, login, register, logout, restore }), [state, login, register, logout, restore]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
