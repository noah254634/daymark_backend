import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "User name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address"
            ]
        },

        passwordHash: {
            type: String,
            required: [true, "Password hash is required"],
            select: false
        },

        role: {
            type: String,
            enum: {
                values: [
                    "SUPER_ADMIN",
                    "ADMIN",
                    "EDITOR",
                    "JOURNALIST"
                ],
                message: "{VALUE} is not a valid user role"
            },
            default: "JOURNALIST",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        lastLoginAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true,
        versionKey: false
    }
);

// Remove sensitive information from serialized documents
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.passwordHash;
        return ret;
    }
});

const User = mongoose.model("User", userSchema);

export default User;