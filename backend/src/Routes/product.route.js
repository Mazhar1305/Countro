import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { createProduct, deleteProductById, getAllProducts, getProductById, updateProductById } from "../Controllers/product.controller.js";

const productRouter = Router()


productRouter.use(verifyJWT)
productRouter.post('/createProduct',createProduct)
productRouter.get('/getAllProducts',getAllProducts)
productRouter.get('/getProductById/:id',getProductById)
productRouter.put('/updateProductById/:id',updateProductById)
productRouter.delete('/deleteProductById/:id',deleteProductById)



export default productRouter