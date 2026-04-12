import express from "express";
import {
  registerBegin,
  registerComplete,
  authenticateBegin,
  authenticateComplete,
} from "../controllers/passkeyController.js";

const passkeyRouter = express.Router();

// Registration
passkeyRouter.post("/register-begin",    registerBegin);
passkeyRouter.post("/register-complete", registerComplete);

// Authentication
passkeyRouter.post("/auth-begin",    authenticateBegin);
passkeyRouter.post("/auth-complete", authenticateComplete);

export default passkeyRouter;
