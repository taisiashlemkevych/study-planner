import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AuthUser, LoginResponse } from '../types/auth';
import type { LoginFormData } from '../schemas/authSchema';
import { AuthContext } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

const API_URL = 'https://dummyjson.com';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginFormData) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...credentials,
        expiresInMins: 30,
      }),
    });

    if (!response.ok) {
      throw new Error('Invalid username or password');
    }

    const data = (await response.json()) as LoginResponse;

    const userResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user information');
    }

    const currentUser = (await userResponse.json()) as AuthUser;

    setAccessToken(data.accessToken);
    setUser(currentUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      login,
      logout,
    }),
    [user, accessToken, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
