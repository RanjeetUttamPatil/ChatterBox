import React, { useState, useContext } from "react";
import { Home, Wallet, PieChart, Gift, Settings, Bell, UserPlus, Users, MessageCircle, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";

function Siddy({ isOpen, setIsOpen }) {

  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { notifications } = useContext(NotificationContext);

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getColor = (path) => {
    return location.pathname === path
      ? "text-[var(--primary)] bg-[var(--primary)]/10"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)]";
  };

  const itemStyle =
    "flex items-center px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden whitespace-nowrap";

  return (
    <aside
      className={`fixed md:relative top-0 left-0 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col p-3 transition-all duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
      } ${
        collapsed ? "md:w-20" : "md:w-64"
      }`}
    >
      {/* Toggle Button (Desktop only) */}
      <div className="hidden md:flex items-center justify-center mb-6">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-2 rounded-lg hover:bg-[var(--bg)] transition-colors duration-200 text-[var(--text-primary)]"
        >
          {collapsed ? <ChevronRight size={24}/> : <><h1 className="text-2xl font-bold">Navigater</h1><ChevronLeft size={24}/></>}
        </button>
      </div>

      {/* Mobile Title */}
      <div className="flex md:hidden items-center justify-between mb-6 px-2">
        <h1 className="text-2xl font-bold">Navigater</h1>
      </div>

      <nav className="flex flex-col gap-2">

        <button
          onClick={() => handleNavigate("/")}
          className={`${itemStyle} ${getColor("/")}`}
        >

          <div className="min-w-[24px] flex items-center justify-center">
            <LayoutDashboard size={22}/>
          </div>

          <span className={`font-semibold ml-3 transition-all duration-300 ease-in-out ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"}`}>
            DashBord
          </span>

        </button>


        <button
          onClick={() => handleNavigate("/chats")}
          className={`${itemStyle} ${getColor("/chats")}`}
        >

          <div className="min-w-[24px] flex items-center justify-center">
            <MessageCircle size={22}/>
          </div>

          <span className={`font-semibold ml-3 transition-all duration-300 ease-in-out ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"}`}>
            Chats
          </span>

        </button>


        <button
          onClick={() => handleNavigate("/friends")}
          className={`${itemStyle} ${getColor("/friends")}`}
        >

          <div className="min-w-[24px] flex items-center justify-center">
            <UserPlus size={22}/>
          </div>

          <span className={`font-semibold ml-3 transition-all duration-300 ease-in-out ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"}`}>
            Connect More
          </span>

        </button>


        <button
          onClick={() => handleNavigate("/rooms")}
          className={`${itemStyle} ${getColor("/rooms")}`}
        >

          <div className="min-w-[24px] flex items-center justify-center">
            <Users size={22}/>
          </div>

          <span className={`font-semibold ml-3 transition-all duration-300 ease-in-out ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"}`}>
            Create Room
          </span>

        </button>


        <button
          onClick={() => handleNavigate("/notifications")}
          className={`${itemStyle} ${getColor("/notifications")} relative`}
        >

          <div className="min-w-[24px] flex items-center justify-center relative">

            <Bell size={22}/>

            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white ${collapsed ? "md:flex" : "hidden"}`}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}

          </div>

          <span className={`font-semibold ml-3 transition-all duration-300 ease-in-out ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"}`}>
            Notifications
          </span>

          {unreadCount > 0 && !(collapsed && window.innerWidth >= 768) && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}

        </button>




        <button
          onClick={() => handleNavigate("/settings")}
          className={`${itemStyle} ${getColor("/settings")}`}
        >

          <div className="min-w-[24px] flex items-center justify-center">
            <Settings size={22}/>
          </div>

          <span className={`font-semibold ml-3 transition-all duration-300 ease-in-out ${collapsed ? "md:opacity-0 md:w-0" : "opacity-100 w-auto"}`}>
            Settings
          </span>

        </button>

      </nav>

    </aside>
  );
}

export default Siddy;