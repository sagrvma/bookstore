import { Router } from "express";
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthors,
  updateAuthor,
} from "../controllers/authorController";
import { protect, restrictTo } from "../middleware/authMiddleware";

const router = Router();

//PUBLIC ROUTES
//GET - /api/authors - Get all authors
router.get("/", getAuthors);
//GET - /api/authors/:id - Get author by id or slug
router.get("/:id", getAuthorById);

//PROTECTED ROUTES
//POST - /api/authors - Create a new author
router.post("/", protect, restrictTo("admin"), createAuthor);
//DELETE - /api/authors/:id - Remove author by id or slug
router.delete("/:id", protect, restrictTo("admin"), deleteAuthor);
//PATCH - api/authors/:id - Update author by id or slug
router.patch("/:id", protect, restrictTo("admin"), updateAuthor);

export default router;
