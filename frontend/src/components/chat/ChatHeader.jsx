import React from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';
import UserAvatar from '../user/UserAvatar';
import CallButtons from '../call/CallButtons';

export default function ChatHeader({ user }) {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <UserAvatar
            src={user.avatar}
            alt={user.name}
            online={user.online}
            size="md"
          />
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">
              {user.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CallButtons userId={user._id || user.id} userName={user.fullName || user.name} />
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}