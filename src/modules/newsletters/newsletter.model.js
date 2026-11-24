import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email address is required"],
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address"
            ]
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACTIVE",
                "UNSUBSCRIBED"
            ],
            default: "PENDING"
        },

        source: {
            type: String,
            trim: true,
            default: "WEBSITE"
        },

        confirmationTokenHash: {
            type: String,
            select: false,
            default: null
        },

        unsubscribeTokenHash: {
            type: String,
            select: false,
            default: null
        },

        subscribedAt: {
            type: Date,
            default: Date.now
        },

        confirmedAt: {
            type: Date,
            default: null
        },

        unsubscribedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

newsletterSchema.index(
    { email: 1 },
    { unique: true }
);

newsletterSchema.index({ status: 1 });

const Newsletter = mongoose.model(
    "Newsletter",
    newsletterSchema
);

export default Newsletter;