import salesModel from "../Models/sales.model.js"
import z from "zod"

//input validation for sales using zod
const saleSchema = z.object({
  customerPhnNo: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  shoppingPrice: z.coerce.number().min(1, "Price Cannot be Cannot be Negative")
})


//Controller For Creating Sales
export const createSale = async (req, res) => {
  try {
    const user = req.user._id
    const parsed = saleSchema.safeParse(req.body)

    if (!parsed.success) {
      return res
        .status(400)
        .json({
          errors: parsed.error.issues.map(issue => issue.message)
        })
    }

    const {
      customerPhnNo,
      shoppingPrice,
    } = parsed.data


    const sale = await salesModel.create({
      user,
      customerPhnNo,
      shoppingPrice
    })

    return res
      .status(201)
      .json({
        msg: "Sale Created",
        data: sale
      })

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        msg: "Failed To Create Sale",
      })
    }

}

//Controller For Fetching All Sales
export const getAllSales = async (req, res) => {
  try {
    const user = req.user._id

    const allSales = await salesModel.find({ user })
    .select("customerPhnNo shoppingPrice createdAt")
    .sort({ createdAt: -1 })
    .lean()
    if (allSales.length === 0) return res.status(200).json({
      msg: "No Sales Found"
    })

    return res
      .status(200)
      .json({
        msg: "Sales Fetched Successfully",
        count: allSales.length,
        data: allSales
      })

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        msg: "Failed To Fetch Sales"
      })
  }

}