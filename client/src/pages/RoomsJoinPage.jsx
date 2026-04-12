import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { RoomContext } from "../../context/roomContext";
import { toast } from "react-hot-toast";

function RoomsJoinPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const roomId = params.get("room");
  const token = params.get("t");
  const { axios, authUser } = useContext(AuthContext);
  const { setActiveRoom } = useContext(RoomContext);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!roomId) {
      toast.error("Missing room");
      navigate("/rooms");
    }
    if (!authUser) {
      navigate(`/login${location.search}`);
    }
  }, [roomId, authUser]);

  const submit = async () => {
    try {
      setSubmitting(true);
      if (token) {
        const { data } = await axios.post("/api/rooms/accept-invite", { roomId, token, password });
        if (data.success) {
          setActiveRoom(data.room);
          toast.success("Joined room");
          navigate("/rooms");
          return;
        }
      } else {
        const { data } = await axios.post(`/api/rooms/${roomId}/join`, { password });
        if (data.success) {
          setActiveRoom(data.room);
          toast.success("Joined room");
          navigate("/rooms");
          return;
        }
      }
      toast.error("Failed to join");
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to join");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#8CE4FF]">
      <div className="cartoon-panel p-6 w-[360px]">
        <div className="font-extrabold text-lg mb-2">Join Room</div>
        <p className="text-sm font-bold mb-3">Enter room password (if required)</p>
        <label className="sr-only" htmlFor="roomPassword">
          Room password
        </label>
        <input
          id="roomPassword"
          className="cartoon-input w-full"
          type="password"
          placeholder="Room password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="cartoon-btn bg-[#FFD93D] w-full mt-3"
          onClick={submit}
          disabled={submitting}
          aria-disabled={submitting}
        >
          Join
        </button>
        <button
          type="button"
          className="cartoon-btn bg-white w-full mt-2"
          onClick={() => navigate("/rooms")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default RoomsJoinPage;
