import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import newsletterService from "./newsletter.service.js";

export const getSubscribers = asyncHandler(async (req, res) => {
    const { subscribers, meta } = await newsletterService.getAllSubscribers(req.query);
    return res.status(200).json(new ApiResponse(200, "Subscribers retrieved successfully", subscribers, meta));
});

export const subscribe = asyncHandler(async (req, res) => {
    const result = await newsletterService.subscribe(req.body);
    const message = result.alreadySubscribed
        ? "You are already subscribed to the newsletter"
        : result.resubscribed
            ? "Successfully re-subscribed to the newsletter"
            : "Successfully subscribed to the newsletter";

    const statusCode = result.created ? 201 : 200;
    return res.status(statusCode).json(new ApiResponse(statusCode, message, result.subscriber));
});

export const unsubscribe = asyncHandler(async (req, res) => {
    await newsletterService.unsubscribe(req.body.email);
    return res.status(200).json(new ApiResponse(200, "Successfully unsubscribed from the newsletter", null));
});

export const updateSubscriberStatus = asyncHandler(async (req, res) => {
    const subscriber = await newsletterService.updateStatus(req.params.id, req.body.status);
    return res.status(200).json(new ApiResponse(200, "Subscriber status updated successfully", subscriber));
});

export const deleteSubscriber = asyncHandler(async (req, res) => {
    await newsletterService.deleteSubscriber(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Subscriber deleted successfully", null));
});
