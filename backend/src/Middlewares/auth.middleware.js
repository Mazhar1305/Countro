import jwt from "jsonwebtoken"
import config from "../configs/config.js"
import { userModel } from "../Models/user.model.js"



export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization").split("Bearer ")[1]
    
    if (!token) {
      return res.status(401).json({
        msg: "Unauthorized Request"
      })
    }

    const decodedToken = jwt.verify(token, config.ACCESS_JWT_SECRET)

    const user = await userModel.findById({_id:decodedToken._id})
      .select("-password -refreshToken")

      
    if (!user) {
      return res.status(401).json({
        msg: "Invalid Access Token"
      })
    }

    req.user = user
    next()

  } catch (error) {
    return res.status(400).json({
      msg: "Invalid OR Expired Access Token",
      error
    })
  }
}