import mongoose from "mongoose";
import User, { IUser } from "../models/user";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const genJWT = (user: IUser): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret env variable is not set.");
  }
  const accessToken = jwt.sign(
    {
      //Bearer token
      userId: (user._id as mongoose.Types.ObjectId).toString(), //Avoiding TS error in IDE
      username: user.name,
      role: user.role,
    },
    secret,
    {
      expiresIn: "1h",
    }
  );

  return accessToken;
};

const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, role } = req.body;

    //Check if user already exists
    const existingUser: IUser | null = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists!",
      });
    }

    //Create new user
    const newUser: IUser = new User({ name, email, password, role }); //Password will be automatically hashed by our middleware in user
    await newUser.save();

    //Generate JWT Token
    const token: string = genJWT(newUser);

    return res.status(201).json({
      success: true,
      message: "New user registered successfully.",
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Error while trying to register user: ", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.errors || error.message || "Unknown error!",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while registering new user! Please try again.",
      errors: error.errors || error.message || "Unknown error!",
    });
  }
};
