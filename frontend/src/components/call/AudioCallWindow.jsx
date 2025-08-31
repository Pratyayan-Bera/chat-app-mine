import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Minimize2 } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

export default function AudioCallWindow() {
  const { 
    callState, 
    callType, 
    caller, 
    receiver, 
    endCall, 
    toggleMute 
  } = useCall();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (callType !== 'audio' || (callState !== 'active' && callState !== 'calling')) return null;

  const handleMute = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  const otherUser = caller || receiver;

  return (
    <div className={`fixed bg-white shadow-2xl border border-gray-200 rounded-lg z-50 ${
      isMinimized 
        ? 'bottom-4 right-4 w-80 h-32' 
        : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={otherUser?.avatar || `https://res.cloudinary.com/dnkanjycm/image/upload/v1756564418/istockphoto-1337144146-612x612_baqolf.jpg`}
            alt={otherUser?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-900">{otherUser?.name}</p>
            <p className="text-sm text-gray-500">
              {callState === 'calling' ? 'Calling...' : 'Connected'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Minimize2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Call Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Avatar */}
        <div className="mb-4">
          <img
            src={otherUser?.avatar || `https://res.cloudinary.com/dnkanjycm/image/upload/v1756564418/istockphoto-1337144146-612x612_baqolf.jpg`}
            alt={otherUser?.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        </div>

        {/* Call Status */}
        <div className="text-center mb-6">
          <p className="font-medium text-gray-900">{otherUser?.name}</p>
          <p className="text-sm text-gray-500">
            {callState === 'calling' ? (
              <span className="flex items-center justify-center">
                <span className="animate-pulse mr-2">📞</span>
                Calling...
              </span>
            ) : (
              'Audio call in progress'
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            onClick={endCall}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
