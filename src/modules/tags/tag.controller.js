import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import tagService from "./tag.service.js";

export const getTags = asyncHandler(async (req, res) => {
    const { tags, meta } = await tagService.getAllTags(req.query);
    return res.status(200).json(new ApiResponse(200, "Tags retrieved successfully", tags, meta));
});

export const getTagByIdOrSlug = asyncHandler(async (req, res) => {
    const tag = await tagService.getTagByIdOrSlug(req.params.idOrSlug);
    return res.status(200).json(new ApiResponse(200, "Tag retrieved successfully", tag));
});

export const getTagArticles = asyncHandler(async (req, res) => {
    const { articles, meta } = await tagService.getTagArticles(req.params.idOrSlug, req.query);
    return res.status(200).json(new ApiResponse(200, "Tag articles retrieved successfully", articles, meta));
});

export const createTag = asyncHandler(async (req, res) => {
    const tag = await tagService.createTag(req.body);
    return res.status(201).json(new ApiResponse(201, "Tag created successfully", tag));
});

export const updateTag = asyncHandler(async (req, res) => {
    const tag = await tagService.updateTag(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Tag updated successfully", tag));
});

export const deleteTag = asyncHandler(async (req, res) => {
    await tagService.deleteTag(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Tag deleted successfully", null));
});
