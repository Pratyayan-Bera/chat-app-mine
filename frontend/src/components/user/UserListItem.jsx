import React from 'react';
import UserAvatar from './UserAvatar';

export default function UserListItem({ user, onClick, active = false }) {
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Recently';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={() => onClick(user)}
      className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 ${
        active ? 'bg-blue-50 border-r-2 border-blue-500' : ''
      }`}
    >
      <UserAvatar
        src={user.profilePicture || user.avatar}
        alt={user.fullName || user.name}
        online={user.isOnline || user.online}
        size="md"
      />
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{user.fullName || user.name}</p>
        <p className="text-xs text-gray-500">
          {(user.isOnline || user.online) ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
        </p>
      </div>
    </div>
  );
}