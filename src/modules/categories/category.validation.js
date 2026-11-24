import ApiError from "../../utils/ApiError.js";
import { isValidObjectId } from "../../utils/helpers.js";

export const validateCategoryId = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid category ID format");
    }
    next();
};

export const validateCreateCategory = (req, res, next) => {
    const { name, parentCategory, image } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new ApiError(400, "Category name is required");
    }

    if (parentCategory && !isValidObjectId(parentCategory)) {
        throw new ApiError(400, "Invalid parentCategory ID format");
    }

    if (image && !isValidObjectId(image)) {
        throw new ApiError(400, "Invalid image media ID format");
    }

    next();
};

export const validateUpdateCategory = (req, res, next) => {
    const { name, parentCategory, image } = req.body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
        throw new ApiError(400, "Category name cannot be empty");
    }

    if (parentCategory !== undefined && parentCategory !== null && !isValidObjectId(parentCategory)) {
        throw new ApiError(400, "Invalid parentCategory ID format");
    }

    if (image !== undefined && image !== null && !isValidObjectId(image)) {
        throw new ApiError(400, "Invalid image media ID format");
    }

    next();
};
