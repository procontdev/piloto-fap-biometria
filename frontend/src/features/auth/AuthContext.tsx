import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../../types';
import { isOperadorRole, isSupervisorRole } from '../../utils/roles';

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isOperador: boolean;
  isSupervisor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      // Check expiration
      if (new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem('auth');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user && new Date(user.expiresAt) < new Date()) {
      logout();
    }
  }, [user]);

  const login = (userData: AuthUser) => {
    localStorage.setItem('auth', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isOperador: isOperadorRole(user?.role),
      isSupervisor: isSupervisorRole(user?.role),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
