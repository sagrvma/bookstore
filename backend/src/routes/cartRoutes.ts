import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItemByBookId,
  removeCartItemById,
  updateCartItemById,
} from "../controllers/cartController";

const router = Router();

//All cart routes require authentication
router.use(protect);

//GET - /api/cart/ - Get cart or create if it doesnt already exist
router.get("/", getCart);

//POST - /api/cart/ - Add items to cart
router.post("/", addToCart);

//PATCH - /api/cart/item/:itemId - Update item quantity by cartItemID
router.patch("/item/:itemId", updateCartItemById);

//DELETE - /api/cart/item/:itemId - Remove cart item by ID
router.delete("/item/:itemId", removeCartItemById);

//DELETE - /api/cart/book/:bookId - Remove cart item by book ID
router.delete("/book/:bookId", removeCartItemByBookId);

//DELETE - /api/cart/ - Clear the cart
router.delete("/", clearCart);

export default router;
