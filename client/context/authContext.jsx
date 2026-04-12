import { createContext, useEffect } from "react";
import axios from 'axios'
import { useState } from "react";
import toast from "react-hot-toast";
import {io} from 'socket.io-client'
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

const backendUrl = import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:6000`;
axios.defaults.baseURL = backendUrl;

const getAlternateBackendUrl = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") return null;
    if (u.port === "6000") return `${u.protocol}//${u.hostname}:6001`;
    if (u.port === "6001") return `${u.protocol}//${u.hostname}:6000`;
    return `${u.protocol}//${u.hostname}:6000`;
  } catch {
    return null;
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const[token,setToken] = useState(localStorage.getItem("token"))
  const[authUser,setAuthUser] = useState(null)
  const[loading,setLoading] = useState(true)
  const[onlineUsers,setOnlineUsers] = useState([])
  const[socket, setSocket] = useState(null)

  //checking ki user is authenticated or not, if so then set user data and the connect soket
  const checkAuth = async ()=> {
    try {
      const {data} = await axios.get("/api/auth/check")
      if(data.success) {
        setAuthUser(data.user)
        connectSocket(data.user)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    if(token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth()
    } else {
      setLoading(false)
    }
  },[])
  useEffect(()=>{
    const reqInterceptor = axios.interceptors.request.use((config)=>{
      const t = localStorage.getItem("token");
      if(t) config.headers.token = t;
      return config;
    });
    const resInterceptor = axios.interceptors.response.use(
      (res)=>res,
      async (err)=>{
        const cfg = err?.config;
        if (
          err?.code === "ERR_NETWORK" &&
          cfg &&
          !cfg.__networkRetried
        ) {
          const currentBase = cfg.baseURL || axios.defaults.baseURL || backendUrl;
          const alternateBase = getAlternateBackendUrl(currentBase);
          if (alternateBase) {
            cfg.__networkRetried = true;
            cfg.baseURL = alternateBase;
            axios.defaults.baseURL = alternateBase;
            return axios(cfg);
          }
        }
        return Promise.reject(err);
      }
    );
    return ()=>{
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    }
  },[])

  // Helper to set auth state after successful login/register
  const setLoggedIn = (userData, jwtToken) => {
    setAuthUser(userData);
    connectSocket(userData);
    axios.defaults.headers.common["token"] = jwtToken;
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
  };

  // REGISTER with Passkey
  const registerPasskey = async (username, bio) => {
    try {
      // Step 1 — Get registration options from server
      const { data: beginData } = await axios.post("/api/passkey/register-begin", { username });
      if (!beginData.success) {
        toast.error(beginData.message);
        return false;
      }

      // Step 2 — Browser triggers biometric
      const registrationResponse = await startRegistration({ optionsJSON: beginData.options });

      // Step 3 — Verify on server, get JWT + user data
      const { data } = await axios.post("/api/passkey/register-complete", {
        challengeId: beginData.challengeId,
        registrationResponse,
        bio
      });

      if (data.success) {
        setLoggedIn(data.userData, data.token);
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      if (err?.name === "NotAllowedError") {
        toast.error("Registration cancelled.");
      } else {
        toast.error(err.message || "Registration failed");
      }
      return false;
    }
  };

  // LOGIN with Passkey
  const loginWithPasskey = async () => {
    try {
      // Step 1 — Get authentication challenge
      const { data: beginData } = await axios.post("/api/passkey/auth-begin");
      if (!beginData.success) {
        toast.error(beginData.message);
        return false;
      }

      // Step 2 — Browser shows passkey picker
      const assertionResponse = await startAuthentication({ optionsJSON: beginData.options });

      // Step 3 — Verify on server, get JWT + user data
      const { data } = await axios.post("/api/passkey/auth-complete", {
        challengeId: beginData.challengeId,
        assertionResponse,
      });

      if (data.success) {
        setLoggedIn(data.userData, data.token);
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      if (err?.name === "NotAllowedError") {
        toast.error("Login cancelled.");
      } else {
        toast.error(err.message || "Login failed");
      }
      return false;
    }
  };

  // Logout function
  const logout = async () => {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);
      axios.defaults.headers.common["token"] = null;
      toast.success("Logged out successfully");
      socket?.disconnect();
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };



  // connecting the socket connection and online users update

  const connectSocket = (userData)=> {
      if(!userData || socket?.connected) return;
      const socketBaseUrl = axios.defaults.baseURL || backendUrl;
      const newSocket = io(socketBaseUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { userId: userData._id }
      })
      newSocket.connect()
      setSocket(newSocket)

      newSocket.on("getOnlineUsers", (userIds)=>{
        setOnlineUsers(userIds)
      })

      newSocket.on("connect", ()=>{
        // no-op
      })
      newSocket.on("connect_error", ()=>{
        // no-op
      })
      newSocket.on("reconnect_attempt", ()=>{
        // no-op
      })
  }


  const value = {
    axios,
    authUser,
    loading,
    onlineUsers,
    socket,
    registerPasskey,
    loginWithPasskey,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
