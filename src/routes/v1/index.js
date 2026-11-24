import express from "express";

import authRoutes from "../../modules/auth/auth.routes.js";
import articleRoutes from "../../modules/articles/article.routes.js";
import authorRoutes from "../../modules/authors/author.routes.js";
import categoryRoutes from "../../modules/categories/category.routes.js";
import userRoutes from "../../modules/users/user.routes.js";
import tagRoutes from "../../modules/tags/tag.routes.js";
import mediaRoutes from "../../modules/media/media.routes.js";
import commentRoutes from "../../modules/comments/comment.routes.js";
import newsletterRoutes from "../../modules/newsletters/newsletter.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/articles", articleRoutes);
router.use("/authors", authorRoutes);
router.use("/categories", categoryRoutes);
router.use("/users", userRoutes);
router.use("/tags", tagRoutes);
router.use("/media", mediaRoutes);
router.use("/comments", commentRoutes);
router.use("/newsletters", newsletterRoutes);

export default router;
