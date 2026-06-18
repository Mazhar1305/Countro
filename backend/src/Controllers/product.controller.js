import productModel from "../Models/products.model.js";


export const createProduct = async (req, res) => {
  const user = req.user
  try {
    const { productName, serialNumber, quantity } = req.body

    const productAlreadyExists = await productModel.findOne({
      serialNumber,
    })

    if (productAlreadyExists) {
      const updatedProduct = await productModel.findByIdAndUpdate(productAlreadyExists._id, {
        quantity: productAlreadyExists.quantity + quantity
      },{
        returnDocument:"after",
        runValidators:false
      })
      
      res.status(201).json({
        msg: "Product Already Existed Updated the Quantity",
        product: updatedProduct
      })
    }
    else {
      const product = await productModel.create({
        user: user._id,
        productName,
        serialNumber,
        quantity
      })

      res.status(201).json({
        msg: "Porduct Created Successfully",
        product
      })
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Failed To Create Product",
      error: error.message
    })
  }


}

export const getAllPorducts = async (req, res) => {
  try {
    const allPorducts = await productModel.find({
      user: req.user._id
    })

    if (!allPorducts || allPorducts.length === 0) {
      res.status(200).json({
        msg: "No Products Found",
      })
    }

    res.status(200).json({
      msg: "All Products Fetched Successfully",
      allPorducts
    })
  } catch (error) {
    return res.status(500).json({
      msg: "Failed To Fetch Products",
      error: error.message
    })
  }
}


export const getPorductById = async (req, res) => {

 try {
   const productId = req.params.id

   const product = await productModel.findOne({
    serialNumber:productId
   })

   if(!product){
    return res.status(404).json({
      msg:`No Porduct Found With ID: ${productId}`
    })
   }

   res.status(200).json({
    msg:"Product Fecthed Successfully",
    product
   })
   
 } catch (error) {
  res.status(500).json({
    msg:"Failed To Fetch Product",
    error: error.message
  })
 }
}

export const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await productModel.findOneAndUpdate(
      { serialNumber: id },
      {
        $set: req.body,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        msg: "Product Not Found",
      });
    }

    return res.status(200).json({
      msg: "Product Updated Successfully",
      product: updatedProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        msg: error.message,
      });
    }
    return res.status(500).json({
      msg: "Failed To Update Product",
      error: error.message,
    });
  }
};

export const deleteProductById = async (req, res) => {
   try {
    const {id} = req.params
    const product = await productModel.findOneAndDelete({
      serialNumber:id
    })

    if (!product) {
      return res.status(404).json({
        msg:`No Product Found With ID: ${id}`
      })
    }

    res.status(200).json({
      msg:"Product Deleted Successfully"
    })
    
   } catch (error) {
    return res.status(500).json({
      msg: "Failed To Delete Product",
      error: error.message,
    });
   }
}