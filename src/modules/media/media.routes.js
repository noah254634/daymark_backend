import express from "express";
import {
    requestUploadUrl,
    confirmUpload,
    getMediaList,
    getMediaById,
    updateMedia,
    deleteMedia
} from "./media.controller.js";
import {
    validateMediaId,
    validateUploadRequest
} from "./media.validation.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

// Public media retrieval
router.get("/", getMediaList);
router.get("/:id", validateMediaId, getMediaById);

// Protected upload and media management
router.post(
    "/upload-url",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "EDITOR", "JOURNALIST"),
    validateUploadRequest,
    requestUploadUrl
);

router.post(
    "/:id/confirm",
    authenticate,
    validateMediaId,
    confirmUpload
);

router.route("/:id")
    .put(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateMediaId,
        updateMedia
    )
    .patch(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN", "EDITOR"),
        validateMediaId,
        updateMedia
    )
    .delete(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN"),
        validateMediaId,
        deleteMedia
    );

export default router;
