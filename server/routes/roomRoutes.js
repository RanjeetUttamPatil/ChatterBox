import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  createRoom,
  listMyRooms,
  getRoom,
  joinRoomDirect,
  requestToJoin,
  handleJoinRequest,
  inviteFriend,
  acceptInvite,
  rejectInvite,
  getRoomMessages,
  sendRoomMessage,
  updateRoomTimer,
  getRoomPresence,
  adminAddMember,
  adminRemoveMember,
  deleteRoomMessage,
  summarizeRoomMessages,
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/", protectRoute, createRoom);
router.get("/", protectRoute, listMyRooms);
router.get("/:id", protectRoute, getRoom);
router.post("/:id/join", protectRoute, joinRoomDirect);
router.post("/:id/request", protectRoute, requestToJoin);
router.post("/:id/requests/:userId", protectRoute, handleJoinRequest);
router.post("/:id/invite", protectRoute, inviteFriend);
router.post("/accept-invite", protectRoute, acceptInvite);
router.post("/reject-invite", protectRoute, rejectInvite);
router.get("/:id/messages", protectRoute, getRoomMessages);
router.post("/:id/messages", protectRoute, sendRoomMessage);
router.patch("/:id/timer", protectRoute, updateRoomTimer);
router.get("/:id/summary", protectRoute, summarizeRoomMessages);
router.get("/:id/presence", protectRoute, getRoomPresence);
router.post("/:id/members", protectRoute, adminAddMember);
router.delete("/:id/members/:userId", protectRoute, adminRemoveMember);
router.delete("/messages/:id", protectRoute, deleteRoomMessage);

export default router;
