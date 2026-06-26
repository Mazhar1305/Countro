import express from "express"
import authRouter from "./Routes/auth.route.js"
import cookieParser from "cookie-parser"
import productRouter from "./Routes/product.route.js"
import salesRouter from "./Routes/sales.route.js"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/product",productRouter)
app.use("/api/v1/sales",salesRouter)

app.get('/health',(req,res)=>{
  res.json({
    msg:"Backend is up and running"
  })
})

export default app
