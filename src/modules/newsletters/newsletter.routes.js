import express from "express";
import {
    getSubscribers,
    subscribe,
    unsubscribe,
    updateSubscriberStatus,
    deleteSubscriber
} from "./newsletter.controller.js";
import {
    validateNewsletterId,
    validateEmailInput,
    validateSubscriberStatus
} from "./newsletter.validation.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

// Public subscription actions
router.post("/subscribe", validateEmailInput, subscribe);
router.post("/unsubscribe", validateEmailInput, unsubscribe);

// Protected subscriber management
router.get("/", authenticate, authorize("SUPER_ADMIN", "ADMIN", "EDITOR"), getSubscribers);

router.route("/:id")
    .patch(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN"),
        validateNewsletterId,
        validateSubscriberStatus,
        updateSubscriberStatus
    )
    .delete(
        authenticate,
        authorize("SUPER_ADMIN", "ADMIN"),
        validateNewsletterId,
        deleteSubscriber
    );

export default router;
