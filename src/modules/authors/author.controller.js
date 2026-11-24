import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import authorService from "./author.service.js";

export const getAuthors = asyncHandler(async (req, res) => {
    const { authors, meta } = await authorService.getAllAuthors(req.query);
    return res.status(200).json(new ApiResponse(200, "Authors retrieved successfully", authors, meta));
});

export const getAuthorByIdOrSlug = asyncHandler(async (req, res) => {
    const author = await authorService.getAuthorByIdOrSlug(req.params.idOrSlug);
    return res.status(200).json(new ApiResponse(200, "Author retrieved successfully", author));
});

export const getAuthorArticles = asyncHandler(async (req, res) => {
    const { articles, meta } = await authorService.getAuthorArticles(req.params.idOrSlug, req.query);
    return res.status(200).json(new ApiResponse(200, "Author articles retrieved successfully", articles, meta));
});

export const createAuthor = asyncHandler(async (req, res) => {
    const author = await authorService.createAuthor(req.body);
    return res.status(201).json(new ApiResponse(201, "Author created successfully", author));
});

export const updateAuthor = asyncHandler(async (req, res) => {
    const author = await authorService.updateAuthor(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Author updated successfully", author));
});

export const deleteAuthor = asyncHandler(async (req, res) => {
    await authorService.deleteAuthor(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Author deleted successfully", null));
});
