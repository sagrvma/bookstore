import mongoose from "mongoose";
import { Request, Response } from "express";
import Book, { IBook } from "../models/book";

const createBook = async (req: Request<{}, {}, IBook>, res: Response) => {
  try {
    const newBook: IBook = new Book(req.body);
    await newBook.save();

    await newBook.populate("author"); //Populating for the response

    return res.status(201).json({
      success: true,
      message: "New book added successfully!",
      data: newBook,
    });
  } catch (error: any) {
    console.log("Error while creating the book: ", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error.",
        error: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating the new book! Please try again.",
      error: error.errors || error.message || "Unknown error!",
    });
  }
};

const getBooks = async (req: Request, res: Response) => {
  try {
    const books: Array<IBook> = await Book.find({}).populate("author"); //Will populate the reference of the author field
    return res.status(200).json({
      success: true,
      message:
        books.length === 0 ? "No books found." : `Found ${books.length} books.`,
      data: books,
    });
  } catch (error: any) {
    console.log("Something went wrong while fetching list of books: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching list of books! Please try again.",
      error: error.errors || error.message || "Unknown error!",
    });
  }
};

const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const book: IBook | null = await Book.findById(id).populate("author");

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "No book exists with the given id.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book with given id found successfully!",
      data: book,
    });
  } catch (error: any) {
    console.log("Error while fetching book by id: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching book by id! Please try again.",
      error: error.errors || error.message || "Unknown Error",
    });
  }
};

export { createBook, getBooks, getBookById };
