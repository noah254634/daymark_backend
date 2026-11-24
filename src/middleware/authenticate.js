import User from "../modules/users/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/auth.js";

const authenticate = asyncHandler(async (req, res, next) => {
    let token = null;

    // 1. Check httpOnly cookie first (standard for browser sessions)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // 2. Fall back to Authorization: Bearer <token> (mobile apps, Postman, scripts)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw new ApiError(401, "Access denied. No authentication session or token provided");
    }

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError(401, "Authentication session has expired. Please log in again");
        }
        throw new ApiError(401, "Invalid authentication token");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        throw new ApiError(401, "User associated with this session no longer exists");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account has been deactivated. Please contact support");
    }

    req.user = user;
    next();
});

export default authenticate;
