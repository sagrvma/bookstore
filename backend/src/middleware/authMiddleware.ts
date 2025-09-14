import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  //For TS, as Request by default doesnt have a user property, which we will be using
  user?: IUser;
}

//Authentication middleware - Verifies JWT token from header
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    //Get token from the authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      //Since the format is
      //"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied! No token provided.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT secret env variable is not set.");
      //Throwung an error instead of returning res.status.json as this is a config error and not something caused by the user. When there is a user caused error, the application keeps running with the appropriate response, in this case thought we need the application to stop running and crash until the secret is defined.
    }

    const payload = jwt.verify(token, secret) as {
      //Decoded from token
      userId: string;
      username: string;
      role: string;
    }; //For TS, as usually jwt.verify has a generic return type (string | JwtPayload | object) which is not aware of our custon JWT payload.

    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access denied! User not found.",
      });
    }

    req.user = user;

    next();
  } catch (error: any) {
    console.error("Error in authentication middleware: ", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied! Token expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access denied! Invalid token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Access denied! Authentication failed.",
    });
  }
};

//Authorization middleware - Restricts access based on user roles
//Using a higherOrder function here as this middleware needs parameters, and express middlewares have a fixed signature and cannot take custome parameters. If we dont do that, we would have to define different middlewares for all roles. Therefore,
// 1. Fixed Behaviour -> Direct Middleware Function
// 2. Configurable Behaviour -> Higher Order Function
export const restrictTo = (...allowedRoles: string[]) => {
  //REST Parameters Syntax, the ... collect multiple arguments into a single array, So there can be any number of arguments passed and we dont have to predefine the number of arguments which wont be flexible
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied! User not authenticated.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        //403 for authorization error
        success: false,
        message: "Access denied! User not authorized to access this resource.",
      });
    }

    //If above 2 things okay, then just allow to proceed
    next();
  };
};
