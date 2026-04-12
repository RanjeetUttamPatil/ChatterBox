import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true },  // unique identity — replaces email
  fullName:   { type: String, default: "" },                   // display name (optional, editable)
  profilePic: { type: String, default: "" },
  bio:        { type: String, default: "" },

  // WebAuthn passkeys — one per registered device
  passkeys: [
    {
      credentialId: { type: String, required: true },   // base64url string from device
      publicKey:    { type: String, required: true },   // base64-encoded COSE public key
      counter:      { type: Number, default: 0 },       // replay-attack counter
      deviceType:   { type: String },                   // "singleDevice" | "multiDevice"
      transports:   [{ type: String }],                 // ["internal"] for built-in biometrics
      createdAt:    { type: Date, default: Date.now }
    }
  ],

  friends:        [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  sentRequests:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  blockedUsers:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);