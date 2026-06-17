import { Router } from "express";
import { login, logout, refreshAccessToken, signup, verifyEmail } from "../Controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const authRouter = Router()


authRouter.post("/signup",signup)
authRouter.post("/verify-email",verifyEmail)
authRouter.post("/login",login)
authRouter.post("/refreshAccessToken",refreshAccessToken)


// secured routes
authRouter.post("/logout",verifyJWT,logout)

export default authRouter