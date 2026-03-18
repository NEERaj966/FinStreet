import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  investmentType: String,
  amount: Number,
  returnValue: Number
});

export const Investment = mongoose.model("Investment", investmentSchema);