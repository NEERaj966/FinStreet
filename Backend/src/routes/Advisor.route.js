import { Router } from "express";
import { getFinancialAdvice } from "../controller/Advisor.Controller.js";
import { verifyJWTForUser } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWTForUser, getFinancialAdvice);

export default router;
