import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  addAddress,
  changePassword,
  deleteAddress,
  getProfile,
  updateAddress,
  updateProfile,
} from "../controllers/userController";

const router = Router();

//All routes need authentication
router.use(protect);

//Profile Routes

//GET - /api/user/profile - Get user's profile
router.get("/profile", getProfile);

//PATCH - /api/user/profile/ - Update user's profile
router.patch("/profile", updateProfile);

//PATCH - /api/user/profile/password - Change user's password
router.patch("/profile/password", changePassword);

//Address Routes

//POST - /api/user/addresses - Add a new address for the user
router.post("/addresses", addAddress);

//PATCH - /api/user/addresses/:addressId - Update an existing address for the user
router.patch("/addresses/:addressId", updateAddress);

//DELETE - /api/user/addresses/:addressId - Delete an existing address for the user
router.delete("/addresses/:addressId", deleteAddress);

export default router;
