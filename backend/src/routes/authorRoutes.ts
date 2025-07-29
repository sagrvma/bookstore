import { Router } from "express";
import {
  createAuthor,
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

export default router;
