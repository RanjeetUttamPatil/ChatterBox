import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    unfriend, 
    blockUser, 
    unblockUser,
    generateQrToken,
    consumeQrToken
} from "../controllers/friendController.js";

const router = express.Router();

// also we are using dynamic routes here where :id is the id of the user we want to send request to or accept request from or 
// reject request from or unfriend or block or unblock and we are using protectRoute middleware to make sure that only 
// authenticated users can access these routes

router.post("/request/:id", protectRoute, sendFriendRequest);
router.post("/accept/:id", protectRoute, acceptFriendRequest);
router.post("/reject/:id", protectRoute, rejectFriendRequest);
router.post("/unfriend/:id", protectRoute, unfriend);
router.post("/block/:id", protectRoute, blockUser);
router.post("/unblock/:id", protectRoute, unblockUser);
router.post("/qr-token", protectRoute, generateQrToken);
router.post("/qr-token/consume", protectRoute, consumeQrToken);

export default router;
