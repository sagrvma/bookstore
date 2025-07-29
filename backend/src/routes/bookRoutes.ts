import { Router } from "express";
import {
  getBooks,
  getBookById,
  createBook,
} from "../controllers/bookController";

const router = Router();

//GET - /api/books - Get all books
router.get("/", getBooks);
//GET - /api/books - Get book by id
router.get("/:id", getBookById);
//POST - /api/books - Create a new book
router.post("/", createBook);

export default router;
