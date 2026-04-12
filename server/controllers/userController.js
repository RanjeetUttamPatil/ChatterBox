import { generateToken } from "../lib/utils.js"
import User from "../models/User.js"
import Message from "../models/Message.js"
import Room from "../models/Room.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"


//controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    res.json({ success: true, user: req.user, message: "User is authenticated" });
}

// cotroller to update the user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, profilePic, bio } = req.body;
        const userId = req.user._id;

        let updatedUser;  

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { bio, fullName },  // only the bio and fulName will be updated if the profilePic is not provided
                { new: true }  // returns the updated data after update
            );
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    profilePic: upload.secure_url,
                    bio,
                    fullName
                },
                { new: true }
            );
        }

        res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// get user stats for dashboard
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [messagesSent, roomsCount, totalUsers] = await Promise.all([
            Message.countDocuments({ senderId: userId }),
            Room.countDocuments({ members: userId, isExpired: { $ne: true } }),
            User.countDocuments({ _id: { $ne: userId } })
        ]);

        res.json({
            success: true,
            stats: {
                messagesSent,
                activeRooms: roomsCount,
                totalUsers
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
