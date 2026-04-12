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
  const [mobileMenu, setMobileMenu] = useState(false);

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

          {/* SIDEBAR TOGGLE (MOBILE) */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--bg)] mr-2"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <Box
              size={30}
              className="transition-transform duration-300 group-hover:rotate-6 text-[var(--primary)]"
            />
            <span className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
              ChatterBox
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-4">

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

         

            {/* PROFILE */}
            <div className="flex items-center gap-3 pl-3 border-l border-[var(--border)] text-[var(--text-primary)]">

              <img
                src={authUser?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authUser?.fullName || authUser?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                className="w-9 h-9 rounded-full border border-[var(--border)] object-cover"
              />

              <p className="text-sm font-semibold truncate max-w-[120px]">
                {authUser?.fullName || "User"}
              </p>

              <button
                onClick={logout}
                className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
              >
                <LogOut className="h-5 w-5"/>
              </button>

            </div>

          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--bg)]"
          >
            <Menu size={22}/>
          </button>

        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <div className="md:hidden border-t border-[var(--border)] py-3 flex flex-col gap-3">

            <Link
              to="/notifications"
              className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-[var(--bg)]"
            >
              <div className="flex items-center gap-2">
                <BellIcon size={18}/>
                Notifications
              </div>

              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleShowQR}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--bg)]"
            >
              <QrCode size={18}/>
              My QR
            </button>

            <div className="flex items-center gap-3 px-2 py-2">

              <img
                src={authUser?.profilePic || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(authUser?.fullName || authUser?.username || "U")}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`}
                className="w-8 h-8 rounded-full border object-cover"
              />

              <span className="font-semibold">
                {authUser?.fullName}
              </span>

            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <LogOutIcon size={18}/>
              Logout
            </button>

            <div className="px-2">
              <ThemeSelector/>
            </div>

          </div>
        )}

      </div>

    </nav>
  );
};

export default Navbar;