import express from "express";
import {
    getAuthors,
    getAuthorByIdOrSlug,
    getAuthorArticles,
    createAuthor,
    updateAuthor,
    deleteAuthor
} from "./author.controller.js";
import {
    validateAuthorId,
    validateCreateAuthor,
    validateUpdateAuthor
} from "./author.validation.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

// Public routes
router.get("/", getAuthors);
router.get("/:idOrSlug", getAuthorByIdOrSlug);
router.get("/:idOrSlug/articles", getAuthorArticles);

// Protected routes
router.post(
    "/",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN"),
    validateCreateAuthor,
    createAuthor
);

router.route("/:id")
    .put(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateAuthorId,
        validateUpdateAuthor,
        updateAuthor
    )
    .patch(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateAuthorId,
        validateUpdateAuthor,
        updateAuthor
    )
    .delete(
        authenticate,
        authorize("SUPER_ADMIN"),
        validateAuthorId,
        deleteAuthor
    );

export default router;
