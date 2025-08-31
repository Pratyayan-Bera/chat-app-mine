import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(undefined);

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Create socket connection
      const newSocket = io('https://chill-chat-server.onrender.com', {
        withCredentials: true
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Connected to server:', newSocket.id);
        setIsConnected(true);
        
        // Join with user ID
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      // Cleanup on unmount or user change
      return () => {
        newSocket.close();
      };
    } else {
      // If no user, disconnect socket
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
    }
  }, [user]);

  const sendMessage = (receiverId, message, timestamp) => {
    if (socket && user) {
      socket.emit('sendMessage', {
        receiverId,
        senderId: user.id,
        message: {
          text: message.content,
          content: message.content,
          image: message.image,
          senderName: user.name,
          senderAvatar: user.avatar
        },
        timestamp
      });
    }
  };

  const value = {
    socket,
    onlineUsers,
    isConnected,
    sendMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
