import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import Peer from 'simple-peer';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  
  const [callState, setCallState] = useState('idle'); // idle, calling, receiving, active
  const [callType, setCallType] = useState(null); // audio, video
  const [caller, setCaller] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  // Initialize call
  const initiateCall = async (receiverId, type = 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      
      setLocalStream(stream);
      setCallType(type);
      setReceiver({ id: receiverId });
      setCallState('calling');
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      const newPeer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
      });
      
      newPeer.on('signal', (data) => {
        socket.emit('call-offer', {
          to: receiverId,
          from: user.id,
          signal: data,
          type: type
        });
      });
      
      newPeer.on('stream', (remoteStream) => {
        console.log('Caller received remote stream:', remoteStream);
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      
      newPeer.on('connect', () => {
        console.log('Caller peer connected successfully');
        setCallState('active');
      });
      
      newPeer.on('error', (err) => {
        console.error('Caller peer connection error:', err);
      });
      
      setPeer(newPeer);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      endCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      const newPeer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream
      });
      
      newPeer.on('signal', (data) => {
        socket.emit('call-answer', {
          to: caller.id,
          from: user.id,
          signal: data
        });
      });
      
      newPeer.on('stream', (remoteStream) => {
        console.log('Received remote stream:', remoteStream);
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      
      newPeer.on('connect', () => {
        console.log('Peer connected successfully');
        setCallState('active');
      });
      
      newPeer.on('error', (err) => {
        console.error('Peer connection error:', err);
      });
      
      // Signal with the stored incoming call data
      if (window.incomingCallSignal) {
        newPeer.signal(window.incomingCallSignal);
        delete window.incomingCallSignal;
      }
      
      setPeer(newPeer);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      rejectCall();
    }
  };

  // Reject call
  const rejectCall = () => {
    socket.emit('call-reject', {
      to: caller.id,
      from: user.id
    });
    resetCallState();
  };

  // End call
  const endCall = () => {
    if (peer) {
      peer.destroy();
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    socket.emit('call-end', {
      to: callState === 'calling' ? receiver?.id : caller?.id,
      from: user.id
    });
    
    resetCallState();
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled;
      }
    }
    return false;
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled;
      }
    }
    return false;
  };

  // Reset call state
  const resetCallState = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peer && peer.destroy) {
      peer.destroy();
    }
    
    setCallState('idle');
    setCallType(null);
    setCaller(null);
    setReceiver(null);
    setLocalStream(null);
    setRemoteStream(null);
    setPeer(null);
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    // Clean up stored signal
    delete window.incomingCallSignal;
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('call-offer', ({ from, signal, type, callerInfo }) => {
      setCaller({ id: from, ...callerInfo });
      setCallType(type);
      setCallState('receiving');
      
      // Store the incoming signal to use when call is accepted
      window.incomingCallSignal = signal;
    });

    socket.on('call-answer', ({ signal }) => {
      if (peer && typeof peer.signal === 'function') {
        peer.signal(signal);
        setCallState('active');
      }
    });

    socket.on('call-reject', () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      resetCallState();
    });

    socket.on('call-end', () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peer && peer.destroy) {
        peer.destroy();
      }
      resetCallState();
    });

    return () => {
      socket.off('call-offer');
      socket.off('call-answer');
      socket.off('call-reject');
      socket.off('call-end');
    };
  }, [socket, peer, localStream]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peer && peer.destroy) {
        peer.destroy();
      }
    };
  }, []);

  const value = {
    callState,
    callType,
    caller,
    receiver,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};
