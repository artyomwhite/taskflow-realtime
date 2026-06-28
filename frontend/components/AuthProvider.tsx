'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/api';
import { login as loginRequest, register as registerRequest } from '@/lib/auth-api';
import { disconnectSocket } from '@/lib/socket';
import type { LoginInput, RegisterInput, User } from '@/types/auth';

const USER_KEY = 'taskflow_user';

function readStoredUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function readSessionUser(): User | null {
  const token = getStoredToken();
  const storedUser = readStoredUser();
  return token && storedUser ? storedUser : null;
}

function persistUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearPersistedUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setUser(readSessionUser());
      setIsLoading(false);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await loginRequest(input);
    setStoredToken(response.accessToken);
    persistUser(response.user);
    setUser(response.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await registerRequest(input);
    setStoredToken(response.accessToken);
    persistUser(response.user);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    clearPersistedUser();
    disconnectSocket();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
