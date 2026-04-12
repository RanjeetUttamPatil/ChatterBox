// middleware to authenticate user using JWT
import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
        const decoded = jwt.verify(token, secret);  // the verify method will throw an error if the token is invalid or expired and if correct it will return the decoded payload which contains the userId and iat (issued at time) and exp (expiration time)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();  // to contimue to next middleware or controller
    } catch (error) {
        res.json({ success: false, message: "Authentication failed" });
        console.error("Error in authenticateUser:", error);
    }
} 
