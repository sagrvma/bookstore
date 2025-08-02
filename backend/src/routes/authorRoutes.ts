import { Router } from "express";
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthors,
} from "../controllers/authorController";

const router = Router();

//GET - /api/authors - Get all authors
router.get("/", getAuthors);
//GET - /api/authors/:id - Get author by id or slug
router.get("/:id", getAuthorById);
//POST - /api/authors - Create a new author
router.post("/", createAuthor);
//DELETE - /api/authors/:id - Remove author by id or slug
router.delete("/:id", deleteAuthor);

export default router;
