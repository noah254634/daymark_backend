import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import categoryService from "./category.service.js";

export const getCategories = asyncHandler(async (req, res) => {
    const { categories, meta } = await categoryService.getAllCategories(req.query);
    return res.status(200).json(new ApiResponse(200, "Categories retrieved successfully", categories, meta));
});

export const getCategoryByIdOrSlug = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryByIdOrSlug(req.params.idOrSlug);
    return res.status(200).json(new ApiResponse(200, "Category retrieved successfully", category));
});

export const getCategoryArticles = asyncHandler(async (req, res) => {
    const { articles, meta } = await categoryService.getCategoryArticles(req.params.idOrSlug, req.query);
    return res.status(200).json(new ApiResponse(200, "Category articles retrieved successfully", articles, meta));
});

export const createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    return res.status(201).json(new ApiResponse(201, "Category created successfully", category));
});

export const updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Category updated successfully", category));
});

export const deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Category deleted successfully", null));
});
