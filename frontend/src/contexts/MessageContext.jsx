import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const MessageContext = createContext(undefined);

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}

export function MessageProvider({ children }) {
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();
  const { socket, sendMessage: socketSendMessage, onlineUsers } = useSocket();

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (message) => {
        const senderId = message.sender.id;
        setMessages(prev => ({
          ...prev,
          [senderId]: [...(prev[senderId] || []), message]
        }));
        
        // Show toast notification for new message
        showToast(`New message from ${message.sender.name}`, 'success');
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [socket, showToast]);

  // Get messages between current user and another user
  const getMessages = async (otherUserId) => {
    if (!user || !otherUserId) return [];

    setLoading(true);
    try {
      // Note: Your backend expects POST with body, not GET with query params
      const response = await axios.post('/message/getMessages', {
        senderId: user.id,
        receiverId: otherUserId
      });

      // Also get messages where current user is receiver and other user is sender
      const response2 = await axios.post('/message/getMessages', {
        senderId: otherUserId,
        receiverId: user.id
      });

      // Combine and sort messages by timestamp
      const allMessages = [...response.data, ...response2.data];
      const sortedMessages = allMessages.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );

      // Transform backend data to frontend format
      const transformedMessages = sortedMessages.map(msg => ({
        id: msg._id,
        content: msg.text,
        image: msg.image,
        sender: {
          id: msg.senderId,
          name: msg.senderId === user.id ? user.name : 'Other User', // You might want to fetch user names
          avatar: msg.senderId === user.id ? user.avatar : ''
        },
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isOwn: msg.senderId === user.id
      }));

      // Cache messages for this conversation
      setMessages(prev => ({
        ...prev,
        [otherUserId]: transformedMessages
      }));

      return transformedMessages;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      showToast('Failed to load messages', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (receiverId, content, file = null) => {
    if (!user || !receiverId || (!content && !file)) return null;

    const timestamp = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let fileUrl = '';
    let fileData = null;

    // Handle file upload if present
    if (file) {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        fileUrl = await base64Promise;
        fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl
        };
      } catch (error) {
        console.error('Error processing file:', error);
        showToast('Failed to process file', 'error');
        return null;
      }
    }

    const newMessage = {
      id: Date.now().toString(),
      content,
      image: fileUrl,
      file: fileData,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      timestamp,
      isOwn: true
    };

    try {
      // Upload file to Cloudinary if present
      let cloudinaryUrl = '';
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await axios.post('/file/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          cloudinaryUrl = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          showToast('File upload failed', 'error');
          return null;
        }
      }

      // Save to database
      const response = await axios.post('/message/sendMessage', {
        senderId: user.id,
        receiverId,
        text: content,
        image: cloudinaryUrl || fileUrl
      });

      // Send via socket for real-time delivery
      if (socketSendMessage) {
        socketSendMessage(receiverId, newMessage, timestamp);
      }

      // Update local messages cache
      setMessages(prev => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), newMessage]
      }));

      return newMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Failed to send message', 'error');
      throw error;
    }
  };

  // Get cached messages for a conversation
  const getCachedMessages = (userId) => {
    return messages[userId] || [];
  };

  const value = {
    messages,
    getMessages,
    sendMessage,
    getCachedMessages,
    loading,
    onlineUsers
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}
