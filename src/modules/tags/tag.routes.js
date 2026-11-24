import express from "express";
import {
    getTags,
    getTagByIdOrSlug,
    getTagArticles,
    createTag,
    updateTag,
    deleteTag
} from "./tag.controller.js";
import {
    validateTagId,
    validateCreateTag,
    validateUpdateTag
} from "./tag.validation.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

// Public routes
router.get("/", getTags);
router.get("/:idOrSlug", getTagByIdOrSlug);
router.get("/:idOrSlug/articles", getTagArticles);

// Protected routes
router.post(
    "/",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
    validateCreateTag,
    createTag
);

router.route("/:id")
    .put(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateTagId,
        validateUpdateTag,
        updateTag
    )
    .patch(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateTagId,
        validateUpdateTag,
        updateTag
    )
    .delete(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN"),
        validateTagId,
        deleteTag
    );

export default router;
