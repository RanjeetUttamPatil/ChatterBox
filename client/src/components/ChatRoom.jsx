import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { RoomContext } from "../../context/roomContext";
import { AuthContext } from "../../context/authContext";
import { formatMessageTime } from "../lib/utils";
import { Image, Info, X, Clock, Trash2, Menu, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { ChatContext } from "../../context/chatContext";

function ChatRoom({ onOpenLeft }) {
  const { authUser, onlineUsers } = useContext(AuthContext);
  const {
    activeRoom,
    roomMessages,
    sendRoomMessage,
    isMember,
    isAdmin,
    typingUsers,
    presence,
    inviteFriend,
    handleJoinRequestAction,
    loadRoomMessages,
    deleteRoomMessage,
    summarizeRoom,
    socket
  } = useContext(RoomContext);

  const { users, getUsers } = useContext(ChatContext);

  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [remainMs, setRemainMs] = useState(0);
  const alertedRef = useRef({ five: false, one: false });
  const [showList, setShowList] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deletingMsgId, setDeletingMsgId] = useState(null);

  const scrollEnd = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (activeRoom?._id) {
      loadRoomMessages(activeRoom._id);
    }
  }, [activeRoom?._id, loadRoomMessages]);

  useEffect(() => {
    if (showList) getUsers();
  }, [showList, getUsers]);

  const creatorName = useMemo(() => {
    if (!activeRoom || !presence.members || !Array.isArray(presence.members)) return "Unknown";
    const creator = presence.members.find(m => String(m._id) === String(activeRoom.creatorId?._id || activeRoom.creatorId));
    return creator ? creator.fullName : "Unknown";
  }, [activeRoom, presence.members]);

  /* auto scroll */
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

  /* Timer logic */
  useEffect(() => {
    if (!activeRoom?.expiresAt) {
      setRemainMs(0);
      alertedRef.current = { five: false, one: false };
      return;
    }

    const tick = () => {
      const end = new Date(activeRoom.expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);
      setRemainMs(diff);

      const minutes = diff / 1000 / 60;

      if (minutes <= 5 && minutes > 4.6 && !alertedRef.current.five) {
        toast("Room expires in 5 minutes!", { icon: "⏳", style: { border: "4px solid #cfbf2eff" } });
        alertedRef.current.five = true;
      }

      if (minutes <= 1 && minutes > 0.6 && !alertedRef.current.one) {
        toast.error("Room expires in 1 minute!", { icon: "🚨" });
        alertedRef.current.one = true;
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeRoom?.expiresAt]);

  const remainText = useMemo(() => {
    const totalS = Math.floor(remainMs / 1000);
    const m = Math.floor(totalS / 60);
    const s = totalS % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [remainMs]);

  /* close popup */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeRoom) return;

    sendRoomMessage(activeRoom._id, { text: input.trim() });
    setInput("");
  };




  const handleImageSend = (e) => {
    const file = e.target.files[0];
    if (!file || !activeRoom) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      sendRoomMessage(activeRoom._id, { image: reader.result });
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ---------- NO ROOM ---------- */

  if (!activeRoom) {
    return (
      <div className="cartoon-panel_3 flex items-center justify-center h-full relative overflow-hidden">

        <button
          type="button"
          onClick={onOpenLeft}
          className="absolute top-4 left-4 cartoon-btn p-2 md:hidden"
          aria-label="Open rooms sidebar"
        >
          <Menu size={24} />
        </button>

        <p className="text-xl font-extrabold">
          Select a room
        </p>

      </div>
    );
  }

  return (
    <div className="cartoon-panel_3 flex flex-col h-full relative overflow-hidden bg-white">

      {/* HEADER */}

      <div className="flex items-center gap-1.5 sm:gap-3 border-b-4 border-black p-2 sm:p-4 relative bg-[#F5F3FF]">

        <button
          type="button"
          onClick={onOpenLeft}
          className="cartoon-btn p-1.5 sm:p-2 md:hidden"
          aria-label="Back to rooms"
        >
          <X size={16} />
        </button>

        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-purple-400 border-2 border-black flex items-center justify-center font-black text-white shrink-0">
          {activeRoom.roomName?.[0]?.toUpperCase()}
        </div>

        <div className="flex flex-col min-w-0 flex-1 sm:flex-none max-w-[100px] xs:max-w-[150px] sm:max-w-none">
          <p className="font-extrabold text-sm sm:text-lg truncate leading-tight">
            {activeRoom.roomName}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              {presence.present?.length || 0} online
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {activeRoom.expiresAt && (
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[9px] sm:text-xs font-semibold shadow-sm transition-all
             ${remainMs < 60000
                  ? "bg-red-100 text-red-700 border-red-400 animate-pulse"
                  : "bg-yellow-100 text-yellow-800 border-yellow-600"
                }`}
            >
              <Clock size={10} className="flex-shrink-0 sm:size-3" />
              <span className="whitespace-nowrap hidden sm:inline">Expires</span>
              <span className="font-bold">{remainText}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowList((v) => !v)}
                disabled={activeRoom.maxMembers && activeRoom.members?.length >= activeRoom.maxMembers}
                className={`saas-btn p-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black uppercase transition-all active:scale-95 ${activeRoom.maxMembers && activeRoom.members?.length >= activeRoom.maxMembers
                  ? "bg-gray-200 text-red-500 cursor-not-allowed shadow-none"
                  : "bg-[#A1EEBD] text-black border-2 border-black"
                  }`}
                aria-label="Invite Members"
              >
                <span className="hidden sm:inline">Add Members</span>
                <span className="sm:hidden flex items-center gap-1">
                   <Users size={14} /> 
                   <span>+</span>
                </span>
              </button>
            )}
          </div>
        </div>


        {/* ROOM MENU */}

        {showMenu && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowMenu(false)}
              role="presentation"
              aria-hidden="true"
            />

            <div
              ref={menuRef}
              className="absolute top-16 right-4 w-64 bg-white border-4 border-black rounded-xl shadow-xl p-4 flex flex-col gap-3 z-50 animate-fadeIn"
              role="dialog"
              aria-modal="true"
              aria-label="Room actions menu"
              tabIndex={-1}
            >

              <div className="flex flex-col items-center gap-2 pb-2 border-b-2 border-black">

                <div className="w-16 h-16 rounded-full bg-purple-400 border border-black flex items-center justify-center font-bold text-lg">
                  {activeRoom.roomName?.[0]}
                </div>

                <p className="font-extrabold">
                  {activeRoom.roomName}
                </p>

                <p className="text-sm text-gray-700 text-center">
                  {activeRoom.description || "No description"}
                </p>

              </div>

              <p className="text-sm font-bold">
                Members: {presence.present?.length || 0}
              </p>

              

            </div>
          </>
        )}


        {showList && (
          <div
            className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center"
            onClick={() => setShowList(false)}
            role="presentation"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-80 bg-white border-4 border-black rounded-xl shadow-xl p-5 flex flex-col gap-4 max-h-[70vh] animate-fadeIn"
              role="dialog"
              aria-modal="true"
              aria-label="Invite friends"
              tabIndex={-1}
            >
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <p className="font-extrabold text-lg">Invite Friends</p>
                <button
                  type="button"
                  onClick={() => setShowList(false)}
                  className="hover:bg-gray-100 rounded-full p-1"
                  aria-label="Close invite friends dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 no-scrollbar">
                {users
                  ?.filter(
                    (u) =>
                      u.friendStatus === "friend" &&
                      !(activeRoom.members || []).map(m => String(m._id || m)).includes(String(u._id))
                  )
                  .map((user) => {
                    const isOnline = onlineUsers?.includes(user._id);
                    const isSelected = selectedUsers.some(
                      (u) => u._id === user._id
                    );
                    const isInvited = (activeRoom.inviteTokens || []).some(
                      (i) => String(i.invitedUser?._id || i.invitedUser) === String(user._id) && !i.used && new Date(i.expiresAt) > new Date()
                    );

                    return (
                      <div
                        key={user._id}
                        onClick={() => {
                          if (isInvited) return;
                          setSelectedUsers((prev) =>
                            isSelected
                              ? prev.filter((u) => u._id !== user._id)
                              : [...prev, user]
                          );
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 border-black cursor-pointer transition-all ${isInvited
                          ? "opacity-50 cursor-not-allowed bg-gray-100"
                          : isSelected
                            ? "bg-purple-100 translate-y-[-2px]"
                            : "bg-[#FFF7CC] hover:bg-white"
                          }`}
                      >
                        <div className="relative">
                          <img
                            src={user?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.fullName || user?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-black"
                          />
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>
                          )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-extrabold truncate text-black">
                              {user.fullName}
                            </p>
                            {isInvited && (
                              <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter border border-blue-200">Pending</span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase">
                            {isOnline ? "Online" : "Offline"}
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center ${isSelected ? "bg-purple-500" : "bg-white"
                            }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {users?.filter(
                  (u) =>
                    u.friendStatus === "friend" &&
                    !activeRoom.members?.includes(u._id)
                ).length === 0 && (
                    <p className="text-center text-gray-400 font-bold py-10">
                      No friends to invite
                    </p>
                  )}
              </div>

              <div className="flex gap-2 pt-2 border-t-2 border-black">
                <button
                  type="button"
                  onClick={async () => {
                    for (const user of selectedUsers) {
                      await inviteFriend(activeRoom._id, user._id);
                    }
                    setSelectedUsers([]);
                    setShowList(false);
                  }}
                  disabled={selectedUsers.length === 0}
                  className={`flex-1 py-3 rounded-xl border-2 border-black font-extrabold transition-all ${selectedUsers.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#A1EEBD] text-black "
                    }`}
                >
                  Send ({selectedUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUsers([]);
                    setShowList(false);
                  }}
                  className="px-5 py-3 rounded-xl border-2 border-black bg-white font-extrabold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* MESSAGES AREA */}

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 bg-[#FEEE91]/10 no-scrollbar messages-area">

        {roomMessages.map((msg, index) => {
          const isMe = String(msg.senderId?._id || msg.senderId) === String(authUser?._id);
          const sender = (presence.members || []).find(m => String(m._id) === String(msg.senderId?._id || msg.senderId))
            || (users || []).find(u => String(u._id) === String(msg.senderId?._id || msg.senderId));

          // Date separator logic
          const msgDate = new Date(msg.createdAt).toDateString();
          const prevMsgDate = index > 0 ? new Date(roomMessages[index - 1].createdAt).toDateString() : null;
          const showDateSeparator = msgDate !== prevMsgDate;

          if (msg.system) {
            return (
              <React.Fragment key={msg._id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 border-2 border-black rounded-full px-4 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                )}
                <div className="flex justify-center">
                  <span className="bg-gray-100 border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    {msg.text}
                  </span>
                </div>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={msg._id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 border-2 border-black rounded-full px-4 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              )}
              
              <div className={`flex flex-col mb-4 ${isMe ? "items-end" : "items-start"}`}>
                
                {/* 1. PIC + NAME */}
                <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <img
                    src={isMe ? authUser?.profilePic || "https://api.dicebear.com/9.x/initials/svg?seed=U&backgroundColor=8B5CF6" : sender?.profilePic || "https://api.dicebear.com/9.x/initials/svg?seed=U&backgroundColor=8B5CF6"}
                    alt={(isMe ? authUser?.fullName : sender?.fullName) || "User"}
                    className="w-8 h-8 rounded-full border-2 border-black object-cover"
                  />
                  <span className="text-[10px] font-black uppercase text-purple-600">
                    {isMe ? "You" : (sender?.fullName || "Member")}
                  </span>
                </div>

                {/* 2. MESSAGE */}
                <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} group relative max-w-[85%] sm:max-w-[80%]`}>
                  {msg.isDeletedForEveryone ? (
                   <div
                     className={`
                       border-2 sm:border-4 border-black
                       rounded-2xl sm:rounded-3xl
                       px-3 py-1.5 sm:px-4 sm:py-2
                       font-bold text-sm sm:text-base italic text-gray-500
                       ${isMe ? "rounded-br-none bg-gray-100" : "rounded-bl-none bg-gray-100"}
                     `}
                   >
                     🚫 This message was deleted
                   </div>
                  ) : msg.image ? (
                    <img
                      src={msg.image || `https://api.dicebear.com/9.x/initials/svg?seed=Image&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                      alt="Room"
                      className="max-w-full sm:max-w-[250px] rounded-xl border-2 sm:border-4 border-black "
                    />
                  ) : (
                    <div
                      className={`border-2 sm:border-4 border-black rounded-2xl sm:rounded-3xl px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-[13px] sm:text-base leading-tight sm:leading-normal ${isMe ? "rounded-br-none" : "rounded-bl-none"}`}
                      style={isMe ? { background: "var(--sent)" } : { background: "var(--received)" }}
                    >
                      {msg.text}
                    </div>
                  )}

                  {/* Actions (Delete) */}
                  {!msg.isDeletedForEveryone && (
                    <div className={`flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-6 sm:-left-8" : "-right-6 sm:-right-8"}`}>
                      <button
                        onClick={() => setDeletingMsgId(deletingMsgId === msg._id ? null : msg._id)}
                        className="p-1 text-red-500"
                        title="Delete message"
                      >
                        <Trash2 size={12} sm:size={14} />
                      </button>
                    </div>
                  )}

                  {/* DELETE OPTIONS DROPDOWN */}
                  {deletingMsgId === msg._id && !msg.isDeletedForEveryone && (
                     <div className={`absolute top-full mt-1 ${isMe ? "right-0" : "left-0"} z-20 bg-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-1 flex flex-col gap-1 w-32 overflow-hidden`}>
                       <button onClick={() => { deleteRoomMessage(msg._id, "forMe"); setDeletingMsgId(null); }} className="text-[10px] font-bold hover:bg-gray-200 p-1 text-left w-full rounded">Delete for me</button>
                       {(isMe || isAdmin) && <button onClick={() => { deleteRoomMessage(msg._id, "forEveryone"); setDeletingMsgId(null); }} className="text-[10px] font-bold hover:bg-red-100 text-red-600 p-1 text-left w-full rounded">Delete for everyone</button>}
                       <button onClick={() => setDeletingMsgId(null)} className="text-[10px] font-bold hover:bg-gray-100 p-1 text-left w-full rounded text-gray-500">Cancel</button>
                     </div>
                  )}
                </div>

                {/* 3. TIME */}
                <p className={`text-[9px] font-black mt-1 ${isMe ? "text-right mr-1" : "text-left ml-1"} opacity-70`}>
                  {formatMessageTime(msg.createdAt)}
                </p>

              </div>
            </React.Fragment>
          );
        })}

        <div ref={scrollEnd} />
      </div>

      {/* TYPING */}
      {Object.entries(typingUsers)
        .filter(([id, v]) => v && id !== authUser?._id)
        .map(([id]) => {
          const user =
            activeRoom?.members?.find(
              (m) => String(m._id) === String(id)
            ) ||
            users?.find((u) => String(u._id) === String(id));

          const name = user?.fullName || "Someone";

          return (
            <div
              key={id}
              className="px-4 pb-1 text-xs italic font-bold text-purple-600 flex items-center gap-2"
            >
              <span>{name} is typing</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          );
        })}

      {/* INPUT */}

      <form
        onSubmit={handleSendMessage}
        className="border-t-4 border-black p-3 flex gap-2 items-center"
      >

        <label
          htmlFor="imageUpload"
          className="saas-btn bg-[var(--primary)] text-white px-3 cursor-pointer"
          aria-label="Upload image"
        >
          <Image size={18} />
        </label>

        <input
          id="imageUpload"
          type="file"
          hidden
          onChange={handleImageSend}
        />
        <input
          className="cartoon-input flex-1"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);

            if (!socket || !activeRoom) return;

            socket.emit("room:typing", {
              roomId: activeRoom._id,
              userId: authUser._id,
              typing: true
            });

            clearTimeout(window.typingTimeout);

            window.typingTimeout = setTimeout(() => {
              socket.emit("room:typing", {
                roomId: activeRoom._id,
                userId: authUser._id,
                typing: false
              });
            }, 1500);
          }}
          placeholder="Type a message"
        />

        <button className="saas-btn bg-green-500 text-white" type="submit">
          Send
        </button>

      </form>

    </div>
  );
}

export default ChatRoom;