import mongoose from "mongoose";
import { Expense } from "../models/Expanse.model.js";
import { Budget } from "../models/Budget.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { buildPaytmPassbookPayload } from "../utills/PaytmPassbook.js";
import { normalizeCategoryName } from "../constants/categories.js";
import {
    MONTHLY_FREQUENCY,
    getMonthKey,
    syncRecurringExpenses
} from "../utills/RecurringExpenses.js";

// Prefer authenticated user id, allow params/body for admin or service calls
const resolveUserId = (req) => {
    const userId = req.user?._id || req.params?.userId || req.body?.userId;
    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    if (typeof userId === "string") {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user id");
        }
        return new mongoose.Types.ObjectId(userId);
    }

    return userId;
};

// Normalize and validate currency amount
const parseExpenseAmount = (amount) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new ApiError(400, "Amount must be a positive number");
    }
    return numericAmount;
};

// Accepts ISO/date-like strings and returns a Date instance
const parseExpenseDate = (date) => {
    if (!date) return undefined;
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new ApiError(400, "Invalid date");
    }
    return parsedDate;
};

const parseSpentAt = (value) => {
    if (value === undefined) return undefined;
    const normalized = String(value ?? "").trim();
    return normalized || null;
};

const parseRecurringFlag = (value) => {
    if (value === undefined) return undefined;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
    }
    return Boolean(value);
};

const getMonthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { start, end };
};

const getMonthlyExpenseTotal = async (userId, start, end) => {
    const totals = await Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    return totals.length > 0 ? totals[0].total : 0;
};

const getMonthlyBudgetLimit = async (userId) => {
    const budgets = await Budget.aggregate([
        { $match: { userId, period: "monthly" } },
        { $group: { _id: null, total: { $sum: "$limit" }, count: { $sum: 1 } } }
    ]);

    if (!budgets.length) {
        return { total: 0, count: 0 };
    }

    return { total: budgets[0].total || 0, count: budgets[0].count || 0 };
};

const reconcileMonthlyOverage = async (userId, asOf = new Date()) => {
    const { start, end } = getMonthRange(asOf);
    const monthKey = getMonthKey(asOf);

    const user = await User.findById(userId).select(
        "savings monthlyExpenseOverage monthlyExpenseOverageKey monthlySavings monthlySavingsKey"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.monthlyExpenseOverageKey !== monthKey) {
        user.monthlyExpenseOverage = 0;
        user.monthlyExpenseOverageKey = monthKey;
    }
    if (user.monthlySavingsKey !== monthKey) {
        user.monthlySavings = 0;
        user.monthlySavingsKey = monthKey;
    }

    const [expenseTotal, budgetInfo] = await Promise.all([
        getMonthlyExpenseTotal(userId, start, end),
        getMonthlyBudgetLimit(userId)
    ]);

    const budgetLimit = budgetInfo.count ? budgetInfo.total : 0;
    const newOverage = budgetInfo.count
        ? Math.max(0, expenseTotal - budgetLimit)
        : 0;

    const delta = newOverage - (user.monthlyExpenseOverage || 0);
    if (delta !== 0) {
        user.savings = (user.savings || 0) - delta;
    }

    user.monthlyExpenseOverage = newOverage;
    user.monthlyExpenseOverageKey = monthKey;
    user.monthlySavings = budgetInfo.count
        ? Number((budgetLimit - expenseTotal).toFixed(2))
        : 0;
    user.monthlySavingsKey = monthKey;
    await user.save();

    return { budgetLimit, expenseTotal, overage: newOverage, delta };
};

const importPaytmPassbook = asyncHandler(async (req, res) => {
    const userId = resolveUserId(req);

    if (!req.file?.buffer) {
        throw new ApiError(400, "Excel file is required");
    }

    const payload = buildPaytmPassbookPayload(req.file.buffer, {
        fileName: req.file.originalname
    });

    const expenseSourceKeys = payload.expenses.map((item) => item.sourceKey).filter(Boolean);
    const existingExpenses = expenseSourceKeys.length
        ? await Expense.find({
            userId,
            source: "paytm-passbook",
            sourceKey: { $in: expenseSourceKeys }
        }).select("sourceKey")
        : [];
    const existingExpenseKeys = new Set(
        existingExpenses.map((item) => item.sourceKey).filter(Boolean)
    );

    const expenseDocs = payload.expenses
        .filter((item) => !existingExpenseKeys.has(item.sourceKey))
        .map((item) => ({
            userId,
            category: item.category,
            amount: item.amount,
            date: parseExpenseDate(item.date),
            spentAt: parseSpentAt(item.spentAt),
            transactionDetails: item.transactionDetails,
            account: item.account,
            otherTransactionDetails: item.otherTransactionDetails,
            upiRefNo: item.upiRefNo,
            orderId: item.orderId,
            remarks: item.remarks,
            tag: item.tag,
            source: item.source,
            sourceKey: item.sourceKey
        }));

    const insertedExpenses = expenseDocs.length
        ? await Expense.insertMany(expenseDocs)
        : [];

    const user = await User.findById(userId).select("mainAccountBalance mainAccountTransactions");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const existingMainAccountKeys = new Set(
        (user.mainAccountTransactions || [])
            .map((item) => item.sourceKey)
            .filter(Boolean)
    );

    const newMainAccountEntries = payload.mainAccount.entries.filter(
        (item) => !existingMainAccountKeys.has(item.sourceKey)
    );
    const totalNewCredits = newMainAccountEntries.reduce(
        (sum, entry) => sum + Number(entry.amount || 0),
        0
    );

    if (newMainAccountEntries.length) {
        user.mainAccountBalance = Number(user.mainAccountBalance || 0) + totalNewCredits;
        user.mainAccountTransactions = [
            ...(user.mainAccountTransactions || []),
            ...newMainAccountEntries
        ];
        await user.save();
    }

    if (insertedExpenses.length) {
        await reconcileMonthlyOverage(userId);
    }

    const refreshedUser = await User.findById(userId).select("-password");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...payload,
                importResult: {
                    importedExpenseCount: insertedExpenses.length,
                    skippedExpenseCount: payload.expenses.length - insertedExpenses.length,
                    importedMainAccountCount: newMainAccountEntries.length,
                    skippedMainAccountCount:
                        payload.mainAccount.entries.length - newMainAccountEntries.length
                },
                expenseRecords: insertedExpenses,
                user: refreshedUser
            },
            "Paytm passbook imported successfully"
        )
    );
});

// Add a new expense for the user
const addExpense = asyncHandler(async (req, res) => {
    const userId = resolveUserId(req);
    const { category, amount, date, spentAt, isRecurring } = req.body;

    if (!category || category.trim() === "") {
        throw new ApiError(400, "Category is required");
    }

    const parsedDate = parseExpenseDate(date);
    const recurringEnabled = parseRecurringFlag(isRecurring) === true;

    const expense = await Expense.create({
        userId,
        category: normalizeCategoryName(category),
        spentAt: parseSpentAt(spentAt),
        amount: parseExpenseAmount(amount),
        date: parsedDate,
        isRecurring: recurringEnabled,
        recurringFrequency: recurringEnabled ? MONTHLY_FREQUENCY : null,
        recurringStartDate: recurringEnabled ? parsedDate || new Date() : null,
        recurrenceMonthKey: getMonthKey(parsedDate || new Date())
    });

    if (recurringEnabled) {
        await syncRecurringExpenses(userId);
    }

    await reconcileMonthlyOverage(userId);

    return res
        .status(201)
        .json(new ApiResponse(201, expense, "Expense created successfully"));
});

// Fetch all expenses for the user
const getUserExpenses = asyncHandler(async (req, res) => {
    const userId = resolveUserId(req);
    const syncResult = await syncRecurringExpenses(userId);

    if (syncResult.createdCount > 0) {
        await reconcileMonthlyOverage(userId);
    }

    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

// Update a specific expense for the user
const updateExpense = asyncHandler(async (req, res) => {
    const userId = resolveUserId(req);
    const { expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
        throw new ApiError(400, "Invalid expense id");
    }

    const updates = {};
    const existingExpense = await Expense.findOne({ _id: expenseId, userId });
    if (!existingExpense) {
        throw new ApiError(404, "Expense not found");
    }

    if (req.body.category !== undefined) {
        if (!req.body.category || req.body.category.trim() === "") {
            throw new ApiError(400, "Category cannot be empty");
        }
        updates.category = normalizeCategoryName(req.body.category);
    }

    if (req.body.amount !== undefined) {
        updates.amount = parseExpenseAmount(req.body.amount);
    }

    if (req.body.spentAt !== undefined) {
        updates.spentAt = parseSpentAt(req.body.spentAt);
    }

    if (req.body.date !== undefined) {
        updates.date = parseExpenseDate(req.body.date);
        updates.recurrenceMonthKey = getMonthKey(updates.date);
        if (existingExpense.isRecurring && !existingExpense.isAutoGenerated) {
            updates.recurringStartDate = updates.date;
        }
    }

    if (req.body.isRecurring !== undefined && !existingExpense.isAutoGenerated) {
        const recurringEnabled = parseRecurringFlag(req.body.isRecurring) === true;
        updates.isRecurring = recurringEnabled;
        updates.recurringFrequency = recurringEnabled ? MONTHLY_FREQUENCY : null;
        updates.recurringStartDate =
            recurringEnabled
                ? updates.date || existingExpense.recurringStartDate || existingExpense.date
                : null;
        updates.recurringSkipMonths = recurringEnabled
            ? existingExpense.recurringSkipMonths || []
            : [];
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No fields provided for update");
    }

    const updatedExpense = await Expense.findOneAndUpdate(
        { _id: expenseId, userId },
        { $set: updates },
        { new: true }
    );

    if (updatedExpense?.isRecurring && !updatedExpense.isAutoGenerated) {
        await syncRecurringExpenses(userId);
    }

    await reconcileMonthlyOverage(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedExpense, "Expense updated successfully"));
});

// Delete a specific expense for the user
const deleteExpense = asyncHandler(async (req, res) => {
    const userId = resolveUserId(req);
    const { expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
        throw new ApiError(400, "Invalid expense id");
    }

    const expenseToDelete = await Expense.findOne({
        _id: expenseId,
        userId
    });

    if (!expenseToDelete) {
        throw new ApiError(404, "Expense not found");
    }

    if (expenseToDelete.isAutoGenerated && expenseToDelete.recurringTemplateId) {
        const monthKey =
            expenseToDelete.recurrenceMonthKey || getMonthKey(new Date(expenseToDelete.date));
        await Expense.findOneAndUpdate(
            { _id: expenseToDelete.recurringTemplateId, userId },
            { $addToSet: { recurringSkipMonths: monthKey } }
        );
    }

    await Expense.deleteOne({
        _id: expenseId,
        userId
    });

    if (expenseToDelete.isRecurring && !expenseToDelete.isAutoGenerated) {
        await Expense.deleteMany({
            userId,
            recurringTemplateId: expenseToDelete._id
        });
    }

    await reconcileMonthlyOverage(userId);

    return res
        .status(200)
        .json(new ApiResponse(200, expenseToDelete, "Expense deleted successfully"));
});

// Calculate total expenses for the user
const getTotalExpenses = asyncHandler(async (req, res) => {
    const userId = resolveUserId(req);
    const syncResult = await syncRecurringExpenses(userId);

    if (syncResult.createdCount > 0) {
        await reconcileMonthlyOverage(userId);
    }

    const totals = await Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const total = totals.length > 0 ? totals[0].total : 0;

    return res
        .status(200)
        .json(new ApiResponse(200, { total }, "Total expenses calculated"));
});

export {
    addExpense,
    getUserExpenses,
    updateExpense,
    deleteExpense,
    getTotalExpenses,
    importPaytmPassbook
};
