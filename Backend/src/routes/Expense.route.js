import { Router } from "express";
import multer from "multer";
import {
    addExpense,
    getUserExpenses,
    updateExpense,
    deleteExpense,
    getTotalExpenses,
    importPaytmPassbook
} from "../controller/Expense.Controller.js";
import { verifyJWTForUser } from "../middleware/auth.middleware.js";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        const lowerName = String(file.originalname || "").toLowerCase();
        const isExcelFile =
            lowerName.endsWith(".xlsx") ||
            lowerName.endsWith(".xls");

        if (!isExcelFile) {
            cb(new Error("Only Excel files are allowed"));
            return;
        }

        cb(null, true);
    }
});

router.route("/").post(verifyJWTForUser, addExpense);
router.route("/").get(verifyJWTForUser, getUserExpenses);
router.route("/import/paytm-passbook").post(
    verifyJWTForUser,
    upload.single("statement"),
    importPaytmPassbook
);
router.route("/total").get(verifyJWTForUser, getTotalExpenses);
router.route("/:expenseId").patch(verifyJWTForUser, updateExpense);
router.route("/:expenseId").delete(verifyJWTForUser, deleteExpense);

export default router;
