import { createContext } from 'react';
import type { AuthUser } from '../types/auth';
import type { LoginFormData } from '../schemas/authSchema';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
