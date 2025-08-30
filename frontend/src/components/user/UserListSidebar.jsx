import React, { useState, useMemo } from 'react';
import { Search, Settings, LogOut } from 'lucide-react';
import UserListItem from './UserListItem';

export default function UserListSidebar({ users, activeUser, onUserClick, onSettingsClick, onLogout, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    return users.filter(user => {
      const name = user.fullName || user.name || '';
      const email = user.email || '';
      const query = searchQuery.toLowerCase();
      
      return name.toLowerCase().includes(query) || 
             email.toLowerCase().includes(query);
    });
  }, [users, searchQuery]);
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserListItem
                key={user._id || user.id}
                user={user}
                onClick={onUserClick}
                active={activeUser?.id === user.id || activeUser?._id === user._id}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No users found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current User */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <img
            src={currentUser.avatar || `https://res.cloudinary.com/dnkanjycm/image/upload/v1756564418/istockphoto-1337144146-612x612_baqolf.jpg`}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}