import { Investment } from "../models/Investment.model.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";

const INVESTMENT_TYPES = new Set(["FD", "Stocks", "Gold"]);

const normalizeInvestmentType = (type) => {
    const normalized = String(type || "").trim();
    if (!normalized) return "";

    if (normalized.toLowerCase() === "fixed deposit" || normalized.toLowerCase() === "fd") {
        return "FD";
    }

    if (normalized.toLowerCase() === "stocks" || normalized.toLowerCase() === "stock") {
        return "Stocks";
    }

    if (normalized.toLowerCase() === "gold") {
        return "Gold";
    }

    return normalized;
};

const normalizeInvestmentAccount = (value) => {
    const normalized = String(value || "").trim();
    return normalized;
};

// Simulate an investment and store its return
const createInvestment = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const { investmentType, investmentAccount, amount, ratePercent } = req.body;
    const normalizedType = normalizeInvestmentType(investmentType);
    const normalizedAccount = normalizeInvestmentAccount(investmentAccount);

    if (!normalizedType || !INVESTMENT_TYPES.has(normalizedType)) {
        throw new ApiError(400, "Investment type must be FD, Stocks, or Gold");
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new ApiError(400, "Amount must be a positive number");
    }

    const userRate = Number(ratePercent);
    if (!Number.isFinite(userRate)) {
        throw new ApiError(400, "ratePercent must be a valid number");
    }

    const returnPercent = Number(userRate.toFixed(2));
    const returnValue = Number((numericAmount * (1 + returnPercent / 100)).toFixed(2));

    const investment = await Investment.create({
        userId,
        investmentType: normalizedType,
        investmentAccount: normalizedAccount,
        amount: numericAmount,
        returnValue
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            { investment, returnPercent, rateSource: "user" },
            "Investment simulated successfully"
        )
    );
});

// Fetch all investments for the authenticated user
const getUserInvestments = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const investments = await Investment.find({ userId }).sort({ _id: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, investments, "Investments fetched successfully"));
});

export {
    createInvestment,
    getUserInvestments
};
