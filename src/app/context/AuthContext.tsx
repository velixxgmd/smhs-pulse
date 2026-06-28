import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextValue {
  isAdminAuthenticated: boolean;
  setAdminAuthenticated: (v: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem("smhs_admin_logged_in") === "true";
  });

  const setAdminAuthenticated = (v: boolean) => {
    setIsAdminAuthenticated(v);

    if (v) {
      sessionStorage.setItem("smhs_admin_logged_in", "true");
    } else {
      sessionStorage.removeItem("smhs_admin_logged_in");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("smhs_admin_logged_in");
    setIsAdminAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminAuthenticated,
        setAdminAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}