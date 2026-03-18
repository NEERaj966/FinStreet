import mongoose from "mongoose";
import { Budget } from "../models/Budget.model.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { normalizeCategoryName } from "../constants/categories.js";

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

const parseLimit = (limit) => {
  const value = Number(limit);
  if (!Number.isFinite(value) || value <= 0) {
    throw new ApiError(400, "Limit must be a positive number");
  }
  return value;
};

const normalizeCategory = (category) => {
  if (!category || String(category).trim() === "") {
    throw new ApiError(400, "Category is required");
  }
  return normalizeCategoryName(category);
};

const createBudget = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req);
  const { category, limit, period } = req.body;

  const budget = await Budget.create({
    userId,
    category: normalizeCategory(category),
    limit: parseLimit(limit),
    period: period ? String(period).trim() : "monthly"
  });

  return res
    .status(201)
    .json(new ApiResponse(201, budget, "Budget created successfully"));
});

const getUserBudgets = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req);
  const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, budgets, "Budgets fetched successfully"));
});

const updateBudget = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req);
  const { budgetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(budgetId)) {
    throw new ApiError(400, "Invalid budget id");
  }

  const updates = {};
  if (req.body.category !== undefined) {
    updates.category = normalizeCategory(req.body.category);
  }
  if (req.body.limit !== undefined) {
    updates.limit = parseLimit(req.body.limit);
  }
  if (req.body.period !== undefined) {
    updates.period = String(req.body.period).trim() || "monthly";
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided for update");
  }

  const updatedBudget = await Budget.findOneAndUpdate(
    { _id: budgetId, userId },
    { $set: updates },
    { new: true }
  );

  if (!updatedBudget) {
    throw new ApiError(404, "Budget not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBudget, "Budget updated successfully"));
});

const deleteBudget = asyncHandler(async (req, res) => {
  const userId = resolveUserId(req);
  const { budgetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(budgetId)) {
    throw new ApiError(400, "Invalid budget id");
  }

  const deletedBudget = await Budget.findOneAndDelete({
    _id: budgetId,
    userId
  });

  if (!deletedBudget) {
    throw new ApiError(404, "Budget not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedBudget, "Budget deleted successfully"));
});

export {
  createBudget,
  getUserBudgets,
  updateBudget,
  deleteBudget
};
