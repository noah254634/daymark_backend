import express from "express";
import {
    getComments,
    getCommentById,
    createComment,
    updateComment,
    updateCommentStatus,
    deleteComment
} from "./comment.controller.js";
import {
    validateCommentId,
    validateCreateComment,
    validateUpdateCommentBody,
    validateCommentStatus
} from "./comment.validation.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

// Optional authentication middleware for comment creation (attaches user if token present)
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        return authenticate(req, res, next);
    }
    next();
};

// Public reading and posting
router.route("/")
    .get(getComments)
    .post(optionalAuth, validateCreateComment, createComment);

router.route("/:id")
    .get(validateCommentId, getCommentById)
    .put(authenticate, validateCommentId, validateUpdateCommentBody, updateComment)
    .delete(authenticate, authorize("SUPER_ADMIN", "ADMIN", "EDITOR"), validateCommentId, deleteComment);

// Moderation route
router.patch(
    "/:id/status",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
    validateCommentId,
    validateCommentStatus,
    updateCommentStatus
);

export default router;
