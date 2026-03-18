import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventName: String,
  description: String,
  options: [String],
  financialImpact: Number
});

export const Event =  mongoose.model("Event", eventSchema);