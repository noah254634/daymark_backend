import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tag name is required"],
            trim: true,
            maxlength: 60
        },

        slug: {
            type: String,
            required: [true, "Tag slug is required"],
            lowercase: true,
            trim: true,
            match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        },

        description: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
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

tagSchema.index({ slug: 1 }, { unique: true });
tagSchema.index({ name: 1 });

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;