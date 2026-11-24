import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
    {
        // Optional connection to a platform user.
        // Guest contributors do not need a User account.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: undefined
        },

        name: {
            type: String,
            required: [true, "Author name is required"],
            trim: true,
            minlength: [2, "Author name must contain at least 2 characters"],
            maxlength: [100, "Author name cannot exceed 100 characters"]
        },

        slug: {
            type: String,
            required: [true, "Author slug is required"],
            lowercase: true,
            trim: true,
            match: [
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug must contain lowercase letters, numbers and hyphens"
            ]
        },

        biography: {
            type: String,
            trim: true,
            maxlength: [1000, "Biography cannot exceed 1000 characters"],
            default: ""
        },

        profileImage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            default: null
        },

        socialLinks: {
            website: {
                type: String,
                trim: true,
                default: ""
            },

            linkedin: {
                type: String,
                trim: true,
                default: ""
            },

            x: {
                type: String,
                trim: true,
                default: ""
            }
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// An author slug must be unique.
authorSchema.index(
    { slug: 1 },
    { unique: true }
);

// A platform user can have only one author profile.
// Guest authors without a user reference are excluded.
authorSchema.index(
    { user: 1 },
    {
        unique: true,
        partialFilterExpression: {
            user: { $type: "objectId" }
        }
    }
);

const Author = mongoose.model("Author", authorSchema);

export default Author;