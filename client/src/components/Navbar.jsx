import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { NotificationContext } from "../../context/NotificationContext";
import { Bell, Box, LogOut, QrCode, Menu, X } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import axios from "axios";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { authUser, logout } = useContext(AuthContext);
  const { notifications } = useContext(NotificationContext);

  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleShowQR = async () => {
    try {
      const { data } = await axios.post("/api/friends/qr-token");

      if (data?.success && data.token) {
        setQrUrl(`${window.location.origin}/scan?t=${data.token}`);
        setShowQR(true);
      }
    } catch {
      setQrUrl(`${window.location.origin}`);
      setShowQR(true);
    }
  };

  return (
    <nav className="sticky top-0 z-30 backdrop-blur-xl bg-[var(--surface)]/70 border-b border-[var(--border)] shadow-sm">
     
      <div className="w-full px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-4">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 group">
              <Box
                size={28}
                className="transition-transform duration-300 group-hover:rotate-6 text-[var(--primary)]"
              />
              <span className="hidden sm:inline text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                ChatterBox
              </span>
            </Link>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <div className="items-center gap-2 sm:gap-4 hidden md:flex">
                <Link to="/notifications">
                <button className="relative p-2 hover:bg-[var(--bg)] rounded-full transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <Bell className="h-5 w-5"/>
                    {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                    )}
                </button>
                </Link>

                <ThemeSelector/>
            </div>

            <div className="flex md:hidden items-center mr-1">
                <Link to="/notifications">
                  <button className="relative p-2 hover:bg-[var(--bg)] rounded-full transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      <Bell className="h-5 w-5"/>
                      {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                      )}
                  </button>
                </Link>
            </div>

            <Link to="/settings" className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[var(--border)] text-[var(--text-primary)] hover:opacity-80 transition-opacity">

              <img
                src={authUser?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authUser?.fullName || authUser?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--border)] object-cover shadow-sm"
                alt="Profile"
              />

              <p className="hidden md:block text-sm font-bold truncate max-w-[120px]">
                {authUser?.fullName?.split(' ')[0] || "User"}
              </p>
            </Link>

              <button
                onClick={logout}
                className="p-1.5 sm:p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5"/>
              </button>

          </div>

        </div>

      </div>


      {/* QR MODAL (KEEPING LOGIC FOR FUTURE USE) */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="saas-panel bg-[var(--surface)] max-w-sm w-full p-6 flex flex-col items-center gap-4">
                <h3 className="text-xl font-black">Your QR Code</h3>
                <div className="p-4 bg-white rounded-2xl border-2 border-black">
                    <QRCode value={qrUrl} size={200} />
                </div>
                <button onClick={() => setShowQR(false)} className="saas-btn bg-[var(--primary)] w-full">Close</button>
            </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;