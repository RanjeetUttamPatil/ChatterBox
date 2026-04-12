import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
  deleteMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

// Get users for sidebar (excluding logged-in user)
messageRouter.get("/users", protectRoute, getUsersForSidebar);

// Get all messages with selected user
messageRouter.get("/:id", protectRoute, getMessages);

// Mark message as seen
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);


// socket.io will be used to send messages in real-time
messageRouter.post("/send/:id", protectRoute, sendMessage);

// Delete message
messageRouter.delete("/:id", protectRoute, deleteMessage);

export default messageRouter;
