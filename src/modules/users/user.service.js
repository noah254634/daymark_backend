import User from "./user.model.js";
import ApiError from "../../utils/ApiError.js";
import { hashPassword } from "../../utils/auth.js";
import { parsePagination, buildPaginationMeta } from "../../utils/helpers.js";

class UserService {
    async getAllUsers(query) {
        const { page, limit, skip } = parsePagination(query);
        const filter = {};

        if (query.role) {
            filter.role = query.role;
        }

        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === "true";
        }

        if (query.isVerified !== undefined) {
            filter.isVerified = query.isVerified === "true";
        }

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: "i" } },
                { email: { $regex: query.search, $options: "i" } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(filter)
        ]);

        const meta = buildPaginationMeta(total, page, limit);
        return { users, meta };
    }

    async getUserById(id) {
        const user = await User.findById(id).lean();
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        return user;
    }

    async createUser({ name, email, password, role, isActive, isVerified }) {
        const normalizedEmail = email.toLowerCase().trim();

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            throw new ApiError(409, "A user with this email already exists");
        }

        const passwordHash = await hashPassword(password);

        return await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: role || "JOURNALIST",
            isActive: isActive !== undefined ? isActive : true,
            isVerified: isVerified !== undefined ? isVerified : false
        });
    }

    async updateUser(id, updateData) {
        const updates = { ...updateData };

        if (updates.email) {
            updates.email = updates.email.toLowerCase().trim();
            const duplicate = await User.findOne({ email: updates.email, _id: { $ne: id } });
            if (duplicate) {
                throw new ApiError(409, "Email is already in use by another user");
            }
        }

        if (updates.password) {
            updates.passwordHash = await hashPassword(updates.password);
            delete updates.password;
        }

        const user = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return user;
    }

    async deleteUser(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        return true;
    }
}

export default new UserService();
