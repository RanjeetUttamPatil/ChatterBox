import mongoose from "mongoose";

const connectTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model("ConnectToken", connectTokenSchema);
