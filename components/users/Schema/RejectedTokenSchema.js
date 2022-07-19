import mongoose from "mongoose";

const RejectedTokenSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  foodName: {
    type: String,
    required: true,
    // unique:true,
  },

  description: {
    type: String,
    required: true,
    // unique:true,
  },
  img: {
    type: String,
    required: true
  },
  Date: {
    type: String,
    required: true
  },
  Time: {
    type: String,
    required: true
  },
});
export const RejectedTokens = mongoose.model("RejectedTokens", RejectedTokenSchema);
