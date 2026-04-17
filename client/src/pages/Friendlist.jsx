
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { Scan } from "lucide-react";

function Friendlist({ onClose }) {

  const { onlineUsers, axios } = useContext(AuthContext);

  const {
    users = [],
    getUsers,
    selectedUser,
    setSelectedUser,
    unseenMessages = {},
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    blockUser,
    unblockUser
  } = useContext(ChatContext);

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleShowQR = async () => {
    setShowQR(true);
    try {
      const { data } = await axios.post("/api/friends/qr-token");
      if (data?.success && data.token) {
        setQrUrl(`${window.location.origin}/scan?t=${data.token}`);
      }
    } catch {
      setQrUrl(`${window.location.origin}`);
    }
  };

  /* ---------------- FILTER USERS ---------------- */

  const filteredUsers = users
    .filter((u) => u.friendStatus !== "friend")
    .filter((u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase())
    )
    .filter((u) => {
      if (filter === "pending")
        return u.friendStatus === "sent" || u.friendStatus === "received";
      if (filter === "blocked") return u.friendStatus === "blocked";
      return true;
    })
    .filter((u) => {
      if (!onlineOnly) return true;
      return onlineUsers?.includes(u._id);
    });

  return (
    <div className="h-full w-full flex bg-[var(--bg)] text-[var(--text)] overflow-hidden">

      <div className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 h-full w-full overflow-hidden bg-[var(--bg)]">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--primary)]">
            Connect
          </h1>

          {/* FILTER BUTTONS */}

          <div className="flex gap-2 flex-wrap w-full sm:w-auto">

            {["all", "pending", "blocked"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-full border-2 font-bold text-xs sm:text-sm transition
              ${filter === f ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--card)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)]"}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}

            <button
              onClick={() => setOnlineOnly(!onlineOnly)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-full border-2 font-bold text-xs sm:text-sm transition
            ${onlineOnly ? "bg-green-500 text-white border-green-500" : "bg-[var(--card)] text-[var(--text)] border-[var(--border)]"}`}
            >
              Online
            </button>

          </div>
        </div>

        {/* SEARCH */}

        <input
          className="saas-input"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* GRID */}

  <div
  className="flex-1 overflow-y-auto grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-2 sm:gap-5 pr-2
  content-start
  transition-all duration-300 ease-out
  scrollbar-thin scrollbar-thumb-[var(--primary)]/40 scrollbar-track-transparent"
>
          {filteredUsers.length === 0 && (
            <div className="p-6 text-center font-bold col-span-full text-[var(--muted)]">
              No users match your filter.
            </div>
          )}

          {filteredUsers.map((user) => {

            const isOnline = onlineUsers?.includes(user._id);
            const status = user.friendStatus;

            return (

              <div
                key={user._id}
                className="saas-panel border-[var(--border)] p-1.5 sm:p-4 flex flex-row sm:flex-col items-center gap-2 sm:gap-2 hover:shadow-lg transition duration-200"
              >

                {/* PROFILE */}
                <div className="relative shrink-0">
                  <img
                    src={user?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.fullName || user?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                    className="w-10 h-10 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[var(--border)]"
                    alt="profile"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[var(--card)] rounded-full animate-pulse sm:w-4 sm:h-4 sm:bottom-1 sm:right-1"></span>
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0 flex flex-col items-start sm:items-center">
                  <div className="flex items-center gap-2 w-full">
                    <p className="font-extrabold text-xs sm:text-base text-left sm:text-center truncate text-[var(--text)]">
                      {user.fullName}
                    </p>
                    
                    <div className="shrink-0 flex items-center">
                      {status === "received" && (
                        <span className="text-[8px] sm:text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                          Request
                        </span>
                      )}
                      {status === "sent" && (
                        <span className="text-[8px] sm:text-xs bg-gray-400 text-white px-1.5 py-0.5 rounded-full font-bold">
                          Sent
                        </span>
                      )}
                      {status === "blocked" && (
                        <span className="text-[8px] sm:text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-[9px] sm:text-xs text-[var(--muted)] text-left sm:text-center line-clamp-1 opacity-70">
                    {user.bio || "No bio available"}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-row sm:flex-col gap-1 sm:gap-2 sm:mt-auto w-auto sm:w-full shrink-0">
                  {status === "none" && (
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      className="saas-btn px-2.5 py-1.5 sm:px-6 sm:py-2 bg-green-500 text-white border-none text-[9px] sm:text-xs font-black"
                    >
                      Connect
                    </button>
                  )}

                  {status === "received" && (
                    <div className="flex flex-row gap-1">
                      <button onClick={() => acceptFriendRequest(user._id)} className="saas-btn px-2 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white text-[9px] sm:text-xs">Add</button>
                      <button onClick={() => rejectFriendRequest(user._id)} className="saas-btn px-2 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white text-[9px] sm:text-xs">No</button>
                    </div>
                  )}

                  {status === "sent" && (
                    <button disabled className="saas-btn px-2.5 py-1.5 sm:px-6 sm:py-2 bg-gray-400 cursor-not-allowed text-white text-[9px] sm:text-xs">Sent</button>
                  )}

                  {status === "blocked" ? (
                    <button onClick={() => unblockUser(user._id)} className="saas-btn px-2.5 py-1.5 sm:px-6 sm:py-2 bg-yellow-400 text-black text-[9px] sm:text-xs">Unfriend</button>
                  ) : (
                    <button onClick={() => blockUser(user._id)} className="saas-btn px-2.5 py-1.5 sm:px-6 sm:py-2 bg-red-500 text-white text-[9px] sm:text-xs cursor-pointer">Block</button>
                  )}
                </div>
              </div>

            );
          })}

        </div>

        {/* QR MODAL */}

        {showQR && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white p-6 rounded-xl border-4 border-black flex flex-col items-center gap-4">

              <h2 className="font-extrabold text-lg">Scan to Connect</h2>

              <QRCode
                value={qrUrl || `${window.location.origin}`}
                size={200}
                bgColor="#FEEE91"
                fgColor="#000000"
              />

              <button
                onClick={() => setShowQR(false)}
                className="cartoon-btn bg-[#FF6F91] w-full"
              >
                Close
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default Friendlist;
