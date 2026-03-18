import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    limit: {
      type: Number,
      required: true
    },
    period: {
      type: String,
      default: "monthly"
    }
  },
  { timestamps: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);
