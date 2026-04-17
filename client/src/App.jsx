import React, { useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/authContext";
import ScanConnectPage from "./pages/ScanConnectPage";
import ChatBot from "./components/ChatBot";
import LandingPage from "./pages/LandingPage";
import Friendlist from "./pages/Friendlist";
import RoomsPage from "./pages/RoomsPage";
import { RoomProvider } from "../context/roomContext";
import RoomsJoinPage from "./pages/RoomsJoinPage";
import Navbar from "./components/Navbar";
import Siddy from "./components/Siddy";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import VideoCall from "./components/VideoCall";
import { useThemeStore } from "./store/useThemeStore";
import { THEMES } from "./constants";
import BottomBar from "./components/BottomBar";
import { useLocation } from "react-router-dom";

function App() {
  const { authUser, loading } = useContext(AuthContext);
  const { theme } = useThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/landing";

  // Apply theme dynamically whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = THEMES.find((t) => t.name === theme) || THEMES[0];
    const { bg, surface, primary, secondary, accent, textPrimary, textSecondary, border } = currentTheme.colors;

    // Set core design tokens as CSS variables
    root.style.setProperty("--bg", bg);
    root.style.setProperty("--surface", surface);
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--secondary", secondary);
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--text-primary", textPrimary);
    root.style.setProperty("--text-secondary", textSecondary);
    root.style.setProperty("--border", border);
    
    // Maintain legacy variable names for backward compatibility if needed, 
    // but map them to the new professional tokens
    root.style.setProperty("--card", surface);
    root.style.setProperty("--text", textPrimary);
    root.style.setProperty("--muted", textSecondary);

    // Dark mode detection based on theme type or heuristic
    if (currentTheme.type === "dark" || theme === "cyberpunk") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    localStorage.setItem("streamify-theme", theme);
  }, [theme]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="saas-panel px-10 py-8 flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin"></div>
          <p className="text-xl font-bold text-[var(--text)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-[100dvh] flex flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
       <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#FFFFFF",
            color: "#000000",
            border: "4px solid #000",
            borderRadius: "20px",
            fontWeight: "800",
            fontFamily: "'Outfit', sans-serif",
            padding: "16px 20px",
          },
      
          success: {
            style: {
              background: "#4DFF88",
            },
            iconTheme: {
              primary: "#000",
              secondary: "#4DFF88",
            },
          },
      
          error: {
            style: {
              background: "#FF6F91",
            },
            iconTheme: {
              primary: "#000",
              secondary: "#FF6F91",
            },
          },
      
          loading: {
            style: {
              background: "#FFD93D",
            },
          },
        }}
      />
      {authUser && <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />}
      <VideoCall />
      <div className="flex flex-1 overflow-hidden relative">
        {authUser && <Siddy isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
        
        {/* Mobile Overlay */}
        {authUser && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto transition-all duration-300 min-w-0">
          <RoomProvider>
            <Routes>
              <Route path="/" element={authUser ? <Dashboard/> : <Navigate to="/login" />} />
              <Route path="/chats" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
              <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
              <Route path="/scan" element={authUser ? <ScanConnectPage /> : <Navigate to="/login" />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/friends" element={authUser ? <Friendlist /> : <Navigate to="/login" />} />
              <Route path="/rooms" element={authUser ? <RoomsPage /> : <Navigate to="/login" />} />
              <Route path="/notifications" element={authUser ? <Notifications /> : <Navigate to="/login" />} />
              <Route path="/rooms/join" element={authUser ? <RoomsJoinPage /> : <Navigate to="/login" />} />
              <Route path="/settings" element={authUser ? <Settings /> : <Navigate to="/login" />} />
            </Routes>
          </RoomProvider>
        </main>
      </div>

      {authUser && !isAuthPage && <BottomBar />}
    </div>
  );
}

export default App;
