import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            maxlength: 80
        },

        slug: {
            type: String,
            required: [true, "Category slug is required"],
            lowercase: true,
            trim: true,
            match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },

        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            default: null
        },

        displayOrder: {
            type: Number,
            default: 0
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

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;