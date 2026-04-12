
import React, { useContext, useState, useEffect } from "react";
import { Bell, Users, MessageCircle, Clock, UserPlus, Info } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import { AuthContext } from "../../context/authContext";
import { toast } from "react-hot-toast";

const Notifications = () => {
  const { notifications, clearNotifications, markRead, deleteNotification, markAllAsRead } = useContext(NotificationContext);
  const { authUser, axios } = useContext(AuthContext);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    markAllAsRead();
  }, []);

  const joinRoom = async (roomId, id, token) => {
    try {
      let res;
      if (token) {
        res = await axios.post("/api/rooms/accept-invite", { roomId, token });
      } else {
        res = await axios.post(`/api/rooms/${roomId}/join`);
      }

      if (res.data.success) {
        toast.success("Joined room successfully!");
        deleteNotification(id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join room");
      console.log(error);
    }
  };

  /* -------- FORMAT TIME -------- */
  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
    return new Date(date).toLocaleDateString();
  };

  const acceptFriend = async (senderId, notificationId) => {
    try {
      const res = await axios.post(`/api/friends/accept/${senderId}`);
      if (res.data.success) {
        toast.success("Friend request accepted!");
        deleteNotification(notificationId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
      console.log(error);
    }
  };

  const rejectFriend = async (senderId, notificationId) => {
    try {
      const res = await axios.post(`/api/friends/reject/${senderId}`);
      if (res.data.success) {
        toast.success("Friend request rejected");
        deleteNotification(notificationId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
      console.log(error);
    }
  };

  /* -------- FILTER -------- */
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "friend") return n.type === "friend_request";
    if (filter === "room") return n.type === "room_invite";
    if (filter === "message") return n.type === "message";
    return true;
  });

  return (
    <div className="min-h-full bg-[var(--bg)] text-[var(--text)] p-4 sm:p-6 pb-24">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2 text-[var(--primary)]">
          <Bell /> Notifications
        </h1>
        <button onClick={clearNotifications} className="saas-btn bg-red-500 hover:bg-red-600 border-none w-full sm:w-auto">
          Clear All
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: "all", label: "All" },
          { key: "friend", label: "Friends" },
          { key: "room", label: "Rooms" },
          { key: "message", label: "Messages" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full border-2 font-bold text-sm transition
        ${filter === f.key ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--card)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)]"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-4">
        {filteredNotifications.length === 0 && (
          <div className="text-center font-bold text-[var(--muted)] py-10">
            No notifications
          </div>
        )}

        {filteredNotifications.map((n) => {
          return (
            <div
              key={n._id}
              className={`saas-panel p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-lg transition ${
                !n.isRead ? "border-l-8 border-l-[var(--primary)]" : ""
              }`}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* ICON */}
                <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full border-2 border-[var(--primary)] shrink-0">
                  {n.type === "friend_request" && <UserPlus size={20} />}
                  {n.type === "room_invite" && <Users size={20} />}
                  {n.type === "message" && <MessageCircle size={20} />}
                  {n.type === "info" && <Info size={20} />}
                </div>

                {/* CONTENT (MOBILE) */}
                <div className="flex flex-col flex-1 sm:hidden">
                  {n.content ? (
                    <p className="font-bold text-sm">{n.content}</p>
                  ) : (
                    <p className="font-bold text-sm">
                      <span className="text-[var(--primary)]">
                        {n.sender?.fullName || "Someone"}
                      </span>{" "}
                      {n.type === "friend_request" ? "sent request" : n.type === "room_invite" ? "invited you" : "sent message"}
                    </p>
                  )}
                  <span className="text-[10px] text-[var(--muted)] flex items-center gap-1 mt-1">
                    <Clock size={12} /> {formatTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {/* CONTENT (DESKTOP) */}
              <div className="hidden sm:flex flex-col flex-1">
                {n.content ? (
                  <p className="font-bold">{n.content}</p>
                ) : (
                  <>
                    {n.type === "friend_request" && (
                      <p className="font-bold">
                        <span className="text-[var(--primary)]">
                          {n.sender?.fullName || "Someone"}
                        </span>{" "}
                        sent you a friend request
                      </p>
                    )}

                    {n.type === "room_invite" && (
                      <p className="font-bold">
                        <span className="text-[var(--primary)]">
                          {n.sender?.fullName || "Someone"}
                        </span>{" "}
                        invited you to join a room
                      </p>
                    )}

                    {n.type === "message" && (
                      <p className="font-bold">
                        New message from{" "}
                        <span className="text-[var(--primary)]">
                          {n.sender?.fullName || "Someone"}
                        </span>
                      </p>
                    )}
                  </>
                )}

                <span className="text-sm text-[var(--muted)] flex items-center gap-1 mt-1">
                  <Clock size={14} /> {formatTime(n.createdAt)}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                {n.type === "friend_request" && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptFriend(n.sender?._id, n._id);
                      }}
                      className="saas-btn flex-1 sm:flex-none bg-green-500 hover:bg-green-600 py-2 sm:py-1 px-4 sm:px-3 text-sm border-none"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectFriend(n.sender?._id, n._id);
                      }}
                      className="saas-btn flex-1 sm:flex-none bg-red-500 hover:bg-red-600 py-2 sm:py-1 px-4 sm:px-3 text-sm border-none"
                    >
                      Reject
                    </button>
                  </>
                )}

                {n.type === "room_invite" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      joinRoom(n.roomId, n._id, n.inviteToken);
                    }}
                    className="saas-btn w-full sm:w-auto bg-[var(--primary)] py-2 sm:py-1 px-4 sm:px-3 text-sm border-none"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;

