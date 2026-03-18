import { Expense } from "../models/Expanse.model.js";
import { Investment } from "../models/Investment.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";

const FOOD_KEYWORDS = ["food", "groceries", "grocery", "dining", "restaurant", "meal", "snack"];

const isFoodCategory = (category) => {
    const normalized = String(category || "").toLowerCase();
    return FOOD_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

// Analyze recent spending and user profile to generate suggestions
const getFinancialAdvice = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userId).select("savings financialScore");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Focus on the last 30 days of expenses for trend-based advice
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const expenseBuckets = await Expense.aggregate([
        { $match: { userId, date: { $gte: fromDate } } },
        {
            $project: {
                amount: 1,
                category: { $ifNull: ["$category", "uncategorized"] }
            }
        },
        {
            $group: {
                _id: { $toLower: "$category" },
                total: { $sum: "$amount" }
            }
        }
    ]);

    const totalsByCategory = expenseBuckets.reduce((acc, bucket) => {
        acc[bucket._id] = bucket.total;
        return acc;
    }, {});

    const totalExpenses = expenseBuckets.reduce((sum, bucket) => sum + bucket.total, 0);
    const foodSpending = Object.entries(totalsByCategory).reduce((sum, [category, total]) => {
        return isFoodCategory(category) ? sum + total : sum;
    }, 0);

    const investmentCount = await Investment.countDocuments({ userId });

    const advice = [];

    if (totalExpenses > 0) {
        const foodShare = foodSpending / totalExpenses;
        if (foodShare > 0.3 && foodSpending > 0) {
            const suggestedCut = Math.round(foodSpending * 0.15);
            advice.push(
                `Your food spending looks high. Try reducing it by 15% (~${suggestedCut}).`
            );
        }
    }

    if ((user.savings || 0) >= 5000 && investmentCount === 0) {
        advice.push("You have enough savings to start investing.");
    }

    if ((user.financialScore ?? 50) < 40 && (user.savings || 0) < 2000) {
        advice.push("Taking a loan right now may reduce your financial score.");
    }

    if (advice.length === 0) {
        advice.push("Your spending looks balanced. Keep tracking expenses to stay on course.");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                advice,
                insights: {
                    periodDays: 30,
                    totalExpenses,
                    foodSpending,
                    savings: user.savings,
                    financialScore: user.financialScore,
                    investmentCount
                }
            },
            "Financial advice generated"
        )
    );
});

export { getFinancialAdvice };
