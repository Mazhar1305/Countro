import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { createProduct, deleteProductById, getAllPorducts, getPorductById, updateProductById } from "../Controllers/product.controller.js";

const productRouter = Router()


productRouter.use(verifyJWT)
productRouter.post('/createProduct',createProduct)
productRouter.get('/getAllProducts',getAllPorducts)
productRouter.get('/getProductById/:id',getPorductById)
productRouter.put('/updateProductById/:id',updateProductById)
productRouter.delete('/deleteProductById/:id',deleteProductById)



export default productRouter