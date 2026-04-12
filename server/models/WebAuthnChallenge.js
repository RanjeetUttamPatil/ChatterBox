import mongoose from "mongoose";

const webAuthnChallengeSchema = new mongoose.Schema({
  challenge: { type: String, required: true, unique: true },
  username:  { type: String }, // optional, stored during registration begin
  type:      { type: String, enum: ["registration", "authentication"], required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // expires in 5 minutes
});

export default mongoose.model("WebAuthnChallenge", webAuthnChallengeSchema);
