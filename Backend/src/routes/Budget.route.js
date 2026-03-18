import { Router } from "express";
import {
  createBudget,
  getUserBudgets,
  updateBudget,
  deleteBudget
} from "../controller/Budget.Controller.js";
import { verifyJWTForUser } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWTForUser, createBudget);
router.route("/").get(verifyJWTForUser, getUserBudgets);
router.route("/:budgetId").patch(verifyJWTForUser, updateBudget);
router.route("/:budgetId").delete(verifyJWTForUser, deleteBudget);

export default router;
