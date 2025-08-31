import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Minimize2 } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

export default function VideoCallWindow() {
  const { 
    callState, 
    callType, 
    caller, 
    receiver, 
    localVideoRef, 
    remoteVideoRef, 
    endCall, 
    toggleMute, 
    toggleCamera 
  } = useCall();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (callState !== 'active' && callState !== 'calling') return null;

  const handleMute = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  const handleCamera = () => {
    const cameraOff = toggleCamera();
    setIsCameraOff(cameraOff);
  };

  const otherUser = caller || receiver;

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col ${isMinimized ? 'bottom-4 right-4 w-80 h-60 inset-auto rounded-lg' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <div className="flex items-center space-x-3">
          <img
            src={otherUser?.avatar || `https://res.cloudinary.com/dnkanjycm/image/upload/v1756564418/istockphoto-1337144146-612x612_baqolf.jpg`}
            alt={otherUser?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{otherUser?.name}</p>
            <p className="text-sm text-gray-300">
              {callState === 'calling' ? 'Calling...' : 'Connected'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
          {callType === 'video' && !isCameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Call Status Overlay */}
        {callState === 'calling' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-pulse mb-4">
                <Phone className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-lg">Calling {otherUser?.name}...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-900 flex items-center justify-center space-x-4">
        {callType === 'video' && (
          <button
            onClick={handleCamera}
            className={`p-3 rounded-full transition-colors ${
              isCameraOff 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
          >
            {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}
        
        <button
          onClick={handleMute}
          className={`p-3 rounded-full transition-colors ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
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
  );
}
