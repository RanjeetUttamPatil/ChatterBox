import React, { useContext, useRef, useEffect } from 'react';
import { VideoCallContext } from '../../context/VideoCallContext';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, User } from 'lucide-react';

const VideoCall = () => {
  const {
    inCall,
    isCalling,
    incomingCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    otherUser,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useContext(VideoCallContext);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Incoming Call Popup
  if (incomingCall && !inCall) {
    const caller = incomingCall.callerInfo || {};
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-[#FEEE91] border-4 border-black rounded-3xl p-8 flex flex-col items-center gap-6 animate-bounce-short">
          <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center overflow-hidden">
            {caller.profilePic ? (
              <img src={caller?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(caller?.fullName || caller?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`} alt={caller.fullName} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-black" />
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-black">Incoming Call!</h2>
            <p className="font-bold text-black/70 mt-1">{caller.fullName || "Someone"} is calling you...</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={acceptCall}
              className="saas-btn bg-green-500 p-4 rounded-2xl hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
              title="Accept Call"
            >
              <Phone size={28} fill="currentColor" />
            </button>
            <button
              onClick={rejectCall}
              className="saas-btn bg-red-500 p-4 rounded-2xl hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
              title="Reject Call"
            >
              <PhoneOff size={28} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Outgoing Call Screen
  if (isCalling && !inCall) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
        <div className="flex flex-col items-center gap-8">
          <div className="w-40 h-40 bg-[#FEEE91] border-4 border-black rounded-full flex items-center justify-center overflow-hidden animate-pulse">
            {otherUser?.profilePic ? (
              <img src={otherUser?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(otherUser?.fullName || otherUser?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`} alt={otherUser.fullName} className="w-full h-full object-cover" />
            ) : (
              <User size={80} className="text-black" />
            )}
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Calling {otherUser?.fullName || "..."}</h2>
            <p className="text-white/60 font-medium mt-2">Waiting for answer...</p>
          </div>
          <button
            onClick={endCall}
            className="saas-btn bg-red-500 p-6 rounded-full transition-transform hover:scale-110 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          >
            <PhoneOff size={32} fill="currentColor" />
          </button>
        </div>
      </div>
    );
  }

  // Active Call Screen
  if (!inCall) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Remote Video (Full Screen) */}
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-40 h-40 bg-gray-800 border-4 border-black rounded-full flex items-center justify-center overflow-hidden">
              {otherUser?.profilePic ? (
                <img src={otherUser?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(otherUser?.fullName || otherUser?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`} alt={otherUser.fullName} className="w-full h-full object-cover" />
              ) : (
                <User size={80} className="text-gray-600" />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-white text-2xl font-bold">{otherUser?.fullName}</h3>
              <p className="text-white/50 font-medium animate-pulse mt-2">Connecting media...</p>
            </div>
          </div>
        )}

        {/* Local Video (Floating) */}
        <div className="absolute bottom-24 right-6 w-40 h-56 md:w-64 md:h-48 bg-black border-4 border-white rounded-2xl overflow-hidden shadow-2xl">
          {isCameraOff ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <VideoOff size={32} className="text-white/50" />
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
            />
          )}
          <div className="absolute top-2 left-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white font-bold border border-white/30">
            YOU
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md border-4 border-black/20 rounded-3xl">
          <button
            onClick={toggleMute}
            className={`cartoon-btn p-4 rounded-2xl transition-colors ${
              isMuted ? 'bg-[#FF8C8C]' : 'bg-white'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button
            onClick={toggleCamera}
            className={`cartoon-btn p-4 rounded-2xl transition-colors ${
              isCameraOff ? 'bg-[#FF8C8C]' : 'bg-white'
            }`}
          >
            {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>

          <div className="w-px h-10 bg-black/20 mx-2" />

          <button
            onClick={endCall}
            className="cartoon-btn bg-[#FF8C8C] p-4 rounded-2xl hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          >
            <PhoneOff size={28} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
