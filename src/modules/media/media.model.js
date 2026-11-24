import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true,
            trim: true
        },

        mimeType: {
            type: String,
            required: true,
            trim: true
        },

        mediaType: {
            type: String,
            enum: ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"],
            required: true
        },

        storageProvider: {
            type: String,
            enum: ["R2", "S3", "CLOUDINARY", "LOCAL"],
            required: true
        },

        storageKey: {
            type: String,
            required: true,
            trim: true
        },

        publicUrl: {
            type: String,
            default: null
        },

        sizeBytes: {
            type: Number,
            required: true,
            min: 0
        },

        width: {
            type: Number,
            default: null
        },

        height: {
            type: Number,
            default: null
        },

        durationSeconds: {
            type: Number,
            default: null
        },

        altText: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
        },

        caption: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
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

mediaSchema.index(
    { storageProvider: 1, storageKey: 1 },
    { unique: true }
);

mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ mediaType: 1 });

const Media = mongoose.model("Media", mediaSchema);

export default Media;