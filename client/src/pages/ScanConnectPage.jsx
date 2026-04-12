import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { ChatContext } from "../../context/chatContext";
import { toast } from "react-hot-toast";
import { QrCode } from "lucide-react";

function ScanConnectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get("t");
  const { axios, authUser } = useContext(AuthContext);
  const { setSelectedUser, getUsers } = useContext(ChatContext);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        toast.error("Missing token");
        navigate("/");
        return;
      }
      if (!authUser) {
        navigate(`/login${location.search}`);
        return;
      }
      try {
        const { data } = await axios.post("/api/friends/qr-token/consume", { token });
        if (data?.success && data.friend) {
          await getUsers();
          setSelectedUser(data.friend);
          toast.success("Connected");
          navigate("/");
        } else {
          toast.error(data?.message || "Failed to connect");
          navigate("/");
        }
      } catch (e) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to connect");
        navigate("/");
      }
    };
    run();
  }, [authUser, token]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="saas-panel p-10 max-w-sm w-full flex flex-col items-center gap-6 shadow-[12px_12px_0px_var(--text)] border-4 border-[var(--text)]">
        <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center animate-pulse">
          <QrCode size={40} className="text-[var(--primary)]" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-[var(--text)]">Connecting...</h2>
          <p className="text-[var(--muted)] font-bold italic">
            "Magic is in the air..."
          </p>
        </div>

        <div className="w-full bg-[var(--bg)] h-2 rounded-full overflow-hidden border-2 border-[var(--text)]">
          <div className="h-full bg-[var(--primary)] w-1/2 animate-[shimmer_1.5s_infinite_linear]"></div>
        </div>

        <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">
          Establishing instant friendship
        </p>
      </div>
    </div>
  );
}

export default ScanConnectPage;
