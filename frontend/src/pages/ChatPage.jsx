import React, { useState } from 'react';
import { useEffect } from 'react';
import UserListSidebar from '../components/user/UserListSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ProfileSettingsModal from '../components/profile/ProfileSettingsModal';
import IncomingCallModal from '../components/call/IncomingCallModal';
import VideoCallWindow from '../components/call/VideoCallWindow';
import AudioCallWindow from '../components/call/AudioCallWindow';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { MessageCircle } from 'lucide-react';

export default function ChatPage({ currentUser, onUpdateProfile }) {
  const { logout, getAllUsers } = useAuth();
  const { getMessages, sendMessage, getCachedMessages, loading: messageLoading, onlineUsers, messages: contextMessages } = useMessage();
  const [activeUser, setActiveUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch users from backend and update online status
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        // Update users with online status
        const usersWithStatus = fetchedUsers.map(user => ({
          ...user,
          online: onlineUsers.includes(user.id)
        }));
        setUsers(usersWithStatus);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [getAllUsers, onlineUsers]);

  // Update messages when context messages change for active user
  useEffect(() => {
    if (activeUser && contextMessages[activeUser.id]) {
      setMessages(contextMessages[activeUser.id]);
    }
  }, [contextMessages, activeUser]);

  const handleUserClick = async (user) => {
    setActiveUser(user);
    
    // First, show cached messages immediately for better UX
    const cachedMessages = getCachedMessages(user.id);
    setMessages(cachedMessages);
    
    // Then fetch fresh messages from backend
    try {
      const freshMessages = await getMessages(user.id);
      setMessages(freshMessages);
    } catch (error) {
      console.error('Failed to load messages for user:', user.id, error);
    }
  };

  const handleSendMessage = async (content, file = null) => {
    if (!activeUser || (!content.trim() && !file)) return;

    try {
      const newMessage = await sendMessage(activeUser.id, content, file);
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <UserListSidebar
        users={users}
        activeUser={activeUser}
        onUserClick={handleUserClick}
        onSettingsClick={() => setIsProfileModalOpen(true)}
        onLogout={logout}
        currentUser={currentUser}
      />
      
      {activeUser ? (
        <ChatWindow
          user={activeUser}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to ChatApp
            </h3>
            <p className="text-gray-500">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      )}

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={{ ...currentUser, email: currentUser.email || 'user@example.com' }}
        onUpdateProfile={onUpdateProfile}
      />

      {/* Call Components */}
      <IncomingCallModal />
      <VideoCallWindow />
      <AudioCallWindow />
    </div>
  );
}