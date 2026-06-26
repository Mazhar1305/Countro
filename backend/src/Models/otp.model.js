import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email:{
    type:String,
    index:true,
    required:true
  },
  otpHash:{
    type:String,
    required:true
  }
},{
  timestamps:true
})

otpSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300 }
);

export const otpModel = mongoose.model("otp",otpSchema)