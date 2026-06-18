import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    index:true
  },
  productName:{
    type:String,
    required:true,
  },
  serialNumber:{
    type:String,
    unique:true,
    required:true
  },
  quantity:{
    type:Number,
    required:true,
    min:[0,"Quantity Cannot be Empty or Negative"]
  }
},{timestamps:true})

const productModel = mongoose.model('product',productSchema)

export default productModel