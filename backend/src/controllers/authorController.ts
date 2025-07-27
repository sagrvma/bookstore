import mongoose from "mongoose";
import { Request, Response } from "express";
import Author, { IAuthor } from "../models/author";

const createAuthor = async (req: Request<{}, {}, IAuthor>, res: Response) => {
  try {
    const newAuthor: IAuthor = new Author(req.body);
    await newAuthor.save();

    return res.status(201).json({
      success: true,
      message: "New author created successfully.",
      data: newAuthor,
    });
  } catch (error: any) {
    console.error("Error while creating author: ", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating author! Please try again.",
    });
  }
};

const getAuthors = async (req: Request, res: Response) => {
  try {
    const authors = await Author.find({});
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
      error: error.errors || error.message || "Unknown error!",
    });
  }
};

const getAuthorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let author: IAuthor | null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      author = await Author.findById(id);
    } else {
      author = await Author.findOne({ slug: id });
    }

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "No author exists with the given id!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Author with given id found successfully!",
      data: author,
    });
  } catch (error: any) {
    console.error("Error while fetching author by ID: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching author by ID! Please try again.",
      error: error.errors || error.message || "Unknown error!",
    });
  }
};

export { createAuthor, getAuthors, getAuthorById };
