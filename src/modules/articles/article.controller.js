import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import articleService from "./article.service.js";

export const getArticles = asyncHandler(async (req, res) => {
    const { articles, meta } = await articleService.getAllArticles(req.query);
    return res.status(200).json(new ApiResponse(200, "Articles retrieved successfully", articles, meta));
});

export const getBreakingNews = asyncHandler(async (req, res) => {
    const articles = await articleService.getBreakingNews(req.query.limit);
    return res.status(200).json(new ApiResponse(200, "Breaking news retrieved successfully", articles));
});

export const getFeaturedArticles = asyncHandler(async (req, res) => {
    const articles = await articleService.getFeaturedArticles(req.query.limit);
    return res.status(200).json(new ApiResponse(200, "Featured articles retrieved successfully", articles));
});

export const getArticleByIdOrSlug = asyncHandler(async (req, res) => {
    const article = await articleService.getArticleByIdOrSlug(req.params.idOrSlug);
    return res.status(200).json(new ApiResponse(200, "Article retrieved successfully", article));
});

export const createArticle = asyncHandler(async (req, res) => {
    const article = await articleService.createArticle(req.body, req.user?._id);
    return res.status(201).json(new ApiResponse(201, "Article created successfully", article));
});

export const updateArticle = asyncHandler(async (req, res) => {
    const article = await articleService.updateArticle(req.params.id, req.body, req.user?._id);
    return res.status(200).json(new ApiResponse(200, "Article updated successfully", article));
});

export const updateArticleStatus = asyncHandler(async (req, res) => {
    const article = await articleService.updateStatus(req.params.id, req.body.status, req.user?._id);
    return res.status(200).json(new ApiResponse(200, "Article status updated successfully", article));
});

export const deleteArticle = asyncHandler(async (req, res) => {
    await articleService.deleteArticle(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Article deleted successfully", null));
});
