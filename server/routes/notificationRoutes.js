import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  clearNotifications,
  deleteNotification
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

// Get all notifications
notificationRouter.get("/", protectRoute, getNotifications);

// Mark all notifications as read
notificationRouter.patch("/mark-all-read", protectRoute, markAllRead);

// Mark notification as read
notificationRouter.patch("/:id", protectRoute, markNotificationRead);

// Clear all notifications
notificationRouter.delete("/", protectRoute, clearNotifications);

// Delete single notification
notificationRouter.delete("/:id", protectRoute, deleteNotification);

export default notificationRouter;