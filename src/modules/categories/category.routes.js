import express from "express";
import {
    getCategories,
    getCategoryByIdOrSlug,
    getCategoryArticles,
    createCategory,
    updateCategory,
    deleteCategory
} from "./category.controller.js";
import {
    validateCategoryId,
    validateCreateCategory,
    validateUpdateCategory
} from "./category.validation.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:idOrSlug", getCategoryByIdOrSlug);
router.get("/:idOrSlug/articles", getCategoryArticles);

// Protected routes
router.post(
    "/",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
    validateCreateCategory,
    createCategory
);

router.route("/:id")
    .put(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateCategoryId,
        validateUpdateCategory,
        updateCategory
    )
    .patch(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateCategoryId,
        validateUpdateCategory,
        updateCategory
    )
    .delete(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN"),
        validateCategoryId,
        deleteCategory
    );

export default router;
