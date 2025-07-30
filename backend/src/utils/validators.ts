import mongoose from "mongoose";

export const validateId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};
