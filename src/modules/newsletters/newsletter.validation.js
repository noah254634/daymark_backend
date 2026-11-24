import ApiError from "../../utils/ApiError.js";
import { isValidObjectId } from "../../utils/helpers.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUSES = ["PENDING", "ACTIVE", "UNSUBSCRIBED"];

export const validateNewsletterId = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid subscriber ID format");
    }
    next();
};

export const validateEmailInput = (req, res, next) => {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email.trim())) {
        throw new ApiError(400, "Please provide a valid email address");
    }
    next();
};

export const validateSubscriberStatus = (req, res, next) => {
    const { status } = req.body;
    if (!status || !ALLOWED_STATUSES.includes(status.toUpperCase())) {
        throw new ApiError(400, `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
    }
    next();
};
