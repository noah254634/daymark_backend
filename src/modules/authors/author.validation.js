import ApiError from "../../utils/ApiError.js";
import { isValidObjectId } from "../../utils/helpers.js";

export const validateAuthorId = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid author ID format");
    }
    next();
};

export const validateCreateAuthor = (req, res, next) => {
    const { name, user } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        throw new ApiError(400, "Author name must be at least 2 characters long");
    }

    if (user && !isValidObjectId(user)) {
        throw new ApiError(400, "Invalid user ID format");
    }

    next();
};

export const validateUpdateAuthor = (req, res, next) => {
    const { name, user } = req.body;

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
        throw new ApiError(400, "Author name must be at least 2 characters long");
    }

    if (user !== undefined && user !== null && !isValidObjectId(user)) {
        throw new ApiError(400, "Invalid user ID format");
    }

    next();
};
