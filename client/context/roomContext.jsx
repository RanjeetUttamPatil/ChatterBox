import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import { toast } from "react-hot-toast";

export const RoomContext = createContext();

export function RoomProvider({ children }) {
  const { axios, socket, authUser } = useContext(AuthContext);

  const [rooms, setRooms] = useState({ created: [], joined: [], other: [] });
  const [invitations, setInvitations] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomMessages, setRoomMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [presence, setPresence] = useState({ present: [], absent: [], members: [] });

  const isMember = useMemo(() => {
    if (!activeRoom || !authUser?._id) return false;
    const members = activeRoom.members || [];
    if (!Array.isArray(members)) return false;
    return members.some(m => String(m?._id || m) === String(authUser._id));
  }, [activeRoom, authUser?._id]);

  const isAdmin = useMemo(() => {
    if (!activeRoom || !authUser?._id) return false;
    const admins = activeRoom.admins || [];
    if (!Array.isArray(admins)) return false;
    return admins.some(a => String(a?._id || a) === String(authUser._id));
  }, [activeRoom, authUser?._id]);

  const loadRooms = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/rooms");

      if (data.success) {
        setRooms({
          created: Array.isArray(data.createdRooms) ? data.createdRooms : [],
          joined: Array.isArray(data.joinedRooms) ? data.joinedRooms : [],
          other: []
        });

        setInvitations(Array.isArray(data.invitations) ? data.invitations : []);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  }, [axios]);

  const summarizeRoom = useCallback(async (roomId) => {
    try {
      const { data } = await axios.get(`/api/rooms/${roomId}/summary`);
      if (data.success) {
        return data.summary;
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  }, [axios]);

  const acceptRoomInvite = useCallback(async (roomId, token) => {
    try {
      const { data } = await axios.post("/api/rooms/accept-invite", { roomId, token });

      if (data.success) {
        toast.success("Invitation accepted!");

        setInvitations(prev => prev.filter(i => i._id !== roomId));
        setActiveRoom(data.room);

        await loadRooms();
        return true;
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }

    return false;
  }, [axios, loadRooms]);

  const rejectRoomInvite = useCallback(async (roomId, token) => {
    try {
      const { data } = await axios.post("/api/rooms/reject-invite", { roomId, token });

      if (data.success) {
        toast.success("Invitation declined");
        await loadRooms();
        return true;
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }

    return false;
  }, [axios, loadRooms]);

  const createRoom = useCallback(async (payload) => {
    try {
      const { data } = await axios.post("/api/rooms", payload);

      if (data.success) {
        setRooms(prev => ({
          ...prev,
          created: [data.room, ...(prev.created || [])]
        }));
        await loadRooms(); // Fetch full populated data in background
        setActiveRoom(data.room);
        toast.success("Room created");
        return true;
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }

    return false;
  }, [axios, loadRooms]);

  const joinRoomDirect = useCallback(async (roomId) => {
    try {
      const { data } = await axios.post(`/api/rooms/${roomId}/join`);

      if (data.success) {
        await loadRooms();
        setActiveRoom(data.room);
        toast.success("Joined room");
        return true;
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }

    return false;
  }, [axios, loadRooms]);

  const requestJoin = useCallback(async (roomId) => {
    try {
      const { data } = await axios.post(`/api/rooms/${roomId}/request`);

      if (data.success) {
        toast.success("Request sent");
        await loadRooms();
        return true;
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
    return false;
  }, [axios, loadRooms]);

  const inviteFriend = useCallback(async (roomId, userId) => {
    try {
      const { data } = await axios.post(`/api/rooms/${roomId}/invite`, { userId });
      if (data.success) return data.inviteUrl || data.token;
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  }, [axios]);

  const loadRoomMessages = useCallback(async (roomId) => {
    try {
      const { data } = await axios.get(`/api/rooms/${roomId}/messages`);
      if (data.success) {
        setRoomMessages(Array.isArray(data.messages) ? data.messages : []);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  }, [axios]);

  const loadPresence = useCallback(async (roomId) => {
    try {
      const { data } = await axios.get(`/api/rooms/${roomId}/presence`);

      if (data.success) {
        setPresence({
          present: Array.isArray(data.present) ? data.present : [],
          absent: Array.isArray(data.absent) ? data.absent : [],
          members: Array.isArray(data.members) ? data.members : []
        });
      }
    } catch {}
  }, [axios]);

  const sendRoomMessage = useCallback(async (roomId, payload) => {
    try {
      const { data } = await axios.post(`/api/rooms/${roomId}/messages`, payload);

      if (data.success) {
        setRoomMessages(prev => {
          const exists = prev.find(m => m._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  }, [axios]);

  const deleteRoomMessage = useCallback(async (messageId, deleteType) => {
    try {
      const { data } = await axios.delete(`/api/rooms/messages/${messageId}`, {
        data: { deleteType }
      });
      if (data.success) {
        if (deleteType === "forMe") {
          setRoomMessages(prev => prev.filter(m => m._id !== messageId));
        } else {
          setRoomMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeletedForEveryone: true, text: "", image: "", file: null } : m));
        }
        toast.success(data.message || "Message deleted");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  }, [axios]);

  const onMsg = useCallback((msg) => {
    if (msg.roomId === activeRoom?._id) {
      setRoomMessages(prev => {
        const exists = prev.find(m => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    }
  }, [activeRoom?._id]);

  useEffect(() => {
    if (!socket) return;

    if (activeRoom?._id) {
      socket.emit("room:join", activeRoom._id);
      loadPresence(activeRoom._id);
    }

    const onTyping = ({ roomId, userId, typing }) => {
      if (roomId !== activeRoom?._id) return;
      setTypingUsers(t => ({ ...t, [userId]: typing }));
    };

    const onDeleteForMe = (messageId) => {
      setRoomMessages(prev => prev.filter(m => m._id !== messageId));
    };

    const onDeleteForEveryone = ({ id }) => {
      setRoomMessages(prev => prev.map(m => m._id === id ? { ...m, isDeletedForEveryone: true, text: "", image: "", file: null } : m));
    };

    socket.on("room:message", onMsg);
    socket.on("room:typing", onTyping);
    socket.on("room:messageDeletedForMe", onDeleteForMe);
    socket.on("room:messageDeletedForEveryone", onDeleteForEveryone);

    return () => {
      socket.off("room:message", onMsg);
      socket.off("room:typing", onTyping);
      socket.off("room:messageDeletedForMe", onDeleteForMe);
      socket.off("room:messageDeletedForEveryone", onDeleteForEveryone);

      if (activeRoom?._id) socket.emit("room:leave", activeRoom._id);
    };
  }, [socket, activeRoom?._id, loadPresence, onMsg]);

  useEffect(() => {
    if (authUser) loadRooms();
    else {
      setRooms({ created: [], joined: [], other: [] });
      setInvitations([]);
      setActiveRoom(null);
    }
  }, [authUser, loadRooms]);

  return (
    <RoomContext.Provider
      value={{
        rooms,
        invitations,
        acceptRoomInvite,
        rejectRoomInvite,
        activeRoom,
        setActiveRoom,
        loadRooms,
        createRoom,
        joinRoomDirect,
        requestJoin,
        inviteFriend,
        loadRoomMessages,
        sendRoomMessage,
        deleteRoomMessage,
        summarizeRoom,
        roomMessages,
        typingUsers,
        isMember,
        isAdmin,
        presence,
        socket 
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}