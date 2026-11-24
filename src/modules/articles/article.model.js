import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Article title is required"],
            trim: true,
            minlength: 5,
            maxlength: 200
        },

        slug: {
            type: String,
            required: [true, "Article slug is required"],
            lowercase: true,
            trim: true,
            match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        },

        excerpt: {
            type: String,
            required: [true, "Article excerpt is required"],
            trim: true,
            maxlength: 500
        },

        // Structured editor content.
        // We will eventually use TipTap JSON here.
        content: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        // Primary author
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Author",
            required: true
        },

        // Additional contributors
        contributors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Author"
            }
        ],

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag"
            }
        ],

        featuredImage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            default: null
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "IN_REVIEW",
                "SCHEDULED",
                "PUBLISHED",
                "ARCHIVED"
            ],
            default: "DRAFT",
            required: true
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        isBreaking: {
            type: Boolean,
            default: false
        },

        publishedAt: {
            type: Date,
            default: null
        },

        scheduledAt: {
            type: Date,
            default: null
        },

        readingTimeMinutes: {
            type: Number,
            default: 0,
            min: 0
        },

        viewCount: {
            type: Number,
            default: 0,
            min: 0
        },

        seo: {
            metaTitle: {
                type: String,
                trim: true,
                maxlength: 70,
                default: ""
            },

            metaDescription: {
                type: String,
                trim: true,
                maxlength: 170,
                default: ""
            },

            keywords: {
                type: [String],
                default: []
            }
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Slugs must be unique.
articleSchema.index({ slug: 1 }, { unique: true });

// Public article discovery.
articleSchema.index({
    status: 1,
    publishedAt: -1
});

// Category-based article discovery.
articleSchema.index({
    category: 1,
    status: 1,
    publishedAt: -1
});

// Featured articles.
articleSchema.index({
    isFeatured: 1,
    status: 1,
    publishedAt: -1
});

// Breaking news.
articleSchema.index({
    isBreaking: 1,
    status: 1,
    publishedAt: -1
});

// Author-based article discovery.
articleSchema.index({
    author: 1,
    publishedAt: -1
});

// Tag-based article discovery.
articleSchema.index({ tags: 1 });

const Article = mongoose.model("Article", articleSchema);

export default Article;