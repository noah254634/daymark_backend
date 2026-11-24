import express from "express";
import {
    getArticles,
    getBreakingNews,
    getFeaturedArticles,
    getArticleByIdOrSlug,
    createArticle,
    updateArticle,
    updateArticleStatus,
    deleteArticle
} from "./article.controller.js";
import {
    validateArticleId,
    validateCreateArticle,
    validateUpdateArticle,
    validateArticleStatus
} from "./article.validation.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

// Public article browsing
router.get("/", getArticles);
router.get("/feed/breaking", getBreakingNews);
router.get("/feed/featured", getFeaturedArticles);
router.get("/:idOrSlug", getArticleByIdOrSlug);

// Protected authoring and editing routes
router.post(
    "/",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "EDITOR", "JOURNALIST"),
    validateCreateArticle,
    createArticle
);

router.route("/:id")
    .put(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR", "JOURNALIST"),
        validateArticleId,
        validateUpdateArticle,
        updateArticle
    )
    .patch(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR", "JOURNALIST"),
        validateArticleId,
        validateUpdateArticle,
        updateArticle
    )
    .delete(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateArticleId,
        deleteArticle
    );

router.patch(
    "/:id/status",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
    validateArticleId,
    validateArticleStatus,
    updateArticleStatus
);

export default router;
