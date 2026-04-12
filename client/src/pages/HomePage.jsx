import React, { useContext, useState } from "react";
import ScrollTop from "../components/ScrollTop";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/chatContext";
import Navbar from "../components/Navbar";

function HomePage() {
  const { selectedUser, isRightSidebarOpen } = useContext(ChatContext);
  const [showMobileLeft, setShowMobileLeft] = useState(false);
  const [showMobileRight, setShowMobileRight] = useState(false);



  return (
    <div className="h-full overflow-hidden relative bg-[var(--bg)] text-[var(--text)]">
      <div
        className={`h-full grid box-border
          grid-cols-1
          md:grid-cols-[1fr_2fr]
          ${selectedUser && isRightSidebarOpen ? "xl:grid-cols-[1fr_2fr]" : ""}
        `}
        >
        
        <div className="hidden md:flex flex-col min-h-0">
          <Sidebar />
        </div>

        <div className="min-h-0 flex flex-col">
          <ChatContainer 
            onOpenLeft={() => { setShowMobileLeft(true); setShowMobileRight(false); }}
            onOpenRight={() => { setShowMobileRight(true); setShowMobileLeft(false); }}
          />
        </div>

      </div>

      {/* MOBILE LEFT SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 p-4 transform transition-transform duration-300 ease-in-out md:hidden ${showMobileLeft ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="User sidebar"
        aria-hidden={!showMobileLeft}
        tabIndex={-1}
      >
         <Sidebar onClose={() => setShowMobileLeft(false)} />
      </div>

      {/* MOBILE RIGHT SIDEBAR */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 p-4 transform transition-transform duration-300 ease-in-out xl:hidden ${showMobileRight ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Friend actions sidebar"
        aria-hidden={!showMobileRight}
        tabIndex={-1}
      >
         <RightSidebar />
      </div>

      {/* OVERLAY */}
      {(showMobileLeft || showMobileRight) && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          role="presentation"
          aria-hidden="true"
          onClick={() => { setShowMobileLeft(false); setShowMobileRight(false); }}
        />
      )}
      
    </div>
  );
}

export default HomePage;
