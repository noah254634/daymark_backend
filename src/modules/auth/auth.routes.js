import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    changeUserPassword,
    updateUserProfile
} from "./auth.controller.js";
import {
    validateRegister,
    validateLogin,
    validatePasswordChange,
    validateProfileUpdate
} from "./auth.validation.js";
import authenticate from "../../middleware/authenticate.js";

const router = express.Router();

// Public auth routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", logoutUser);

// Protected routes (requires valid cookie session or Bearer token)
router.get("/me", authenticate, getCurrentUser);
router.post("/change-password", authenticate, validatePasswordChange, changeUserPassword);
router.patch("/profile", authenticate, validateProfileUpdate, updateUserProfile);

export default router;
