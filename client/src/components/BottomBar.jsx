import React from "react";
import { Home, Wallet, PieChart, Gift, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getColor = (path) => {
    return location.pathname === path
      ? "text-[#7C3AED]"
      : "text-gray-600 hover:text-gray-900";
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="mt-auto w-full flex justify-around items-center py-2 "
    >

      <button
        type="button"
        aria-label="Go to Chats"
        onClick={() => navigate("/")}
        className={`flex flex-col items-center hover:scale-105 active:scale-95 transition-transform ${getColor("/")}`}
      >
        <Home size={22} />
        <span className="text-[15px] font-bold">Chats</span>
      </button>

      <button
        type="button"
        aria-label="Go to Create Room"
        onClick={() => navigate("/rooms")}
        className={`flex flex-col items-center hover:scale-105 active:scale-95 transition-transform ${getColor("/rooms")}`}
      >
        <Wallet size={22} />
        <span className="text-[15px] font-bold">Create Room</span>
      </button>

      <button
        type="button"
        aria-label="Go to My QR"
        onClick={() => navigate("/analytics")}
        className={`flex flex-col items-center hover:scale-105 active:scale-95 transition-transform ${getColor("/analytics")}`}
      >
        <PieChart size={22} />
        <span className="text-[15px] font-bold">My QR</span>
      </button>

      <button
        type="button"
        aria-label="Go to Profile"
        onClick={() => navigate("/rewards")}
        className={`flex flex-col items-center hover:scale-105 active:scale-95 transition-transform ${getColor("/rewards")}`}
      >
        <Gift size={22} />
        <span className="text-[15px] font-bold">Live Location</span>
      </button>

      <button
        type="button"
        aria-label="Go to Settings"
        onClick={() => navigate("/settings")}
        className={`flex flex-col items-center hover:scale-105 active:scale-95 transition-transform ${getColor("/settings")}`}
      >
        <Settings size={22} />
        <span className="text-[15px] font-bold">Settings</span>
      </button>

    </nav>
  );
}

export default BottomBar;