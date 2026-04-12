import express from "express"
import { checkAuth, updateProfile, getUserStats } from "../controllers/userController.js"
import { protectRoute } from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.get("/check", protectRoute, checkAuth)
userRouter.get("/stats", protectRoute, getUserStats)
userRouter.put("/update-profile", protectRoute, updateProfile)

export default userRouter
