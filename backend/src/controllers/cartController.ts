import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Cart from "../models/cart";
export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Access denied! User not authenticated.",
      });
    }

    //Fetch the cart using userId

    let cart = await Cart.findOne({ user: userId }).populate(
      "items.book", //path to populate, as book is not a direct property of Cart, but a element in the items array
      "title author isbn category" //Properties to be populated
    );

    //Create a new cart if it doesn't already exist
    if (!cart) {
      cart = new Cart({ user: userId });
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message:
        cart.items.length === 0
          ? "Your cart is empty."
          : `Cart found with ${cart.items.length} books.`,
      data: cart,
    });
  } catch (error: any) {
    console.error("Error while fetching the cart: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching the cart! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};
