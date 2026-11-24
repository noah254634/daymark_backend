import ApiError from "../../utils/ApiError.js";
import { isValidObjectId } from "../../utils/helpers.js";

export const validateTagId = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid tag ID format");
    }
    next();
};

export const validateCreateTag = (req, res, next) => {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new ApiError(400, "Tag name is required");
    }
    next();
};

export const validateUpdateTag = (req, res, next) => {
    const { name } = req.body;
    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
        throw new ApiError(400, "Tag name cannot be empty");
    }
    next();
};
