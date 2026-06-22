import { userModel } from "../Models/user.model.js";
import { z } from "zod"
import bcrypt from "bcryptjs";
import { generateOTP } from "../Utils/utils.js";
import { generateAccessAndRefreshTokens } from "../Services/tokens.service.js";
import sendRegistrationEmail from "../Services/email.service.js"
import { otpModel } from "../Models/otp.model.js";
import jwt from "jsonwebtoken"
import config from "../configs/config.js";
import { OAuth2Client } from "google-auth-library"


const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict"
}


const client = new OAuth2Client(
  config.GOOGLE_CLIENT_ID
);


// Sign-up Inputs Validation Using zod
const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.email().transform(email => email.trim().toLowerCase()),
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

  const { email, fullName, password } = parsed.data


  try {
    const userAlreadyExists = await userModel.findOne({ email })
    if (userAlreadyExists) {
      return res.status(409).json({
        msg: "User Already Exists"
      })

    }



    await otpModel.deleteMany({
      email,
    });

    const otp = generateOTP()
    const otpHash = await bcrypt.hash(otp, 8)


    const newUser = await userModel.create({
      fullName,
      email,
      password,
      authProvider: "local",
    });

    await otpModel.create({
      email,
      otpHash
    })

    await sendRegistrationEmail(email, fullName, otp)



    const response = newUser.toObject()
    delete response.password

    return res.status(201).json({
      msg: "user created",
      user: response,
    })

  } catch (error) {
    return res.status(500).json({
      msg: "Failed To Create User",
      error: error.message
    })
  }
}


//otp input validations using zod
const verifyEmailSchema = z.object({
  email: z.email().transform(email => email.trim().toLowerCase()),
  otp: z.string().length(6, "The OTP is A Six Digit Number Please Enter Correct OTP")
})

// User Email Verfication Controller
export const verifyEmail = async (req, res) => {

  try {
    const parsed = verifyEmailSchema.safeParse(req.body)
    if (!parsed.success) {
      return res
        .status(400)
        .json({
          msg: parsed.error.issues[0].message
        })
    }

    const { email, otp } = parsed.data

    const otpDoc = await otpModel.findOne({ email })
    if (!otpDoc) {
      return res.status(404).json({
        msg: "OTP not found or expired"
      })
    }

    const otpHash = await bcrypt.compare(otp, otpDoc.otpHash)
    if (!otpHash) {
      return res.status(400).json({
        msg: "Invalid otp"
      })
    }


    await userModel.findOneAndUpdate({ email: otpDoc.email }, {
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
      error: error.message
    })
  }
}

//login input validations using zod
const loginSchema = z.object({
  email: z.email().transform(email => email.trim().toLowerCase()),
  password: z.string()
})

// User Log-in Controller
export const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        msg: parsed.error.issues[0].message
      })
  }

  const { email, password } = parsed.data
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        msg: "User Does Not Exists"
      })
    }

    if (!user.verified) {
      return res.status(403).json({
        msg: "Please verify your email first"
      })
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({
        msg: "This account uses Google Sign-In"
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return res.status(403).json({
      msg: "Incorrect Password"
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)


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
      error: error.message
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
        refreshToken: ""
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
      error: error.message
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

    await userModel.findByIdAndUpdate(
      user._id
      , {
        $set: {
          refreshToken
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
      error: error.message
    })
  }
}


// Controller For Login With Google
export const googleLogin = async (req, res) => {

  try {

    const { token } = req.body;

    const ticket =
      await client.verifyIdToken({
        idToken: token,
        audience:
          config.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

    const {email,name,sub,} = payload;

    let user = await userModel.findOne({
      email,
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)


    if (!user) {
      user = await userModel.create({
        fullName: name,
        email,
        googleId: sub,
        verified: true,
        authProvider: "google",
        refreshToken
      });
    } else {
      user = await userModel.findByIdAndUpdate(
        user._id,
        {
          $set: {
            authProvider:"both",
            googleId: sub,
          },
        },
        {
          returnDocument: "after",
          runValidators: false,
        }
      ).select("-password -refreshToken -googleId");
    }


    return res
      .cookie(
        "accessToken",
        accessToken,
        cookieOptions
      )
      .cookie(
        "refreshToken",
        refreshToken,
        cookieOptions
      )
      .json({
        msg: "Logged-In Suucessfully",
        success: true,
        user,
      });
  } catch (error) {
    return res.status(401).json({
      msg: "Google Login Failed",
      error: error.message
    });
  }
};