import React, { useContext, useEffect, useState } from "react";
import { Home, Wallet, PieChart, Gift, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { Scan } from "lucide-react";
import BottomBar from "./BottomBar";

function Sidebar({ onClose }) {
  const { logout, onlineUsers, authUser, axios } = useContext(AuthContext);

  const {
    users = [],
    getUsers,
    selectedUser,
    setSelectedUser,
    unseenMessages = {},
  } = useContext(ChatContext);

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const [filter, setFilter] = useState("all");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  });

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const filteredUsers = users
    // show ONLY friends
    .filter((u) => u.friendStatus === "friend")

    // search filter
    .filter((u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase())
    )

    // online filter
    .filter((u) => {
      if (!onlineOnly) return true;
      return onlineUsers?.includes(u._id);
    });

  return (
    <div className="cartoon-panel_3 border-r-0 p-4 flex flex-col gap-4 h-full overflow-hidden bg-[#FEEE91] relative">

      {/* Profile Header */}

      {/* FILTER PILLS */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-4xl font-bold">
          Your Friends
        </h1>


        <button
          onClick={() => setOnlineOnly(!onlineOnly)}
          className={`px-3 py-1 rounded-full border-2 border-black font-bold
          ${onlineOnly ? "bg-green-400" : "bg-white"}`}
        >
          Online
        </button>
      </div>


      {/* Search */}
      <input
        className="cartoon-input"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      { /* Users List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 scrollbar-hide">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers?.includes(user._id);
          const unreadCount = unseenMessages[user._id] || 0;
          const status = user.friendStatus;
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              type="button"
              aria-current={isSelected ? "page" : undefined}
              onClick={() => {
                setSelectedUser(user);
                if (onClose) onClose();
              }}
              style={
                isSelected
                  ? {
                    background: "#fff6c3",
                    boxShadow: "inset 0 -4px 0 0 rgba(0,0,0,0.25)",
                    cursor: "default",
                  }
                  : undefined
              }
              className={`w-full text-left cartoon-panel_2 bg-white p-3 flex items-center gap-3 cursor-pointer relative transition-all duration-200 ${isSelected
                  ? ""
                  : "hover:shadow-[inset_0_-4px_0_0_rgba(0,0,0,0.15)]"
                }`}
            >
              <img
                src={user?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.fullName || user?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                alt="user"
                className="w-12 h-12 rounded-full border object-cover"
              />

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-extrabold truncate">{user.fullName}</p>

                  {status === "friend" && (
                    <span className="text-xs bg-green-500 text-white px-1.5 rounded-full font-bold">
                      Friend
                    </span>
                  )}
                  {status === "received" && (
                    <span className="text-xs bg-blue-500 text-white px-1.5 rounded-full font-bold">
                      Request
                    </span>
                  )}
                  {status === "sent" && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 rounded-full border font-bold">
                      Pending
                    </span>
                  )}
                  {status === "blocked" && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded-full border font-bold">
                      Blocked
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm font-bold ${isOnline ? "text-green-500" : "text-gray-400"
                    }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>

              {unreadCount > 0 && (
                <div className="absolute bottom-3 right-3 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold leading-none bg-blue-500 text-white shadow-md border border-white">
                  {unreadCount}
                </div>
              )}
            </button>
          );
        })}
      </div>



      {/* Floating Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowMenu(false)}
          />

          <div className="absolute top-16 right-4 w-56 bg-white border-4 border-black rounded-xl shadow-xl p-4 flex flex-col gap-3 z-50">
            <div className="flex flex-col items-center gap-2 pb-2 border-b-2 border-black">
              <img
                src={authUser?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authUser?.fullName || authUser?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                className="w-16 h-16 rounded-full object-cover border border-black"
              />
              <p className="font-extrabold">{authUser?.fullName}</p>
            </div>

            <button
              onClick={() => {
                navigate("/settings");
                setShowMenu(false);
              }}
              className="cartoon-btn bg-[#A1EEBD]"
            >
              Profile
            </button>

            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              className="cartoon-btn bg-[#FF8C8C]"
            >
              Logout
            </button>
          </div>
        </>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="presentation">
          <div
            className="bg-white p-6 rounded-xl border-4 border-black flex flex-col items-center gap-4 relative animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
            tabIndex={-1}
          >
            <h2 id="qr-modal-title" className="font-extrabold text-lg">
              {authUser?.fullName}
            </h2>

            <QRCode
              value={qrUrl || `${window.location.origin}`}
              size={200}
              bgColor="#FEEE91"
              fgColor="#000000"
            />

            <p className="text-sm font-bold text-center">
              Scan this QR to connect
            </p>

            <button
              type="button"
              onClick={() => setShowQR(false)}
              className="cartoon-btn bg-[#FF6F91] w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;