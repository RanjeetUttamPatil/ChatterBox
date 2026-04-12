import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  type: {
    type: String,
    enum: ["friend_request", "room_invite", "message", "info"]
  },

  content: {
    type: String
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },

  inviteToken: {
    type: String
  },

  isRead: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
},{timestamps:true});

export default mongoose.model("Notification", NotificationSchema);