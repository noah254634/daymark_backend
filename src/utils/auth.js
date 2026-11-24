import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../config/environment.js";

/**
 * Hash a plain text password with bcrypt
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with stored hash
 */
export const comparePassword = async (password, hash) => {
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
};

/**
 * Sign a JWT token
 */
export const generateToken = (payload, expiresIn = env.JWT_EXPIRES_IN) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Standard httpOnly cookie configuration for auth token session
 */
export const getCookieOptions = () => ({
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

/**
 * Cookie options for clearing the auth session
 */
export const getClearCookieOptions = () => ({
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax"
});
