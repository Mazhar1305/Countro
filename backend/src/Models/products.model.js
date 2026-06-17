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
    default:0
  }
},{timestamps:true})

const productModel = mongoose.model('product',productSchema)

export default productModel