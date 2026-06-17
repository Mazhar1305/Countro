import mongoose, { model } from "mongoose";

const otpSchema = new mongoose.Schema({
  email:{
    type:String,
    index:true,
    required:true
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  otpHash:{
    type:String,
    required:true
  }
})

export const otpModel = mongoose.model("otp",otpSchema)