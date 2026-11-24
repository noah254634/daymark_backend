import User from "../users/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { hashPassword, comparePassword, generateToken } from "../../utils/auth.js";

class AuthService {
    async register({ name, email, password, role = "JOURNALIST" }) {
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            throw new ApiError(409, "An account with this email address already exists");
        }

        const passwordHash = await hashPassword(password);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role,
            isActive: true,
            isVerified: false
        });

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return { user, token };
    }

    async login({ email, password }) {
        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        if (!user.isActive) {
            throw new ApiError(403, "Your account is disabled. Please contact the administrator");
        }

        user.lastLoginAt = new Date();
        await user.save();

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return { user: user.toJSON(), token };
    }

    async changePassword(userId, { currentPassword, newPassword }) {
        const user = await User.findById(userId).select("+passwordHash");
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new ApiError(400, "Current password is incorrect");
        }

        user.passwordHash = await hashPassword(newPassword);
        await user.save();

        return true;
    }

    async updateProfile(userId, { name, email }) {
        const updates = {};
        if (name) updates.name = name.trim();

        if (email) {
            const normalized = email.toLowerCase().trim();
            const duplicate = await User.findOne({ email: normalized, _id: { $ne: userId } });
            if (duplicate) {
                throw new ApiError(409, "Email is already taken by another account");
            }
            updates.email = normalized;
        }

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return user;
    }
}

export default new AuthService();
