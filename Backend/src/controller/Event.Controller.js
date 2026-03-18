import { Event } from "../models/Event.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utills/AsyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const seedEvents = [
    {
        eventName: "Emergency car repair",
        description: "Your car needs urgent repairs this week.",
        options: ["Use emergency fund", "Delay repair", "Use credit card"],
        financialImpact: -2500
    },
    {
        eventName: "Unexpected bonus",
        description: "You received a surprise bonus from work.",
        options: ["Save 70%", "Invest in stocks", "Pay off debt"],
        financialImpact: 3000
    },
    {
        eventName: "Medical expense",
        description: "A sudden medical bill arrives this month.",
        options: ["Pay in full", "Set up installment plan", "Use emergency fund"],
        financialImpact: -1800
    }
];

// Fetch a random event to simulate a real-life scenario
const generateRandomEvent = asyncHandler(async (_req, res) => {
    const count = await Event.countDocuments();
    if (count === 0) {
        await Event.insertMany(seedEvents);
    }

    const total = await Event.countDocuments();
    if (total === 0) {
        throw new ApiError(404, "No events available");
    }

    const randomOffset = Math.floor(Math.random() * total);
    const event = await Event.findOne().skip(randomOffset);

    return res
        .status(200)
        .json(new ApiResponse(200, event, "Random event generated"));
});

// Create a custom event
const createEvent = asyncHandler(async (req, res) => {
    const { eventName, description, options, financialImpact } = req.body;

    if (!eventName || String(eventName).trim() === "") {
        throw new ApiError(400, "Event name is required");
    }

    let parsedOptions = [];
    if (Array.isArray(options)) {
        parsedOptions = options.map((item) => String(item).trim()).filter(Boolean);
    } else if (typeof options === "string") {
        parsedOptions = options
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (parsedOptions.length === 0) {
        throw new ApiError(400, "At least one option is required");
    }

    const impact =
        financialImpact === undefined || financialImpact === null
            ? 0
            : Number(financialImpact);

    if (!Number.isFinite(impact)) {
        throw new ApiError(400, "Financial impact must be a number");
    }

    const createdEvent = await Event.create({
        eventName: String(eventName).trim(),
        description: description ? String(description).trim() : "",
        options: parsedOptions,
        financialImpact: impact
    });

    return res
        .status(201)
        .json(new ApiResponse(201, createdEvent, "Event created successfully"));
});

// Return the available options for a specific event
const getEventOptions = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).select("options");
    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, event.options || [], "Event options"));
});

// Apply the event impact to user savings and financial score
const applyEventImpact = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { optionIndex, option } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    if (event.options?.length) {
        const optionByIndex =
            typeof optionIndex === "number" ? event.options[optionIndex] : undefined;
        const optionByValue =
            typeof option === "string" ? event.options.find((item) => item === option) : undefined;

        if (!optionByIndex && !optionByValue) {
            throw new ApiError(400, "Valid option is required");
        }
    }

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const impact = Number(event.financialImpact || 0);
    const scoreDelta = impact === 0 ? 0 : impact > 0 ? 5 : -5;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                savings: (user.savings || 0) + impact,
                financialScore: clamp((user.financialScore ?? 50) + scoreDelta, 0, 100)
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { event, user: updatedUser, scoreDelta, impact },
                "Event impact applied"
            )
        );
});

export {
    createEvent,
    generateRandomEvent,
    getEventOptions,
    applyEventImpact
};
