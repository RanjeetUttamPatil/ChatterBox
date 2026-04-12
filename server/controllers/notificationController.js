import Notification from "../models/Notification.js"


// to get all notifications of a user
export const getNotifications = async (req,res)=>{
  try{
    const notifications = await Notification
      .find({receiver:req.user._id})
      .populate("sender","fullName profilePic")
      .sort({createdAt:-1})
    res.json({
      success:true,
      notifications
    })

  }
  catch(error){
    console.log(error.message)
    res.json({
      success:false,
      message:error.message
    })

  }
}

// to mark a notification as read
export const markNotificationRead = async (req,res)=>{
  try{
    const {id} = req.params

    await Notification.findOneAndUpdate({
      _id: id,
      receiver: req.user._id
    }, {
      isRead:true
    })

    res.json({
      success:true,
      message:"Notification updated"
    })
  }
  catch(error){
    res.json({
      success:false,
      message:error.message
    })
  }
}

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// to clear all notifications of a user
export const clearNotifications = async (req,res)=>{
  try{
    await Notification.deleteMany({
      receiver:req.user._id
    })

    res.json({
      success:true,
      message:"Notifications cleared"
    })

  }
  catch(error){
    res.json({
      success:false,
      message:error.message
    })

  }

}

// to delete a single notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, receiver: req.user._id });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};