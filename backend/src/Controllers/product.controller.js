import productModel from "../Models/products.model.js";


export const createProduct = async (req, res) => {
  const user = req.user
  try {
    const { productName, serialNumber, quantity } = req.body

    if(!productName?.trim() || !serialNumber?.trim() || quantity === undefined){
      return res.status(400).json({
         msg:"All fields are required"
      })
   }

   if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      msg: "Quantity must be greater than 0",
    });
  }

    const productAlreadyExists = await productModel.findOne({
      serialNumber:serialNumber.trim().toUpperCase(),
      user:req.user._id
    })

    if (productAlreadyExists) {
      const updatedProduct = await productModel.findByIdAndUpdate(productAlreadyExists._id, {
        $inc: {
          quantity: quantity
        }
      },{
        returnDocument:"after",
        runValidators:true
      })
      
      return res.status(200).json({
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

      return res.status(201).json({
        msg: "Product Created Successfully",
        product
      })
    }
  } catch (error) {
    if(error.name === "ValidationError"){
      return res.status(400).json({
         msg:error.message
      })
   }
    return res.status(500).json({
      msg: "Failed To Create Product",
      error: error.message
    })
  }


}

export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await productModel.find({
      user: req.user._id
    })

    if (!allProducts || allProducts.length === 0) {
      return res.status(200).json({
        msg: "No Products Found",
      })
    }

    return res.status(200).json({
      msg: "All Products Fetched Successfully",
      allProducts
    })
  } catch (error) {
    return res.status(500).json({
      msg: "Failed To Fetch Products",
      error: error.message
    })
  }
}


export const getProductById = async (req, res) => {

 try {
   const productId = req.params.id

   const product = await productModel.findOne({
    serialNumber:productId.trim().toUpperCase(),
    user:req.user._id
   })

   if(!product){
    return res.status(404).json({
      msg:`No Product Found With ID: ${productId}`
    })
   }

   return res.status(200).json({
    msg:"Product Fecthed Successfully",
    product
   })
   
 } catch (error) {
  return res.status(500).json({
    msg:"Failed To Fetch Product",
    error: error.message
  })
 }
}

export const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if(Object.keys(req.body).length === 0){
      return res.status(400).json({
         msg:"No fields provided for update"
      })
   }

   if (
    req.body.quantity !== undefined &&
    (!Number.isInteger(req.body.quantity) || req.body.quantity <= 0)
  ) {
    return res.status(400).json({
      msg: "Quantity must be greater than 0",
    });
  }

   delete req.body.user;

    const updatedProduct = await productModel.findOneAndUpdate(
      { 
        serialNumber: id.trim().toUpperCase(),
        user:req.user._id
       },
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
      serialNumber:id.trim().toUpperCase(),
      user:req.user._id
    })

    if (!product) {
      return res.status(404).json({
        msg:`No Product Found With ID: ${id}`
      })
    }

    return res.status(200).json({
      msg:"Product Deleted Successfully"
    })
    
   } catch (error) {
    return res.status(500).json({
      msg: "Failed To Delete Product",
      error: error.message,
    });
   }
}