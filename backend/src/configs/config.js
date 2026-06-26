import dotenv from "dotenv"
dotenv.config()


if (!process.env.MONGO_URI) {
  throw new Error("MONGODB_URI is not definedd in environmentle variables")
}


const config = {
  ACCESS_JWT_SECRET:process.env.ACCESS_JWT_SECRET,
  REFRESH_JWT_SECRET:process.env.REFRESH_JWT_SECRET,
  SALT_ROUNDS:8,
  MONGO_URI : process.env.MONGO_URI,
  EMAIL_USER: process.env.EMAIL_USER,
  GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN : process.env.GOOGLE_REFRESH_TOKEN,
}

export default config