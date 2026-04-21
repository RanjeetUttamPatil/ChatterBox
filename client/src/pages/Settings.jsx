
import React, { useState, useContext } from "react";
import { User, Palette, QrCode, Bell, Check } from "lucide-react";
import { AuthContext } from "../../context/authContext";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import assets from "../assets/assets";
import axios from "axios";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import Lottie from "lottie-react";
import gearsAnimation from "../assets/Gears Lottie Animation.json";

function Settings() {

  const { authUser, updateProfile } = useContext(AuthContext);
  const { theme, setTheme } = useThemeStore();
  
  const btnTextColor = ["coal", "titanium", "steel"].includes(theme) ? "!text-black" : "!text-white";


  const [selectedImg,setSelectedImg] = useState(null);
  const [name,setName] = useState(authUser?.fullName || "");
  const [bio,setBio] = useState(authUser?.bio || "");

  const [qrUrl,setQrUrl] = useState("");

  const [notificationSettings,setNotificationSettings] = useState({
    friendRequests:true,
    roomInvites:true,
    messages:true
  });

  /* PROFILE SAVE */

  const saveProfile = async (e)=>{

    e.preventDefault();

    if(!selectedImg){

      await updateProfile({
        fullName:name,
        bio
      });

      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);

    reader.onload = async ()=>{

      await updateProfile({
        profilePic:reader.result,
        fullName:name,
        bio
      });

    };

  };

  /* QR */

  const generateQR = async ()=>{

    try{

      const {data} = await axios.post("/api/friends/qr-token");

      if(data?.success && data.token){
        setQrUrl(`${window.location.origin}/scan?t=${data.token}`);
      }

    }catch{

      setQrUrl(window.location.origin);

    }

  };

  /* TOGGLE NOTIFICATIONS */

  const toggleNotification = (key)=>{

    setNotificationSettings(prev=>({
      ...prev,
      [key]:!prev[key]
    }));

  };

  return(

  <div className="min-h-full bg-[var(--bg)] text-[var(--text)] p-4 sm:p-8 pb-24">

<div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">

  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
    <Lottie
      animationData={gearsAnimation}
      loop
      style={{ width: "100%", height: "100%" }}
    />
  </div>

  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--primary)] tracking-wide">
    Settings
  </h1>

</div>

    <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2">

      {/* PROFILE */}

      <div className="saas-panel p-4 sm:p-6 flex flex-col gap-5">

        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <User size={20}/> Profile
        </div>

        <form onSubmit={saveProfile} className="flex flex-col gap-4">

          <label
  htmlFor="avatar"
  className="flex items-center gap-4 cursor-pointer p-4 rounded-xl 
  border-2 border-dashed border-[var(--border)] 
  hover:border-[var(--primary)] hover:bg-[var(--bg)] 
  transition-all duration-300"
>

  <input
    id="avatar"
    type="file"
    hidden
    accept=".png,.jpg,.jpeg"
    onChange={(e)=>setSelectedImg(e.target.files[0])}
  />

  <img
    src={
      selectedImg
      ? URL.createObjectURL(selectedImg)
      : authUser?.profilePic || assets.avatar_icon
    }
    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[var(--text)] object-cover"
  />

  <span className="text-sm font-semibold">
    Change avatar
  </span>

</label>

          <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="saas-input text-sm sm:text-base"
          placeholder="Full name"
          />

          <textarea
          value={bio}
          onChange={(e)=>setBio(e.target.value)}
          rows={3}
          className="saas-input text-sm sm:text-base"
          placeholder="Your bio"
          />

          <button
          type="submit"
          className={`saas-btn bg-[var(--primary)] ${btnTextColor} hover:brightness-110 w-full py-3`}
          >
            Save Profile
          </button>

        </form>

      </div>

      {/* THEME */}

      <div className="saas-panel p-4 sm:p-6 flex flex-col gap-5">

        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-[var(--text-primary)]">
          <Palette size={20}/> Theme Selection
        </div>

        <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 px-1">Light Themes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {THEMES.filter(t => t.type === "light").map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={`
                    group flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2
                    ${theme === t.name 
                      ? "bg-[var(--primary)]/10 border-[var(--primary)] shadow-md" 
                      : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg)]"}
                  `}
                >
                  <div className="relative h-12 w-full rounded-lg overflow-hidden border border-[var(--border)]" style={{ background: t.colors.bg }}>
                    <div className="absolute inset-0 flex flex-col p-1 gap-1">
                      <div className="h-2 w-full rounded-sm" style={{ background: t.colors.primary }}></div>
                      <div className="flex gap-1 h-full">
                        <div className="w-1/3 rounded-sm" style={{ background: t.colors.surface }}></div>
                        <div className="w-2/3 rounded-sm" style={{ background: t.colors.accent }}></div>
                      </div>
                    </div>
                    {theme === t.name && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <Check size={18} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest truncate w-full text-center ${theme === t.name ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 px-1">Dark Themes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {THEMES.filter(t => t.type === "dark").map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={`
                    group flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2
                    ${theme === t.name 
                      ? "bg-[var(--primary)]/10 border-[var(--primary)] shadow-md" 
                      : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg)]"}
                  `}
                >
                  <div className="relative h-12 w-full rounded-lg overflow-hidden border border-[var(--border)]" style={{ background: t.colors.bg }}>
                    <div className="absolute inset-0 flex flex-col p-1 gap-1">
                      <div className="h-2 w-full rounded-sm" style={{ background: t.colors.primary }}></div>
                      <div className="flex gap-1 h-full">
                        <div className="w-1/3 rounded-sm" style={{ background: t.colors.surface }}></div>
                        <div className="w-2/3 rounded-sm" style={{ background: t.colors.accent }}></div>
                      </div>
                    </div>
                    {theme === t.name && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <Check size={18} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest truncate w-full text-center ${theme === t.name ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* QR */}

      <div className="saas-panel p-4 sm:p-6 flex flex-col gap-5 items-center">

        <div className="w-full flex items-center gap-2 text-lg sm:text-xl font-bold text-[var(--text)]">
          <QrCode size={20}/> QR Connection
        </div>

        <p className="text-sm text-[var(--muted)] text-center leading-relaxed px-2">
          Show this QR code to a friend! Once they scan it, they can send you a friend request instantly.
        </p>

        <button
          onClick={generateQR}
          className={`saas-btn bg-[var(--primary)] ${btnTextColor} hover:brightness-110 w-full sm:w-fit px-8 py-3`}
        >
          {qrUrl ? "Refresh My Code" : "Generate My Code"}
        </button>

        {qrUrl && (
          <div className="relative group mt-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-4 sm:p-5 bg-white rounded-xl border-2 border-[var(--text)]">
              <QRCode
                value={qrUrl}
                size={window.innerWidth < 640 ? 140 : 180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-center text-[var(--muted)] animate-pulse">
              Scan to Connect
            </p>
          </div>
        )}

      </div>

      {/* NOTIFICATIONS */}

      <div className="saas-panel p-4 sm:p-6 flex flex-col gap-5">

        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <Bell size={20}/> Notifications
        </div>

        <label className="flex items-center gap-3">

          <input
          type="checkbox"
          className="accent-[var(--primary)]"
          checked={notificationSettings.friendRequests}
          onChange={()=>toggleNotification("friendRequests")}
          />

          Friend Requests

        </label>

        <label className="flex items-center gap-3">

          <input
          type="checkbox"
          className="accent-[var(--primary)]"
          checked={notificationSettings.roomInvites}
          onChange={()=>toggleNotification("roomInvites")}
          />

          Room Invites

        </label>

        <label className="flex items-center gap-3">

          <input
          type="checkbox"
          className="accent-[var(--primary)]"
          checked={notificationSettings.messages}
          onChange={()=>toggleNotification("messages")}
          />

          Messages

        </label>

      </div>

    </div>

  </div>

  );

}

export default Settings;

