import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import commentService from "./comment.service.js";

export const getComments = asyncHandler(async (req, res) => {
    const { comments, meta } = await commentService.getAllComments(req.query);
    return res.status(200).json(new ApiResponse(200, "Comments retrieved successfully", comments, meta));
});

export const getCommentById = asyncHandler(async (req, res) => {
    const comment = await commentService.getCommentById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Comment retrieved successfully", comment));
});

export const createComment = asyncHandler(async (req, res) => {
    const comment = await commentService.createComment(req.body, req.user);
    return res.status(201).json(new ApiResponse(201, "Comment submitted successfully (pending moderation)", comment));
});

export const updateComment = asyncHandler(async (req, res) => {
    const comment = await commentService.updateBody(req.params.id, req.body.body);
    return res.status(200).json(new ApiResponse(200, "Comment updated successfully", comment));
});

export const updateCommentStatus = asyncHandler(async (req, res) => {
    const comment = await commentService.updateStatus(req.params.id, req.body.status);
    return res.status(200).json(new ApiResponse(200, "Comment status updated successfully", comment));
});

export const deleteComment = asyncHandler(async (req, res) => {
    await commentService.deleteComment(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Comment deleted successfully", null));
});
