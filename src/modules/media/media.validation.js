import ApiError from "../../utils/ApiError.js";
import { isValidObjectId } from "../../utils/helpers.js";

export const validateMediaId = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid media ID format");
    }
    next();
};

export const validateUploadRequest = (req, res, next) => {
    const { fileName, mimeType } = req.body;

    if (!fileName || typeof fileName !== "string" || fileName.trim().length === 0) {
        throw new ApiError(400, "fileName is required");
    }

    if (!mimeType || typeof mimeType !== "string" || mimeType.trim().length === 0) {
        throw new ApiError(400, "mimeType is required");
    }

    next();
};
