import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        article: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Article",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        guestName: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        guestEmail: {
            type: String,
            lowercase: true,
            trim: true,
            maxlength: 254,
            default: ""
        },

        body: {
            type: String,
            required: [true, "Comment cannot be empty"],
            trim: true,
            minlength: 1,
            maxlength: 3000
        },

        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "SPAM"
            ],
            default: "PENDING"
        },

        isEdited: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// A comment must belong to an authenticated user
// or have a guest name.
commentSchema.pre("validate", function () {
    if (!this.user && !this.guestName) {
        this.invalidate(
            "guestName",
            "A guest name is required when no user account is associated with the comment"
        );
    }
});

commentSchema.index({
    article: 1,
    status: 1,
    createdAt: -1
});

commentSchema.index({ parentComment: 1 });

commentSchema.index({ user: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;