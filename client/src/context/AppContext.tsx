import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types';

interface AppContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('sipp_token');
    const storedUser = localStorage.getItem('sipp_user');
    
    if (storedToken && storedUser) {
      try {
        const decoded: any = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          logout();
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sipp_token', newToken);
    localStorage.setItem('sipp_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sipp_token');
    localStorage.removeItem('sipp_user');
    window.location.href = '/auth';
  };

  return (
    <AppContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
