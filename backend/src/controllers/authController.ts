import mongoose from "mongoose";
import { IUser } from "../models/user";
import jwt from "jsonwebtoken";

const genJWT = (user: IUser) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret env variable is not set.");
  }
  const accessToken = jwt.sign(
    {
      //Bearer token
      userId: user._id,
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
