import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

export default function IncomingCallModal() {
  const { callState, callType, caller, acceptCall, rejectCall } = useCall();

  if (callState !== 'receiving') return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <img
              src={caller?.avatar || `https://res.cloudinary.com/dnkanjycm/image/upload/v1756564418/istockphoto-1337144146-612x612_baqolf.jpg`}
              alt={caller?.name}
              className="w-20 h-20 rounded-full mx-auto object-cover"
            />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {caller?.name}
          </h3>
          
          <p className="text-gray-600 mb-6">
            Incoming {callType} call
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={rejectCall}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              title="Decline call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            
            <button
              onClick={acceptCall}
              className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
              title="Accept call"
            >
              {callType === 'video' ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
