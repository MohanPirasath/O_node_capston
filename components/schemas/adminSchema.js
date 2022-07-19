import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  // email:{
  //   type: String,
  //   required:true,
  //   unique:true,
  // },
  password: {
    type: String,
    required: true,
    unique: true,
  },

  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }]
});
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
adminSchema.methods.generateValidToken = async function () {
  try {
    const generatedToken = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: generatedToken });
    await this.save();
    return generatedToken;

  } catch (err) {
    console.log(err);
  }
};
export const Admin = mongoose.model("Admin", adminSchema);
