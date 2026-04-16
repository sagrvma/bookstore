import { Request, Response } from "express";
import Book from "../models/book";
import Author from "../models/author";
import Order from "../models/order";

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    //Totals of all
    const totalBooks = await Book.countDocuments();
    const totalAuthors = await Author.countDocuments();
    const totalOrders = await Order.countDocuments();

    //Total orders by status
    const orderByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully!",
      data: {
        //Stats go here
        totalBooks,
        totalAuthors,
        totalOrders,
        orderByStatus,
      },
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats: ", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats.",
      errors: error.message || "Unknown error!",
    });
  }
};

export { getDashboardStats };
