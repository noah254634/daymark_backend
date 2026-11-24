import ApiError from "../../utils/ApiError.js";
import { isValidObjectId } from "../../utils/helpers.js";

const ALLOWED_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SPAM"];

export const validateCommentId = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid comment ID format");
    }
    next();
};

export const validateCreateComment = (req, res, next) => {
    const { article, body, guestName, parentComment } = req.body;

    if (!article || !isValidObjectId(article)) {
        throw new ApiError(400, "A valid article ID is required");
    }

    if (!body || typeof body !== "string" || body.trim().length === 0) {
        throw new ApiError(400, "Comment body cannot be empty");
    }

    if (!req.user && (!guestName || typeof guestName !== "string" || guestName.trim().length === 0)) {
        throw new ApiError(400, "Guest name is required for anonymous comments");
    }

    if (parentComment && !isValidObjectId(parentComment)) {
        throw new ApiError(400, "Invalid parentComment ID format");
    }

    next();
};

export const validateUpdateCommentBody = (req, res, next) => {
    const { body } = req.body;
    if (!body || typeof body !== "string" || body.trim().length === 0) {
        throw new ApiError(400, "Comment body cannot be empty");
    }
    next();
};

export const validateCommentStatus = (req, res, next) => {
    const { status } = req.body;
    if (!status || !ALLOWED_STATUSES.includes(status.toUpperCase())) {
        throw new ApiError(400, `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
    }
    next();
};
