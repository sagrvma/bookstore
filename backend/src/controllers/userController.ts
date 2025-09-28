import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/user";

const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error: any) {
    console.error("Error while fetching the profile: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching the profile! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const { name, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: "Atleast one field (name or email) is required.",
      });
    }

    //Check if email already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered to another account.",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -__v");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error while updating profile: ", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error.",
        errors: error.errors || error.message || "Unknown error!",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating the profile! Please try again.",
      errors: error.errors || error.message || "Unkown error!",
    });
  }
};

const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current passwor and New password are required.",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    //Check if new password isnt the same as the old one
    const isSame = await user.comparePassword(newPassword);

    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password can't be the same as the Old password.",
      });
    }

    //Save new password, hashing handled by pre save middleware
    user.password = newPassword;

    user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error: any) {
    console.error("Error while changing the password: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while changing the password! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};
