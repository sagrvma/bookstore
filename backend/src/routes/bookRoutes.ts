import { Router } from "express";
import {
  getBooks,
  getBookById,
  createBook,
  removeBook,
  updateBook,
} from "../controllers/bookController";

const router = Router();

//GET - /api/books - Get all books
router.get("/", getBooks);
//GET - /api/books/:id - Get book by id
router.get("/:id", getBookById);
//POST - /api/books - Create a new book
router.post("/", createBook);
//DELETE - /api/books/:id - Delete book by id
router.delete("/:id", removeBook);
//PATCH - /api/books/:id - Update book by id
router.patch("/:id", updateBook);

export default router;
