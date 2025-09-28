import { Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/user";

type IAddress = {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

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

    //Check if old password is valid
    const isValid = await user.comparePassword(oldPassword);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
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

    await user.save();

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

const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const {
      fullName,
      street,
      city,
      state,
      pinCode,
      country,
      phone,
      isDefault = false,
    } = req.body;

    const newAddress: IAddress = {
      fullName: fullName.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      country: country.trim(),
      phone: phone.trim(),
      isDefault: isDefault || user.addresses.length === 0, //First address is always default
    };

    user.addresses.push(newAddress);
    await user.save();

    const updatedUser = await User.findById(userId);

    return res.status(200).json({
      success: true,
      message: "Address added successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error while trying to add the address: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while adding the address! Please try again later.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { addressId } = req.params;

    const updatedData = req.body;

    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id?.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Invalid address id",
      });
    }

    Object.keys(updatedData).forEach((key) => {
      if (key != "_id" && updatedData[key] != undefined) {
        (user.addresses[addressIndex] as any)[key] = updatedData[key];
      }
    });

    await user.save();

    const updatedUser = await User.findById(userId);

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error while updating the address: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating the address! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { addressId } = req.params;

    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id?.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    //Check if a default address is being deleted
    const wasDefault = user.addresses[addressIndex].isDefault;

    //Remove the address
    user.addresses.splice(addressIndex, 1);

    //If it was the default address and more addresses still left, make the first one default

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    const updatedUser = await User.findById(userId);

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error while deleting the address: ", error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while deleting the address! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};

export {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
};
