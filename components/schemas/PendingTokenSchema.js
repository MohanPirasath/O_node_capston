import mongoose from "mongoose";

const PendingTokenSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  Foodname: {
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
export const PendingTokens = mongoose.model("PendingTokens", PendingTokenSchema);
