import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema({
  foodname: {
    type: String,
    required: true,
    // unique:true,
  },
  // email:{
  //   type: String,
  //   required:true,
  //   unique:true,
  // },
  description: {
    type: String,
    required: true,
    // unique:true,
  },
  img: {
    type: String,
    required: true
  }
});
export const Foods = mongoose.model("Foods", FoodSchema);
