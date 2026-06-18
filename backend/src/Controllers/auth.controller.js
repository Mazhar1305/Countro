import { userModel } from "../Models/user.model.js";
import { z } from "zod"
import bcrypt from "bcryptjs";
import { generateOTP } from "../Utils/utils.js";
import { generateAccessAndRefreshTokens } from "../Services/tokens.service.js";
import sendRegistrationEmail from "../Services/email.service.js"
import { otpModel } from "../Models/otp.model.js";
import jwt from "jsonwebtoken"
import config from "../configs/config.js";



const cookieOptions = {
  httpOnly: true,
  secure: true
}

// Sign-up Inputs Validation Using zod
const signupSchema = z.object({
  fullName: z.string(),
  email: z.email(),
  password: z
    .string()
    .min(6, "The password should be of atleast 6 characters")
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string()

}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})


// User Sign-Up Controller
export const signup = async (req, res) => {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        msg: parsed.error.issues[0].message
      })
  }

  try {
    const userAlreadyExists = await userModel.findOne({ email: parsed.data.email })
    if (userAlreadyExists) {
      return res.status(409).json({
        msg: "User Already Exists"
      })

    }

    const newUser = await userModel.create({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      password: parsed.data.password
    })


    const otp = generateOTP()
    await sendRegistrationEmail(newUser.email, newUser.fullName, otp)

    const otpHash = await bcrypt.hash(otp, 8)
    console.log(otpHash);

    await otpModel.create({
      email: newUser.email,
      userId: newUser._id,
      otpHash
    })

    const response = newUser.toObject()
    delete response.password

    return res.status(201).json({
      msg: "user created",
      user: response,
    })

  } catch (error) {
    return res.status(500).json({
      msg: "Failed To Create User",
      error
    })
  }
}


// User Email Verfication Controller
export const verifyEmail = async (req, res) => {

  try {
    const { otp, email } = req.body
    const otpDoc = await otpModel.findOne({ email })
    console.log(otpDoc);
    const otpHash = await bcrypt.compare(otp, otpDoc.otpHash)
    console.log(otpHash);

    if (!otpHash) {
      return res.status(400).json({
        msg: "Invalid otp"
      })
    }

    await userModel.findByIdAndUpdate(otpDoc.userId, {
      verified: true
    })

    await otpModel.deleteMany({
      email: otpDoc.email
    })

    return res.status(200).json({
      msg: "User Verified"
    })

  } catch (error) {
    return res.status(500).json({
      msg: "Server Error",
      error
    })
  }
}



// User Log-in Controller
export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        msg: "User Does Not Exists"
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return res.status(403).json({
      msg: "Incorrect Password"
    })

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)


    const updatedUser = await userModel.findOneAndUpdate(
      { email: user.email },
      { $set: { refreshToken: refreshToken } },
      { returnDocument: "after", runValidators: false }
    ).select("-password -refreshToken")

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        msg: "Logged-In Successfully",
        user: updatedUser,
        token: `Bearer ${accessToken}`
      })

  } catch (error) {
    return res.status(500).json({
      msg: "Failed To Login",
      error
    })
  }
}

// User LogOut Controller
export const logout = async (req, res) => {
  const user = req.user

  try {
    await userModel.findByIdAndUpdate(user._id, {
      $unset:
      {
        refreshToken: null
      }
    }, {
      returnDocument: "after",
      runValidators: false
    })


    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json({
        msg: "Logged Out Successfully"
      })
  } catch (error) {
    return res.status(500).json({
      msg: "Failed to LogOut",
      error
    })
  }

}

// Controller to refresh the access and refresh tokens (token rotation)
export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken
    if (!incomingRefreshToken) {
      return res.status(401).json({
        msg: "Unauthorized Request"
      })
    }

    const decodedToken = jwt.verify(incomingRefreshToken, config.REFRESH_JWT_SECRET)
    const user = await userModel.findById(decodedToken._id)

    if (!user) return res.status(401).json({
      msg: "Invalid Refresh Token"
    })

    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({
        msg: "Refresh Token Is Expired or Used"
      })
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
   
    await userModel.findByIdAndUpdate({
      _id: user._id
    }, {
      $set: {
        refreshToken: refreshToken
      }
    }, {
      returnDocument: "after",
      runValidators: false
    })
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      msg: "Access Token Refreshed"
    })
  } catch (error) {
    return res.status(401).json({
      msg: "Invalid Refresh Token",
      error
    })
  }
}