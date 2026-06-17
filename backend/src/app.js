import express from "express"
import authRouter from "./Routes/auth.route.js"
import cookieParser from "cookie-parser"
import productRouter from "./Routes/product.route.js"


const app = express()
app.use(express.json())
app.use(cookieParser())


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/product",productRouter)

app.get('/health',(req,res)=>{
  res.json({
    msg:"Backend is up and running"
  })
})

export default app
