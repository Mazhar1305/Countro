import { model, Schema } from "mongoose";
import { hashPassword } from "../Services/passwordhash.service.js";


const userSchema = new Schema({
  fullName:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type:String,
    index:true,
    required:true,
    unique:true,
    trim:true
  },
  authProvider: {
    type: String,
    enum: ["local", "google","both"],
    default: "local"
  },
  password:{
    type:String,
    required: function () {
      return this.authProvider?.local;
    }
  },
  refreshToken:{
    type:String,
  },
  verified:{
    type:Boolean,
    default:false
  },
 
  googleId: {
    type:String,
    default:null
  },


},{timestamps:true})


userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return
  this.password = await hashPassword(this.password)
  
})


export const userModel = model("User",userSchema)