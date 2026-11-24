import ApiError from "../../utils/ApiError.js";
import { isValidObjectId } from "../../utils/helpers.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "JOURNALIST"];

export const validateUserIdParam = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid user ID format");
    }
    next();
};

export const validateCreateUser = (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        throw new ApiError(400, "User name must be at least 2 characters long");
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    if (!password || typeof password !== "string" || password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
        throw new ApiError(400, `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(", ")}`);
    }

    next();
};

export const validateUpdateUser = (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
        throw new ApiError(400, "User name must be at least 2 characters long");
    }

    if (email !== undefined && !EMAIL_REGEX.test(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    if (password !== undefined && (typeof password !== "string" || password.length < 8)) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
        throw new ApiError(400, `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(", ")}`);
    }

    next();
};
