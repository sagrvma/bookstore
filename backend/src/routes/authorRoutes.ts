import express from "express";
import {
  createAuthor,
  getAuthorById,
  getAuthors,
} from "../controllers/authorController";

const router = express.Router();

router.get("/", getAuthors);

router.get("/:id", getAuthorById);

router.put("/", createAuthor);

export default router;
