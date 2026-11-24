import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from "./user.controller.js";
import {
    validateUserIdParam,
    validateCreateUser,
    validateUpdateUser
} from "./user.validation.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

// Protected user management routes
router.use(authenticate);

router.route("/")
    .get(authorize("SUPER_ADMIN", "ADMIN", "EDITOR"), getUsers)
    .post(authorize("SUPER_ADMIN", "ADMIN"), validateCreateUser, createUser);

router.route("/:id")
    .get(validateUserIdParam, getUserById)
    .put(authorize("SUPER_ADMIN", "ADMIN"), validateUserIdParam, validateUpdateUser, updateUser)
    .patch(authorize("SUPER_ADMIN", "ADMIN"), validateUserIdParam, validateUpdateUser, updateUser)
    .delete(authorize("SUPER_ADMIN"), validateUserIdParam, deleteUser);

export default router;
