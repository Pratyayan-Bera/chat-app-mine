import React, { useState, useEffect } from 'react';
import UserListSidebar from '../components/user/UserListSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ProfileSettingsModal from '../components/profile/ProfileSettingsModal';
import IncomingCallModal from '../components/call/IncomingCallModal';
import VideoCallWindow from '../components/call/VideoCallWindow';
import AudioCallWindow from '../components/call/AudioCallWindow';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import CallButtons from '../components/call/CallButtons';

export default function ChatPage({ currentUser, onUpdateProfile }) {
  const { logout, getAllUsers } = useAuth();
  const { getMessages, sendMessage, getCachedMessages, loading: messageLoading, onlineUsers, messages: contextMessages } = useMessage();
  const [activeUser, setActiveUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

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
    
    // On mobile, show chat area when user is selected
    if (isMobileView) {
      setShowChatOnMobile(true);
    }
    
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

  const handleBackToUserList = () => {
    setShowChatOnMobile(false);
    if (isMobileView) {
      setActiveUser(null);
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
      {/* Mobile: Show sidebar or chat based on state */}
      {isMobileView ? (
        <>
          {/* User List - Hidden when chat is open on mobile */}
          <div className={`${showChatOnMobile ? 'hidden' : 'flex'} w-full flex-col`}>
            <UserListSidebar
              users={users}
              activeUser={activeUser}
              onUserClick={handleUserClick}
              onSettingsClick={() => setIsProfileModalOpen(true)}
              onLogout={logout}
              currentUser={currentUser}
              isMobile={true}
            />
          </div>
          
          {/* Chat Window - Shown when user is selected on mobile */}
          {showChatOnMobile && activeUser && (
            <div className="w-full flex flex-col">
              {/* Mobile Chat Header with Back Button */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={handleBackToUserList}
                    className="mr-3 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={activeUser.avatar || `https://res.cloudinary.com/dnkanjycm/image/upload/v1756564418/istockphoto-1337144146-612x612_baqolf.jpg`}
                    alt={activeUser.name || activeUser.fullName}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{activeUser.name || activeUser.fullName}</h3>
                    <p className="text-sm text-gray-500">
                      {activeUser.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                {/* Call Buttons for Mobile */}
                <CallButtons 
                  userId={activeUser._id || activeUser.id} 
                  userName={activeUser.fullName || activeUser.name} 
                />
              </div>
              <ChatWindow
                user={activeUser}
                messages={messages}
                onSendMessage={handleSendMessage}
                isMobile={true}
              />
            </div>
          )}
        </>
      ) : (
        /* Desktop: Show both sidebar and chat */
        <>
          <UserListSidebar
            users={users}
            activeUser={activeUser}
            onUserClick={handleUserClick}
            onSettingsClick={() => setIsProfileModalOpen(true)}
            onLogout={logout}
            currentUser={currentUser}
            isMobile={false}
          />
          
          {activeUser ? (
            <ChatWindow
              user={activeUser}
              messages={messages}
              onSendMessage={handleSendMessage}
              isMobile={false}
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
        </>
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