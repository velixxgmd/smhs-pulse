import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextValue {
  isAdminAuthenticated: boolean;
  setAdminAuthenticated: (v: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const setAdminAuthenticated = (v: boolean) => setIsAdminAuthenticated(v);
  const logout = () => setIsAdminAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAdminAuthenticated, setAdminAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
