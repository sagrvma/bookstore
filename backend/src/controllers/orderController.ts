import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";
import Cart, { ICart } from "../models/cart";
import Book, { IBook } from "../models/book";
import Order, { IOrder, IOrderItem } from "../models/order";

export const placeOrder = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  const session = await mongoose.startSession(); //Creates a mongoDB Session for transaction management, ensures all transactions are atomic(either all fail or all pass)

  try {
    const userId = req.user?._id;
    const {
      shippingAddress,
      paymentMethod = "cash_on_delivery",
      notes,
    } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required.",
      });
    }

    //Start Transaction
    await session.startTransaction(); //Begins the mongoDB transaction. All subsequent operations with "session" parameter will be part of this atomic transition. If any operation fails, the entire transaction can be rolled back.

    //Get user's cart
    const cart: ICart | null = await Cart.findOne({ user: userId })
      .populate("items.book")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction(); //Rolls back the transaction.
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Add items to cart before placing an order",
      });
    }

    const orderItems: Array<IOrderItem> = [];
    let subtotal: number = 0;

    for (let cartItem of cart.items) {
      const bookItem = cartItem.book as any; //Populated book

      //Recheck stock (Important for concurrent orders)
      const currentBook = await Book.findById(bookItem?._id).session(session);

      if (!currentBook) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Book no longer exists.",
        });
      }

      if (currentBook.stock < cartItem.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Insufficent stock.",
        });
      }

      //Deduct stock from book
      await Book.findOneAndUpdate(
        { _id: bookItem._id },
        {
          $inc: { stock: -cartItem.quantity },
        },
        {
          session,
          new: true,
        }
      );

      const lineTotal = cartItem.price * cartItem.quantity;

      orderItems.push({
        book: bookItem._id,
        title: bookItem.title,
        author: bookItem.author?.name || "Unknown Author",
        price: cartItem.price, //not bookItem.price, for price protection
        quantity: cartItem.quantity,
        lineTotal: lineTotal,
      });

      subtotal += lineTotal;
    }

    //Calculate total order cost\
    const tax = 0;
    const shippingCost = 0;
    const total = subtotal + tax + shippingCost;

    //Order creation
    const order: IOrder = new Order({
      user: userId,
      items: orderItems,
      subtotal: subtotal,
      tax: tax,
      shippingCost: shippingCost,
      totalAmount: total,
      paymentMethod: paymentMethod,
      shippingAddress: shippingAddress,
      notes: notes,
    });

    await order.save({ session });

    //Clear user's cart

    await Cart.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          items: [],
        },
      },
      {
        session,
      }
    );

    //Commit transaction
    await session.commitTransaction();

    //Populate order for response
    await order.populate("items.book", "title author isbn category");

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: order,
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error while placing the order: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while placing the order! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  } finally {
    await session.endSession(); //Releases DB session resources
  }
};

export const getOrdersByUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items.book", "title author isbn category")
      .select("-__v"); //Omits the version key from response object

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      message: "Orders fetched for user successfully.",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalOrders,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Error while getting orders for the user: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while getting orders for the user! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    const orderId = req.params.orderId;

    const order: IOrder | null = await Order.findOne({
      _id: orderId,
      user: userId, //Search with both as order should belong to respective user only
    }).populate("items.book", "title author isbn category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order found by ID successfully.",
      data: order,
    });
  } catch (error: any) {
    console.error("Error while getting the order by ID: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while getting the order by ID! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};
