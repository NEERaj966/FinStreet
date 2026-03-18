import { Router } from "express";
import {
    createEvent,
    generateRandomEvent,
    getEventOptions,
    applyEventImpact
} from "../controller/Event.Controller.js";
import { verifyJWTForUser } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWTForUser, createEvent);
router.route("/random").get(verifyJWTForUser, generateRandomEvent);
router.route("/:eventId/options").get(verifyJWTForUser, getEventOptions);
router.route("/:eventId/apply").post(verifyJWTForUser, applyEventImpact);

export default router;
