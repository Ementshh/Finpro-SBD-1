import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL, parseJsonResponse } from '../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'teacher' | 'student' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
    nisn?: string,
    teacherInfo?: unknown
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isUsableJwt = (token: string): boolean => {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Validate payload JSON + optional exp
    try {
      const payloadBase64Url = parts[1];
      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as { exp?: unknown };

      if (typeof payload.exp === 'number') {
        return payload.exp * 1000 > Date.now();
      }
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    // Only restore a session if we have both user + token.
    // This prevents old/demo cached users from being treated as authenticated.
    if (storedUser && storedToken && isUsableJwt(storedToken)) {
      try {
        const parsed = JSON.parse(storedUser) as unknown;
        if (
          parsed &&
          typeof parsed === 'object' &&
          'id' in parsed &&
          'name' in parsed &&
          'email' in parsed &&
          'role' in parsed
        ) {
          setUser(parsed as User);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch {
        // If an old build stored a non-JSON value (e.g. "undefined"), don't crash the app.
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (storedUser || storedToken) {
      // Partial/stale auth state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!password) {
        throw new Error('Password is required');
      }

      // Always start from a clean state so a previous cached user (e.g. demo) can't persist.
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseJsonResponse<{ user?: User; token?: string; error?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.user) {
        throw new Error('Login failed: missing user payload');
      }

      if (!data.token) {
        throw new Error('Login failed: missing token');
      }

      // Safety: if the server returns a different user than requested, reject it.
      if ((data.user.email || '').toLowerCase() !== email.toLowerCase()) {
        throw new Error('Login failed: unexpected user returned by server');
      }

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      // Prevent stale sessions (e.g. leftover "demo" user) from masking a failed login.
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    nisn?: string,
    teacherInfo?: unknown
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, nisn, teacherInfo }),
      });

      const data = await parseJsonResponse<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const loginData = await parseJsonResponse<{ user?: User; token?: string; error?: string }>(loginResponse);
      if (!loginResponse.ok) {
        throw new Error(loginData.error || 'Auto-login after registration failed');
      }

      if (!loginData.user) {
        throw new Error('Auto-login after registration failed: missing user payload');
      }

      if (!loginData.token) {
        throw new Error('Auto-login after registration failed: missing token');
      }

      if ((loginData.user.email || '').toLowerCase() !== email.toLowerCase()) {
        throw new Error('Auto-login after registration failed: unexpected user returned by server');
      }

      setUser(loginData.user);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      localStorage.setItem('token', loginData.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
