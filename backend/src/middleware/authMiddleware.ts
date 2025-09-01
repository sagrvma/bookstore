import { Request } from "express";
import { IUser } from "../models/user";

export interface AuthRequest extends Request {
  //For TS, as Request by default doesnt have a user property, which we will be using
  user?: IUser;
}
