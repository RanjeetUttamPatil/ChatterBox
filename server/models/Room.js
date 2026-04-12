import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    allowRequests: { type: Boolean, default: true },
    maxMembers: { type: Number },
    expiresAt: { type: Date, required: true, index: true },
    passwordHash: { type: String },
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    inviteTokens: [
      {
        token: { type: String },
        invitedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        expiresAt: { type: Date },
        used: { type: Boolean, default: false },
      },
    ],
    isExpired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
