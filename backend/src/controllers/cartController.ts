import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Cart, { ICart, ICartItem } from "../models/cart";
import Book from "../models/book";

export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    //Not required as protect middleware will handle authentication requirement
    // if (!userId) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Access denied! User not authenticated.",
    //   });
    // }

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

export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    const { bookId, bookQuantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required.",
      });
    }

    if (bookQuantity > 10 || bookQuantity < 1) {
      return res.status(401).json({
        success: false,
        message: "Book quantity must to be between 1 to 10.",
      });
    }

    //Check if book exists and has sufficient stock
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(401).json({
        success: false,
        message: "Book with the given bookId doesnt exist.",
      });
    }

    if (bookQuantity > book.stock) {
      return res.status(401).json({
        success: false,
        message: "Insufficient stock.",
      });
    }

    //Get cart or create new if it doesn't exist
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await new Cart({ user: userId });
    }

    //Check if book already exists in cart

    const bookIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (bookIndex > -1) {
      //Book already in cart

      const newBookQuantity = cart.items[bookIndex].quantity + bookQuantity;

      if (newBookQuantity > 10) {
        return res.status(401).json({
          success: false,
          message: "Maximum 10 books per item allowed.",
        });
      }

      if (newBookQuantity > book.stock) {
        return res.status(401).json({
          success: false,
          message: "Insufficient stock.",
        });
      }

      cart.items[bookIndex].quantity = newBookQuantity;
    } else {
      const cartItem: ICartItem = {
        book: bookId,
        title: book.title,
        price: book.price,
        quantity: bookQuantity,
        subtotal: 0, //Will be calculated in pre-save middleware
      };

      cart.items.push(cartItem);
    }

    await cart.save();
    await cart.populate("items.book", "title author isbn category");

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully.",
      data: cart,
    });
  } catch (error: any) {
    console.error("Error while adding book to cart: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while adding the book to the cart! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};
