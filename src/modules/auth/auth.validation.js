import ApiError from "../../utils/ApiError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        throw new ApiError(400, "Name must be at least 2 characters long");
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    if (!password || typeof password !== "string" || password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    next();
};

export const validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
        throw new ApiError(400, "Current password is required");
    }

    if (!newPassword || newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters long");
    }

    if (currentPassword === newPassword) {
        throw new ApiError(400, "New password must be different from current password");
    }

    next();
};

export const validateProfileUpdate = (req, res, next) => {
    const { name, email } = req.body;

    if (!name && !email) {
        throw new ApiError(400, "At least one field (name or email) is required to update");
    }

    if (name && (typeof name !== "string" || name.trim().length < 2)) {
        throw new ApiError(400, "Name must be at least 2 characters long");
    }

    if (email && !EMAIL_REGEX.test(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    next();
};
