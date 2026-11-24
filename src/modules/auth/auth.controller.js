import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import authService from "./auth.service.js";
import { getCookieOptions, getClearCookieOptions } from "../../utils/auth.js";

export const registerUser = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    // Set httpOnly session cookie
    res.cookie("token", result.token, getCookieOptions());

    return res.status(201).json(new ApiResponse(201, "User registered successfully", result));
});

export const loginUser = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    // Set httpOnly session cookie
    res.cookie("token", result.token, getCookieOptions());

    return res.status(200).json(new ApiResponse(200, "Login successful", result));
});

export const logoutUser = asyncHandler(async (req, res) => {
    // Clear httpOnly session cookie
    res.clearCookie("token", getClearCookieOptions());

    return res.status(200).json(new ApiResponse(200, "Logged out successfully", null));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, "Current user retrieved successfully", req.user));
});

export const changeUserPassword = asyncHandler(async (req, res) => {
    await authService.changePassword(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, "Password changed successfully", null));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
    const updatedUser = await authService.updateProfile(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, "Profile updated successfully", updatedUser));
});
