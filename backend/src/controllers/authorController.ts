import mongoose from "mongoose";
import { Request, Response } from "express";
import Author, { IAuthor } from "../models/author";

const createAuthor = async (req: Request<{}, {}, IAuthor>, res: Response) => {
  try {
    const newAuthor = new Author(req.body);
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
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating author! Please try again.",
    });
  }
};
