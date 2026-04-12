import mongoose from "mongoose";

const roomMessageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    image: { type: String },
    file: {
      url: { type: String },
      name: { type: String },
      size: { type: Number },
      mime: { type: String },
    },
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    system: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeletedForEveryone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("RoomMessage", roomMessageSchema);
