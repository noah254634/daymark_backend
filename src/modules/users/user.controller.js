import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import userService from "./user.service.js";

export const getUsers = asyncHandler(async (req, res) => {
    const { users, meta } = await userService.getAllUsers(req.query);
    return res.status(200).json(new ApiResponse(200, "Users retrieved successfully", users, meta));
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "User retrieved successfully", user));
});

export const createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    return res.status(201).json(new ApiResponse(201, "User created successfully", user));
});

export const updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "User updated successfully", user));
});

export const deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    return res.status(200).json(new ApiResponse(200, "User deleted successfully", null));
});
