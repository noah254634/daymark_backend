import ApiError from "../../utils/ApiError.js";
import { isValidObjectId } from "../../utils/helpers.js";

const ALLOWED_STATUSES = ["DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

export const validateArticleId = (req, res, next) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid article ID format");
    }
    next();
};

export const validateCreateArticle = (req, res, next) => {
    const { title, excerpt, content, category, author } = req.body;

    if (!title || typeof title !== "string" || title.trim().length < 5) {
        throw new ApiError(400, "Article title must be at least 5 characters long");
    }

    if (!excerpt || typeof excerpt !== "string" || excerpt.trim().length === 0) {
        throw new ApiError(400, "Article excerpt is required");
    }

    if (!content) {
        throw new ApiError(400, "Article content is required");
    }

    if (!category || !isValidObjectId(category)) {
        throw new ApiError(400, "A valid category ID is required");
    }

    // Author can be passed explicitly or inferred from authenticated user's author profile
    if (author && !isValidObjectId(author)) {
        throw new ApiError(400, "Invalid author ID format");
    }

    if (req.body.status && !ALLOWED_STATUSES.includes(req.body.status)) {
        throw new ApiError(400, `Invalid article status. Allowed: ${ALLOWED_STATUSES.join(", ")}`);
    }

    next();
};

export const validateUpdateArticle = (req, res, next) => {
    const { title, category, status } = req.body;

    if (title !== undefined && (typeof title !== "string" || title.trim().length < 5)) {
        throw new ApiError(400, "Article title must be at least 5 characters long");
    }

    if (category !== undefined && !isValidObjectId(category)) {
        throw new ApiError(400, "Invalid category ID format");
    }

    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
        throw new ApiError(400, `Invalid article status. Allowed: ${ALLOWED_STATUSES.join(", ")}`);
    }

    next();
};

export const validateArticleStatus = (req, res, next) => {
    const { status } = req.body;
    if (!status || !ALLOWED_STATUSES.includes(status.toUpperCase())) {
        throw new ApiError(400, `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
    }
    next();
};
