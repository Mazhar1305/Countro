import express from "express"
import authRouter from "./Routes/auth.route.js"
import cookieParser from "cookie-parser"


const app = express()
app.use(express.json())
app.use(cookieParser())


app.use("/api/v1",authRouter)

app.get('/health',(req,res)=>{
  res.json({
    msg:"Backend is up and running"
  })
})

export default app
