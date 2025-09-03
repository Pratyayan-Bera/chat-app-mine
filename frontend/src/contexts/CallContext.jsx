// 



import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const CallContext = createContext(undefined);

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}

export function CallProvider({ children }) {
  const { user } = useAuth();
  const { socket, sendCallSignal, sendCallReject, sendCallEnd } = useSocket();

  const [call, setCall] = useState(null); // active call info
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const peerConnection = useRef(null);

  // STUN servers (add TURN later for production)
  const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  // 🔹 Start a call
  const startCall = async (receiverId, type = 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });

      setLocalStream(stream);

      const pc = new RTCPeerConnection(servers);
      peerConnection.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendCallSignal(receiverId, event.candidate, 'candidate');
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendCallSignal(receiverId, offer, 'offer');

      setCall({ isCaller: true, with: receiverId, type });
    } catch (err) {
      console.error('Error starting call:', err);
    }
  };

  // 🔹 Accept a call
  const acceptCall = async (callerId, offer, type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });

      setLocalStream(stream);

      const pc = new RTCPeerConnection(servers);
      peerConnection.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendCallSignal(callerId, event.candidate, 'candidate');
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendCallSignal(callerId, answer, 'answer');

      setCall({ isCaller: false, with: callerId, type });
      setIsReceivingCall(false);
    } catch (err) {
      console.error('Error accepting call:', err);
    }
  };

  // 🔹 End call
  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCall(null);

    if (call?.with) {
      sendCallEnd(call.with);
    }
  };

  // 🔹 Reject call
  const rejectCall = (callerId) => {
    sendCallReject(callerId);
    setIsReceivingCall(false);
  };

  // 🔹 Handle incoming signals
  useEffect(() => {
    if (!socket) return;

    socket.on('call-signal', async ({ from, signal, type }) => {
      try {
        if (type === 'offer') {
          setIsReceivingCall(true);
          setCall({ isCaller: false, with: from, type: signal.type });
          // Offer will be processed when user clicks "accept"
        } else if (type === 'answer') {
          await peerConnection.current?.setRemoteDescription(
            new RTCSessionDescription(signal)
          );
        } else if (type === 'candidate') {
          await peerConnection.current?.addIceCandidate(new RTCIceCandidate(signal));
        }
      } catch (err) {
        console.error('Error handling signal:', err);
      }
    });

    socket.on('call-reject', ({ from }) => {
      console.log('Call rejected by', from);
      endCall();
    });

    socket.on('call-end', ({ from }) => {
      console.log('Call ended by', from);
      endCall();
    });

    return () => {
      socket.off('call-signal');
      socket.off('call-reject');
      socket.off('call-end');
    };
  }, [socket, call]);

  const value = {
    call,
    isReceivingCall,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
}
