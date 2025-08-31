import React from 'react';
import { Phone, Video } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

export default function CallButtons({ userId, userName }) {
  const { initiateCall, callState } = useCall();

  const handleAudioCall = () => {
    if (callState === 'idle') {
      initiateCall(userId, 'audio');
    }
  };

  const handleVideoCall = () => {
    if (callState === 'idle') {
      initiateCall(userId, 'video');
    }
  };

  const isDisabled = callState !== 'idle';

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleAudioCall}
        disabled={isDisabled}
        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={`Audio call ${userName}`}
      >
        <Phone className="w-5 h-5" />
      </button>
      
      <button
        onClick={handleVideoCall}
        disabled={isDisabled}
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={`Video call ${userName}`}
      >
        <Video className="w-5 h-5" />
      </button>
    </div>
  );
}
