
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

      <div className="p-4 flex flex-col gap-4 h-full w-full overflow-hidden bg-[var(--bg)]">

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
  gap-5 pr-2
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
                className="saas-panel border-2 border-[var(--border)] p-4 flex flex-col items-center gap-2 hover:shadow-xl hover:-translate-y-1 hover:border-[var(--primary)] transition duration-200"
              >

                {/* PROFILE */}

                <div className="relative">

                  <img
                    src={user?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.fullName || user?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[var(--border)]"
                    alt="profile"
                  />

                  {isOnline && (
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[var(--card)] rounded-full animate-pulse"></span>
                  )}

                </div>

                {/* NAME */}

                <p className="font-extrabold text-center truncate w-full text-[var(--text)]">
                  {user.fullName}
                </p>

                {/* BIO */}

                <p className="text-xs text-[var(--muted)] text-center line-clamp-2">
                  {user.bio || "No bio available"}
                </p>

                {/* STATUS BADGE */}

                {status === "received" && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold">
                    Request
                  </span>
                )}

                {status === "sent" && (
                  <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded-full font-bold">
                    Pending
                  </span>
                )}

                {status === "blocked" && (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                    Blocked
                  </span>
                )}

                {/* ACTION BUTTONS */}

                {/* ACTION BUTTONS */}
                <div className="flex flex-col gap-2 mt-auto w-full">

                  {/* ADD FRIEND */}

                  {status === "none" && (
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      className="saas-btn w-full bg-green-500 hover:bg-green-600 text-white border-none shadow-lg hover:shadow-xl active:translate-y-1 active:shadow-md transition-all duration-150"
                    >
                      Add Friend
                    </button>
                  )}

                  {/* RECEIVED REQUEST */}

                  {status === "received" && (
                    <div className="flex gap-2 w-full">

                      <button
                        onClick={() => acceptFriendRequest(user._id)}
                        className="saas-btn w-full bg-green-500 hover:bg-green-600 text-white border-none shadow-lg hover:shadow-xl active:translate-y-1 active:shadow-md transition-all duration-150"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => rejectFriendRequest(user._id)}
                        className="saas-btn w-full bg-red-500 hover:bg-red-600 text-white border-none shadow-lg hover:shadow-xl active:translate-y-1 active:shadow-md transition-all duration-150"
                      >
                        Reject
                      </button>

                    </div>
                  )}

                  {/* REQUEST SENT */}

                  {status === "sent" && (
                    <button
                      disabled
                      className="saas-btn w-full bg-gray-400 cursor-not-allowed border-none text-white shadow-inner"
                    >
                      Request Sent
                    </button>
                  )}

                  {/* BLOCK / UNBLOCK */}

                  {status === "blocked" ? (
                    <button
                      onClick={() => unblockUser(user._id)}
                      className="saas-btn w-full bg-yellow-400 hover:bg-yellow-500 border-none text-black shadow-lg hover:shadow-xl active:translate-y-1 active:shadow-md transition-all duration-150"
                    >
                      Unfriend
                    </button>
                  ) : (
                    <button
                      onClick={() => blockUser(user._id)}
                      className="saas-btn w-full bg-red-500 hover:bg-red-600 border-none text-white shadow-lg hover:shadow-xl active:translate-y-1 active:shadow-md transition-all duration-150"
                    >
                      Block
                    </button>
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
