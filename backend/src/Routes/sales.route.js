import Router from "express"
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { createSale, getAllSales } from "../Controllers/sales.controller.js";

const salesRouter = Router()


salesRouter.use(verifyJWT)
salesRouter.post("/createSale",createSale)
salesRouter.get("/getAllSales",getAllSales)


export default salesRouter;