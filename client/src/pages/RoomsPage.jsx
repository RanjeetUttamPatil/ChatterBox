import React, { useContext, useEffect } from "react";
import { RoomContext } from "../../context/roomContext";
import { Users } from "lucide-react";
import ChatRoom from "../components/ChatRoom";
import RoomSidebar from "../components/RoomSidebar";


function RoomsPage() {
  const {
    activeRoom,
    setActiveRoom
  } = useContext(RoomContext);

  useEffect(() => {
    console.log("RoomsPage: Active room changed to ->", activeRoom?.roomName || "NULL");
  }, [activeRoom]);

  return (
    <div className="h-full w-full flex bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      
      {/* SIDEBAR */}
      <div
        className={`h-full w-full md:w-1/3 border-r border-[var(--border)] transition-all ${activeRoom ? "hidden md:block" : "block"}`}
      >
        <RoomSidebar onClose={() => {}} />
      </div>

      {/* CHAT CONTAINER */}
      <div className={`h-full flex-1 flex flex-col transition-all ${!activeRoom ? "hidden md:flex" : "flex"}`}>
        {activeRoom ? (
          <div className="flex-1 h-full overflow-hidden relative">
            <ChatRoom onOpenLeft={() => {
              console.log("RoomsPage: Closing room");
              setActiveRoom(null);
            }} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="saas-panel w-full max-w-lg p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-[var(--border)] flex items-center justify-center animate-pulse bg-[var(--card)]/60">
                <Users size={44} className="text-[var(--primary)]" />
              </div>
              <p className="text-xl md:text-2xl font-black tracking-tight text-[var(--text)]">
                Select or create a room to start chatting
              </p>
              <p className="text-sm font-bold text-[var(--muted)]">
                Your room list will appear on the left.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default RoomsPage;
