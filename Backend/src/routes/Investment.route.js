import { Router } from "express";
import {
    createInvestment,
    getUserInvestments
} from "../controller/Investment.Controller.js";
import { verifyJWTForUser } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWTForUser, createInvestment);
router.route("/").get(verifyJWTForUser, getUserInvestments);

export default router;
