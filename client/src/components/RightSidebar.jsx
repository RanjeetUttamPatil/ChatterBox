import React, { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../../context/chatContext";

function RightSidebar
({ open, onClose, user }) {
  const menuRef = useRef(null);

  const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    blockUser,
    unblockUser
  } = useContext(ChatContext);

  /* close when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!open || !user) return null;

  const status = user.friendStatus;

  return (
    <div
      className="absolute top-16 right-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Friend actions menu"
    >
      <div
        ref={menuRef}
        className="w-64 bg-white border-4 border-black rounded-2xl shadow-2xl p-4 flex flex-col gap-3 animate-fadeIn"
      >
        {/* PROFILE */}
        <div className="flex flex-col items-center gap-2 pb-3 border-b-2 border-black">
          <img
            src={user?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.fullName || user?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
            className="w-20 h-20 rounded-full border-1 object-cover border-black"
            alt="profile"
          />

          <p className="font-extrabold text-lg text-center">
            {user.fullName}
          </p>

          <p className="text-xs text-gray-500 text-center px-2">
            {user.bio || "No bio available"}
          </p>
        </div>

        {/* ACTIONS */}
        {status === "none" && (
          <button
            type="button"
            onClick={() => sendFriendRequest(user._id)}
            className="cartoon-btn bg-[#A1EEBD]"
          >
            Add Friend
          </button>
        )}

        {status === "received" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => acceptFriendRequest(user._id)}
              className="cartoon-btn w-full bg-[#A1EEBD]"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => rejectFriendRequest(user._id)}
              className="cartoon-btn w-full bg-[#FF8C8C]"
            >
              Reject
            </button>
          </div>
        )}

        {status === "friend" && (
          <button
            type="button"
            onClick={() => unfriend(user._id)}
            className="cartoon-btn bg-[#FFD93D]"
          >
            Unfriend
          </button>
        )}

        {status === "blocked" ? (
          <button
            type="button"
            onClick={() => unblockUser(user._id)}
            className="cartoon-btn bg-[#A1EEBD]"
          >
            Unblock
          </button>
        ) : (
          <button
            type="button"
            onClick={() => blockUser(user._id)}
            className="cartoon-btn bg-[#FF8C8C]"
          >
            Block
          </button>
        )}
      </div>
    </div>
  );
}

export default RightSidebar
;