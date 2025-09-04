import { Router } from "express";
import {
  getBooks,
  getBookById,
  createBook,
  removeBook,
  updateBook,
} from "../controllers/bookController";
import { protect, restrictTo } from "../middleware/authMiddleware";
const router = Router();

//PUBLIC ROUTES
//GET - /api/books - Get all books
router.get("/", getBooks);
//GET - /api/books/:id - Get book by id
router.get("/:id", getBookById);

//PROTECTED ROUTES
//POST - /api/books - Create a new book
router.post("/", protect, restrictTo("admin"), createBook);
//DELETE - /api/books/:id - Delete book by id
router.delete("/:id", protect, restrictTo("admin"), removeBook);
//PATCH - /api/books/:id - Update book by id
router.patch("/:id", protect, restrictTo("admin"), updateBook);

export default router;
