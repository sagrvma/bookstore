import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware";
import {
  cancelOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orderController";

const router = Router();

//All routes need authentication
router.use(protect);

//Admin Routes

//GET - /api/orders/admin/all - Get all orders for all users (admin only)
router.get("/admin/all", restrictTo("admin"), getAllOrders);

//PATCH - /api/orders/:orderId/status - Update the order status of an order by orderId (admin only)
router.patch("/admin/:orderId/status", restrictTo("admin"), updateOrderStatus);

//Customer Routes

//POST - /api/orders/ - Place order for a user
router.post("/", placeOrder);

//GET - /api/orders/ - Get all orders for the user
router.get("/", getOrdersByUser);

//GET - /api/orders/:orderId - Get order by orderId for a user
router.get("/:orderId", getOrderById);

//PATCH - /api/orders/:orderId/cancel - Cancel order by orderId for a user
router.patch("/:orderId/cancel", cancelOrder);

export default router;
