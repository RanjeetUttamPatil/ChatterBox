import React, { useState } from "react";
import {
  Home,
  MessageCircle,
  Bell,
  Users,
  BarChart3,
  Settings,
  Menu
} from "lucide-react";
import "./MinSidebar.css";

const menuItems = [
  { id: 1, icon: <Home size={22} />, label: "Home" },
  { id: 2, icon: <MessageCircle size={22} />, label: "Rooms" },
  { id: 3, icon: <Bell size={22} />, label: "Notifications" },
  { id: 4, icon: <Users size={22} />, label: "Friends" },
  { id: 5, icon: <BarChart3 size={22} />, label: "Analytics" },
  { id: 6, icon: <Settings size={22} />, label: "Settings" }
];

const MinSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`MinSidebar ${open ? "open" : ""}`}>
      
      {/* Toggle Button */}
      <div className="menuToggle" onClick={() => setOpen(!open)}>
        <Menu size={24} />
      </div>

      {/* Menu Items */}
      <div className="menuContainer">
        {menuItems.map((item) => (
          <div key={item.id} className="menuItem">
            <div className="icon">{item.icon}</div>

            {open && <span className="label">{item.label}</span>}
          </div>
        ))}
      </div>

    </div>
  );
};

export default MinSidebar;