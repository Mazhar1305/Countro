import jwt from "jsonwebtoken"
import config from "../configs/config.js"

export async function generateAccessToken(userId) {
  const accessToken = jwt.sign({
    _id: userId,
  }, config.ACCESS_JWT_SECRET,
    {
      expiresIn: "15min"
    }

  )
  return accessToken
}

export async function generateRefreshToken(userId) {
 const refreshToken = jwt.sign({
    _id: userId,
  }, config.REFRESH_JWT_SECRET,
    {
      expiresIn: "3d"
    }

  )

  return refreshToken
}


export async function generateAccessAndRefreshTokens(userId){
  try {
    const accessToken = await generateAccessToken(userId)
    const refreshToken = await generateRefreshToken(userId)
  
    return {accessToken,refreshToken}
  } catch (error) {
    console.log("failed to create tokens");
    console.log(error);
    
    
  }
}