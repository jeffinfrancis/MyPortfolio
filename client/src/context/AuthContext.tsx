import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, tokenStore, ApiError, AUTH_EXPIRED_EVENT } from '../../services/api';
import type { User } from '../types';

type SignUpInput = { firstName: string; lastName: string; email: string; password: string };
type AuthResponse = { token: string; user: User };

type AuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  // True while a stored token is being checked on first load.
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: SignUpInput) => Promise<User>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => tokenStore.get() !== null);

  // On first load, if a token is stored, ask the server who it belongs to.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) return;
    let cancelled = false;

    api
      .get<{ user: User }>('/auth/me')
      .then((data) => {
        if (!cancelled && tokenStore.get() === token) setUser(data.user);
      })
      .catch((error) => {
        // A 401 already cleared the token (see api.ts). Any other failure keeps it.
        if (!cancelled && tokenStore.get() === token && !(error instanceof ApiError)) {
          tokenStore.clear();
        }
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const accept = useCallback(({ token, user: nextUser }: AuthResponse) => {
    tokenStore.set(token);
    setUser(nextUser);
    setLoading(false);
    return nextUser;
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) =>
      accept(await api.post<AuthResponse>('/auth/signin', { email, password })),
    [accept]
  );

  const signUp = useCallback(
    async (input: SignUpInput) => accept(await api.post<AuthResponse>('/auth/signup', input)),
    [accept]
  );

  const signOut = useCallback(() => {
    void api.post('/auth/signout').catch(() => undefined);
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAdmin: user?.role === 'admin', loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}