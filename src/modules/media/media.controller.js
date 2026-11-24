import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import mediaService from "./media.service.js";

export const requestUploadUrl = asyncHandler(async (req, res) => {
    const session = await mediaService.createPresignedUploadSession({
        ...req.body,
        uploadedBy: req.user?._id || req.body.uploadedBy
    });
    return res.status(201).json(
        new ApiResponse(201, "Presigned upload URL generated successfully", session)
    );
});

export const confirmUpload = asyncHandler(async (req, res) => {
    const media = await mediaService.confirmMediaUpload(req.params.id, req.body);
    return res.status(200).json(
        new ApiResponse(200, "Media upload confirmed and activated", media)
    );
});

export const getMediaList = asyncHandler(async (req, res) => {
    const { media, meta } = await mediaService.getAllMedia(req.query);
    return res.status(200).json(new ApiResponse(200, "Media files retrieved successfully", media, meta));
});

export const getMediaById = asyncHandler(async (req, res) => {
    const media = await mediaService.getMediaById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Media retrieved successfully", media));
});

export const updateMedia = asyncHandler(async (req, res) => {
    const media = await mediaService.updateMedia(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Media updated successfully", media));
});

export const deleteMedia = asyncHandler(async (req, res) => {
    await mediaService.removeMedia(req.params.id);
    return res.status(200).json(
        new ApiResponse(200, "Media deleted from Cloudflare R2 and database successfully", null)
    );
});
