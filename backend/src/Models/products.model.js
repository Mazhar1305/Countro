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
    trim:true
  },
  serialNumber:{
    type:String,
    trim:true,
    uppercase:true,
    required:true
  },
  quantity:{
    type:Number,
    required:true,
    min:[1,"Quantity Cannot be Empty or Negative"]
  }
},{timestamps:true})


productSchema.index(
  { user: 1, serialNumber: 1 },
  { unique: true }
);

const productModel = mongoose.model('product',productSchema)

export default productModel