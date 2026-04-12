import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import mongoose from "mongoose";
import User from "../models/User.js";
import WebAuthnChallenge from "../models/WebAuthnChallenge.js";
import { generateToken } from "../lib/utils.js";

const RP_ID   = process.env.RPC_ID   || "localhost";
const ORIGIN  = process.env.ORIGIN  || "http://localhost:5173";
const RP_NAME = process.env.RP_NAME || "ChatterBox";

// ─── STEP 1 — Begin Registration ───────────────────────────────────────────────
export const registerBegin = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.trim().length < 2) {
      return res.json({ success: false, message: "Username must be at least 2 characters" });
    }

    const existing = await User.findOne({ username: username.trim().toLowerCase() });
    if (existing) {
      return res.json({ success: false, message: "Username already taken" });
    }

    const tempUserId = new mongoose.Types.ObjectId();

    const options = await generateRegistrationOptions({
      rpName:          RP_NAME,
      rpID:            RP_ID,
      userID:          tempUserId.id, 
      userName:        username.trim(),
      userDisplayName: username.trim(),
      attestationType: "none",
      authenticatorSelection: {
        residentKey:      "required",
        userVerification: "preferred",
      },
    });

    // Store the challenge for later verification
    await WebAuthnChallenge.create({
      challenge: options.challenge,
      username:  username.trim().toLowerCase(),
      type:      "registration",
    });

    res.json({ success: true, options, challengeId: options.challenge });
  } catch (error) {
    console.error("registerBegin error:", error);
    res.json({ success: false, message: "Server error starting registration" });
  }
};

// ─── STEP 2 — Complete Registration ──────────────────────────────────────────
export const registerComplete = async (req, res) => {
  try {
    const { registrationResponse, challengeId, bio } = req.body;

    const saved = await WebAuthnChallenge.findOne({ challenge: challengeId, type: "registration" });
    if (!saved) return res.json({ success: false, message: "Registration session expired (5 min limit)" });

    const verification = await verifyRegistrationResponse({
      response:          registrationResponse,
      expectedChallenge: saved.challenge,
      expectedOrigin:    ORIGIN,
      expectedRPID:      RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.json({ success: false, message: "Biometric verification failed" });
    }

    const { credential } = verification.registrationInfo;

    const newUser = await User.create({
      username:  saved.username,
      fullName:  saved.username, // Use username as default fullName
      profilePic: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(saved.username)}&backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B`,
      bio:       bio || "",
      passkeys: [{
        credentialId: credential.id,
        publicKey:    Buffer.from(credential.publicKey).toString("base64"),
        counter:      credential.counter,
        deviceType:   credential.deviceType,
        transports:   registrationResponse.response?.transports || [],
      }]
    });

    await saved.deleteOne();
    const token = generateToken(newUser._id);

    res.json({ success: true, userData: newUser, token, message: "Successfully registered!" });
  } catch (error) {
    console.error("registerComplete error:", error.message);
    res.json({ success: false, message: "Registration error: " + error.message });
  }
};

// ─── STEP 3 — Begin Authentication ─────────────────────────────────────────────
export const authenticateBegin = async (req, res) => {
  try {
    const options = await generateAuthenticationOptions({
      rpID:             RP_ID,
      userVerification: "preferred",
      allowCredentials: [], // Allow any registered passkey for this RP
    });

    await WebAuthnChallenge.create({
      challenge: options.challenge,
      type:      "authentication",
    });

    res.json({ success: true, options, challengeId: options.challenge });
  } catch (error) {
    console.error("authenticateBegin error:", error);
    res.json({ success: false, message: "Server error starting login" });
  }
};

// ─── STEP 4 — Complete Authentication ──────────────────────────────────────────
export const authenticateComplete = async (req, res) => {
  try {
    const { assertionResponse, challengeId } = req.body;

    // 1. Find the challenge
    const saved = await WebAuthnChallenge.findOne({ challenge: challengeId, type: "authentication" });
    if (!saved) return res.json({ success: false, message: "Login session expired. Try again." });

    // 2. Find the user by the credential ID provided by browser
    const credentialId = assertionResponse.id;
    const user = await User.findOne({ "passkeys.credentialId": credentialId });
    if (!user) return res.json({ success: false, message: "Passkey not recognized on this server." });

    const passkey = user.passkeys.find(pk => pk.credentialId === credentialId);

    // 3. Verify the biometric signature
    const verification = await verifyAuthenticationResponse({
      response:          assertionResponse,
      expectedChallenge: saved.challenge,
      expectedOrigin:    ORIGIN,
      expectedRPID:      RP_ID,
      credential: {
        id:         passkey.credentialId,
        publicKey:  Buffer.from(passkey.publicKey, "base64"),
        counter:    passkey.counter,
        transports: passkey.transports,
      },
    });

    if (!verification.verified) return res.json({ success: false, message: "Biometric check failed." });

    // 4. Update counter to prevent replays
    passkey.counter = verification.authenticationInfo.newCounter;
    await user.save();
    await saved.deleteOne();

    const token = generateToken(user._id);

    res.json({ success: true, userData: user, token, message: "Logged in successfully!" });
  } catch (error) {
    console.error("authenticateComplete error:", error.message);
    res.json({ success: false, message: "Verification error: " + error.message });
  }
};
