import mongoose from "mongoose";

const AcceptedTokenSchema = new mongoose.Schema({
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
  OrderId: {
    type: Number,
    required: true
  }
});
export const AcceptedTokens = mongoose.model("AcceptedTokens", AcceptedTokenSchema);
