import { Request, Response } from "express";
import Author from "../models/author";
import Book, { IBook } from "../models/book";
import { validateId } from "../utils/validators";

const createBook = async (req: Request<{}, {}, IBook>, res: Response) => {
  try {
    //First verify authorID
    const authorId = req.body.author;

    if (!validateId(authorId.toString())) {
      return res.status(400).json({
        success: false,
        message: "Invalid author ID provided.",
      });
    }

    const author = await Author.findById(authorId);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "No author exists with the given authorId.",
      });
    }

    //Only if authorID is valid, create the book

    const newBook: IBook = new Book(req.body);
    await newBook.save();

    await newBook.populate("author"); //Populating for the response only after it is saved as before saving it does not exist and may cause error

    return res.status(201).json({
      success: true,
      message: "New book added successfully!",
      data: newBook,
    });
  } catch (error: any) {
    console.error("Error while creating the book: ", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error.",
        errors: error.errors || error.message || "Unknown error!",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating the new book! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
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
    console.error("Something went wrong while fetching list of books: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching list of books! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const getBookById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id provided.",
      });
    }

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
    console.error("Error while fetching book by id: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching book by id! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const removeBook = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id provided.",
      });
    }

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: "No book found with the given id!",
      });
    }

    await deletedBook.populate("author"); //Populating for the response

    return res.status(200).json({
      success: true,
      message: "Book with the given id removed successfully.",
      data: deletedBook,
    });
  } catch (error: any) {
    console.error("Error while removing book by id: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while removing book by id! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const updateBook = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id provided.",
      });
    }

    const updatedBookData = req.body; // Not :IBook to accomodate partial updates with only some fields to be updated

    //IF author field is being updated, needs to be validated seperately

    const authorId = updatedBookData.author;

    if (authorId) {
      if (!validateId(authorId.toString())) {
        return res.status(400).json({
          success: false,
          message: "Invalid author ID provided!",
        });
      }

      const author = await Author.findById(authorId);

      if (!author) {
        return res.status(404).json({
          success: false,
          message: "No author found with the given ID.",
        });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updatedBookData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: "No book found with the given id.",
      });
    }

    await updatedBook.populate("author"); //Populate the book for the response if it exists

    return res.status(200).json({
      success: true,
      message: "Book with the given id updated successfully!",
      data: updatedBook,
    });
  } catch (error: any) {
    console.error("Error while updating book by id: ", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error!",
        errors: error.errors || error.message || "Unknown error!",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating book by id! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

export { createBook, getBooks, getBookById, removeBook, updateBook };
