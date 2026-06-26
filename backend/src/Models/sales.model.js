import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customerPhnNo: {
    type: String,
    required: true,
  },
  shoppingPrice: {
    type: Number,
    required: true
  }
}, { timestamps: true })

salesSchema.index(
  {
    user: 1, customerPhnNo: 1
  })
const salesModel = mongoose.model("sales", salesSchema)
export default salesModel