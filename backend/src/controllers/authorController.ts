import mongoose from "mongoose";
import { Request, Response } from "express";
import Author, { IAuthor } from "../models/author";
import { validateId } from "../utils/validators";
import Book from "../models/book";

const createAuthor = async (req: Request<{}, {}, IAuthor>, res: Response) => {
  try {
    const newAuthor: IAuthor = new Author(req.body);
    await newAuthor.save();

    return res.status(201).json({
      success: true,
      message: "New author created successfully!",
      data: newAuthor,
    });
  } catch (error: any) {
    console.error("Error while creating the author: ", error);

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
        "Something went wrong while creating the new author! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const getAuthors = async (req: Request, res: Response) => {
  try {
    const authors: Array<IAuthor> = await Author.find({});
    return res.status(200).json({
      success: true,
      message:
        authors.length === 0
          ? "No authors found."
          : `Found ${authors.length} authors.`,
      data: authors,
    });
  } catch (error: any) {
    console.error("Error while fetching list of authors: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching list of authors! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const getAuthorById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    let author; // author: IAuthor | null; Will be self infered by TS

    if (validateId(id)) {
      author = await Author.findById(id);
    } else {
      author = await Author.findOne({ slug: id });
    }

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "No author found with the given ID!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Author with given ID found successfully!",
      data: author,
    });
  } catch (error: any) {
    console.error("Error while fetching author by ID: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching author by ID! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const deleteAuthor = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    let author; // : IAuthor | null

    if (validateId(id)) {
      author = await Author.findById(id);
    } else {
      author = await Author.findOne({ slug: id });
    }

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "No author found with the given ID!",
      });
    }

    //Check if author has existing books before deleting so as to not leave any orphan books
    const bookCount = await Book.countDocuments({ author: author._id });

    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Can't remove author! Author has ${bookCount} book(s) associated. Please delete or reassign the books first.`,
      });
    }

    //Now delete the author with the actual object ID
    const deletedAuthor = await Author.findByIdAndDelete(author._id);

    return res.status(200).json({
      success: true,
      message: "Author with the given ID removed successfully.",
      data: deletedAuthor,
    });
  } catch (error: any) {
    console.error("Error while removing author by ID: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while removing author by ID! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const updateAuthor = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let author; // : IAuthor | null
    if (validateId(id)) {
      author = await Author.findById(id);
    } else {
      author = await Author.findOne({ slug: id });
    }

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "No author found with the given ID!",
      });
    }

    const updatedAuthor = await Author.findByIdAndUpdate(author._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Author with the given ID updated successfully.",
      data: updatedAuthor,
    });
  } catch (error: any) {
    console.error("Error while updating author by ID: ", error);

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
        "Something went wrong while updating author by ID! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

export { createAuthor, getAuthors, getAuthorById, deleteAuthor, updateAuthor };
