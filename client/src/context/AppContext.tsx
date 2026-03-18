import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io, Socket } from 'socket.io-client';
import type { User } from '../types';

interface AppContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  socket: Socket | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

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

  // Socket Connection Management
  useEffect(() => {
    if (user && token) {
      const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const newSocket = io(serverUrl, {
        auth: { token }
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket Connected", newSocket.id);
        newSocket.emit("join_room", user._id);
        if (user.role === 'admin') {
          newSocket.emit("join_admin");
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [user, token]);

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
    <AppContext.Provider value={{ user, token, loading, socket, login, logout }}>
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
