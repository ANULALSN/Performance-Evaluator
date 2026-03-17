import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppContext } from '../context/AppContext';

const getSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  try {
    return new URL(apiUrl).origin;
  } catch {
    return apiUrl.replace('/api', '');
  }
};

const SOCKET_URL = getSocketURL();

export const useSocket = () => {
  const { user, token } = useAppContext();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token && user) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Socket connected');
        socketRef.current?.emit('join_room', user._id);
        if (user.role === 'admin') {
          socketRef.current?.emit('join_admin');
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [token, user]);

  return socketRef.current;
};
