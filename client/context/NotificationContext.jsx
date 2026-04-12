import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "./authContext"
import { toast } from "react-hot-toast"

export const NotificationContext = createContext()

export const NotificationProvider = ({children}) => {
  const { socket, axios, authUser } = useContext(AuthContext)
  const [notifications,setNotifications] = useState([])

  const getNotifications = async ()=>{
    if (!authUser) return
    try{
      const res = await axios.get("/api/notifications")
      setNotifications(res.data.notifications)
    }
    catch(error){
      console.log(error)
    }
  }

  const markRead = async(id)=>{
    try{
      await axios.patch(`/api/notifications/${id}`)
      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? {...n,isRead:true} : n
        )
      )
    }
    catch(error){
      console.log(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.log(error);
    }
  };

  const clearNotifications = async ()=>{
    try{
      await axios.delete("/api/notifications")
      setNotifications([])
    }
    catch(error){
      console.log(error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(()=>{
    if (authUser) {
      getNotifications()
    } else {
      setNotifications([])
    }
  },[authUser])

  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev])
      
      // Show toast for new notification
      if (notification.type === "friend_request") {
        toast.success(`New friend request from ${notification.sender.fullName}`, {
          icon: '👤',
        })
      } else if (notification.type === "room_invite") {
        toast.success(`You were invited to a room by ${notification.sender.fullName}`, {
          icon: '🏠',
        })
      } else if (notification.type === "message") {
        // Optional: don't toast for messages if already in chat
        // toast(`New message from ${notification.sender.fullName}`, { icon: '💬' })
      }
    }

    socket.on("newNotification", handleNewNotification)

    return () => {
      socket.off("newNotification", handleNewNotification)
    }
  }, [socket])

  return(
    <NotificationContext.Provider
      value={{
        notifications,
        getNotifications,
        markRead,
        markAllAsRead,
        clearNotifications,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}