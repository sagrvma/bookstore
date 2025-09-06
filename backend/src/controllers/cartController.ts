import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Cart, { ICart, ICartItem } from "../models/cart";
import Book, { IBook } from "../models/book";

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

    let cart: ICart | null = await Cart.findOne({ user: userId }).populate(
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
      return res.status(400).json({
        success: false,
        message: "Book quantity must to be between 1 to 10.",
      });
    }

    //Check if book exists and has sufficient stock
    const book: IBook | null = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book with the given bookId doesnt exist.",
      });
    }

    if (bookQuantity > book.stock) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock.",
      });
    }

    //Get cart or create new if it doesn't exist
    let cart: ICart | null = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId });
    }

    //Check if book already exists in cart

    const bookIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (bookIndex > -1) {
      //Book already in cart

      const newBookQuantity = cart.items[bookIndex].quantity + bookQuantity;

      if (newBookQuantity > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 books per item allowed.",
        });
      }

      if (newBookQuantity > book.stock) {
        return res.status(400).json({
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
        // subtotal: 0, //Virtual
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

export const updateCartItemById = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    const { itemId } = req.params; //Using cartItem ID, not book ID
    const { newQuantity } = req.body;

    if (!newQuantity) {
      return res.status(400).json({
        success: false,
        message: "Updated quantity is required.",
      });
    }

    if (newQuantity < 1 || newQuantity > 10) {
      return res.status(400).json({
        success: false,
        message: "Book quantity must be between 1 and 10.",
      });
    }

    //Find cart
    const cart: ICart | null = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    //Finding the cart item with the given id using normal approach

    // const cartItemIndex = cart.items.findIndex(
    //   (item) => item._id?.toString() === itemId
    // );

    // if (cartItemIndex == -1) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No item in cart exists with the given item ID.",
    //   });
    // }
    //    const cartItem: ICartItem | null = cart.items[cartItemIndex];

    //Using subdocument methods
    const cartItem: ICartItem | null = cart.items.id(itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "No item in cart exists with the given item ID.",
      });
    }

    const cartItemBook: IBook | null = await Book.findById(cartItem.book);

    if (!cartItemBook) {
      //Not actually necessary as while adding the item it must have been checked already
      return res.status(404).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    //Check against available stock
    if (newQuantity > cartItemBook.stock) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock.",
      });
    }

    cartItem.quantity = newQuantity;

    await cart.save();
    await cart.populate("items.book", "title author isbn category");

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully.",
      data: cart,
    });
  } catch (error: any) {
    console.error("Error while updating cart item by ID: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating cart item by ID! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

export const removeCartItemById = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    const { itemId } = req.params;

    //Get cart

    //Approach 1
    /*
    const cart: ICart | null = await Cart.findById(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    //Find and delete item using mongoosse subdocument methods
    const cartItem: ICartItem | null = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "No item in the cart exists with the given item ID.",
      });
    }

    cartItem.deleteOne();//Subdocument method but gives TS error rn
    */

    //Approach 2 - Using $pull Document array/Subdocument method

    const cart = await Cart.findOneAndUpdate(
      {
        //Checks if cartItem exists or returns null
        user: userId,
        "items._id": itemId,
      },
      {
        $pull: {
          //Removes the matching subdocument
          items: {
            _id: itemId,
          },
        },
      },
      {
        //Returns the new updated cart
        new: true,
      }
    ).populate("items.book", "title author isbn category");
    //No need to .save() as $pull is atomic (happens in one DB operation) on the server and avoids loading the whole care into application memory.

    if (!cart) {
      return res.status(404).json({
        success: false,
        message:
          "Cart not found or no item in the cart exists with the given item ID.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item with the given ID removed from the cart successfully.",
      data: cart,
    });
  } catch (error: any) {
    console.error("Error while removing item from cart by ID: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while removing item from cart by ID! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

export const removeCartItemByBookId = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;
    const { bookId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      {
        //Checks if item exists or returns null
        user: userId,
        "items.book": bookId,
      },
      {
        //Removes the matching subdocument
        $pull: {
          items: {
            book: bookId,
          },
        },
      },
      {
        //Returns the new updated cart
        new: true,
      }
    ).populate("items.book", "title author isbn category");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message:
          "Cart not found or no item in the cart exists with the given book ID.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Item with the given book ID removed from the cart successfully.",
      data: cart,
    });
  } catch (error: any) {
    console.error("Error while removing cart item by Book ID: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while removing cart item by Book Id! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    //APPROACH 1
    /*
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    cart.items = []; //TS Error
    await cart.save();
    await cart.populate("items.book", "title author isbn category");
    */

    //APPROACH 2 - Atomic using $set

    const cart = await Cart.findOneAndUpdate(
      {
        //Check if cart exists
        user: userId,
      },
      {
        $set: {
          items: [], //Update cart to be empty array
        },
      },
      {
        new: true,
        upsert: true, //Create new if it doesnt already exist or update if it does
      }
    ).populate("items.book", "title author isbn category");

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      data: cart,
    });
  } catch (error: any) {
    console.error("Error while clearing the cart: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while clearing the cart! Please try again.",
    });
  }
};
