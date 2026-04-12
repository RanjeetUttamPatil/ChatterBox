import jwt from "jsonwebtoken"

export const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
    return jwt.sign({ userId }, secret);  // creates the userID to tocken => payload + signature + header
};
