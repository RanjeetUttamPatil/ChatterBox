import React, { useContext } from "react";
import { LayoutDashboard, MessageCircle, Users, UserPlus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";

function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications } = useContext(NotificationContext);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isActive = (path) => location.pathname === path;

  const getColor = (path) => {
    return isActive(path)
      ? "text-[var(--primary)]"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
  };

  const navItems = [
    { name: "Dash", path: "/", icon: <LayoutDashboard size={22} /> },
    { name: "Chats", path: "/chats", icon: <MessageCircle size={22} />, badge: true },
    { name: "Rooms", path: "/rooms", icon: <Users size={22} /> },
    { name: "Connect", path: "/friends", icon: <UserPlus size={22} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--surface)] border-t border-[var(--border)] px-2 pb-safe pt-2 backdrop-blur-lg bg-opacity-80">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 transition-all duration-300 relative ${getColor(item.path)} ${
              isActive(item.path) ? "scale-110" : "scale-100 opacity-70"
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">
              {item.name}
            </span>
            {isActive(item.path) && (
              <span className="absolute -bottom-1 w-1 h-1 bg-[var(--primary)] rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default BottomBar;