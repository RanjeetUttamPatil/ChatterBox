import React, { useState, useContext } from "react";
import { 
  Home, 
  Wallet, 
  PieChart, 
  Gift, 
  Settings, 
  Bell, 
  UserPlus, 
  Users, 
  MessageCircle, 
  LayoutDashboard, 
  ChevronLeft, 
  ChevronRight, 
  QrCode, 
  User, 
  LogOut,
  Info
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import { AuthContext } from "../../context/authContext";

function Siddy({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { notifications } = useContext(NotificationContext);
  const { authUser, logout } = useContext(AuthContext);

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isActive = (path) => location.pathname === path;

  const getColor = (path) => {
    return isActive(path)
      ? "text-[var(--primary)] bg-[var(--primary)]/10"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)]";
  };

  const itemStyle =
    "flex items-center px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden whitespace-nowrap group relative";

  return (
    <aside
      className={`fixed md:relative top-0 left-0 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col p-4 transition-all duration-500 ease-in-out z-50 shadow-2xl md:shadow-none ${
        isOpen ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0"
      } ${
        collapsed ? "md:w-20" : "md:w-[280px]"
      }`}
    >
      {/* Toggle Button (Desktop only) */}
      <div className={`hidden md:flex items-center mb-8 ${collapsed ? "justify-center" : "justify-between"}`}>
         {!collapsed && (
           <h1 className="text-2xl font-black text-[var(--primary)] transition-opacity duration-300">
              Navigator
           </h1>
         )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-2 rounded-xl hover:bg-[var(--bg)] transition-colors duration-200 text-[var(--text-primary)] border border-transparent hover:border-[var(--border)] shrink-0"
        >
          {collapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
        </button>
      </div>

      {/* Mobile Title */}
      <div className="flex md:hidden items-center justify-between mb-8 px-2">
        <h1 className="text-2xl font-black text-[var(--primary)]">Navigator</h1>
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg bg-[var(--bg)]">
            <ChevronLeft size={20}/>
        </button>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar">

        {[
          { name: "Dashboard", path: "/", icon: <LayoutDashboard size={22}/> },
          { name: "Chats", path: "/chats", icon: <MessageCircle size={22}/> },
          { name: "Connect More", path: "/friends", icon: <UserPlus size={22}/> },
          { name: "Create Room", path: "/rooms", icon: <Users size={22}/> },
          { name: "Notifications", path: "/notifications", icon: <Bell size={22}/>, badge: unreadCount },
          { name: "Settings", path: "/settings", icon: <Settings size={22}/> },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={`${itemStyle} ${getColor(item.path)}`}
          >
            <div className={`min-w-[24px] flex items-center justify-center transition-transform duration-300 ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"}`}>
              {item.icon}
            </div>

            <span className={`font-bold ml-3 transition-all duration-300 ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"}`}>
              {item.name}
            </span>

            {item.badge > 0 && !(collapsed && window.innerWidth >= 768) && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce-short">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
            
            {item.badge > 0 && (collapsed && window.innerWidth >= 768) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[var(--surface)]"></span>
            )}

            {isActive(item.path) && (
                <div className="absolute left-0 w-1 h-6 bg-[var(--primary)] rounded-r-full" />
            )}
          </button>
        ))}

        <div className="my-4 border-t border-[var(--border)] opacity-50" />
      </nav>


    </aside>
  );
}

export default Siddy;