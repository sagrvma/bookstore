import mongoose, { Document, model, Schema } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  slug: string;
  bio?: string;
  birthDate?: Date;
  nationality?: string;
  createdAt: Date;
  updatedAt: Date;
}

const authorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Author's name is required."],
      trim: true,
      minlength: [2, "Author's name has to be at least 2 characters."],
      maxlength: [100, "Author's name can't exceed 100 characters."],
    },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug can only consist of lowercase letters, digits or hyphens.",
      ],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio can't exceed 1000 characters."],
    },
    birthDate: {
      type: Date,
      validate: {
        validator: (value: Date) => {
          return !value || value < new Date();
        },
        message: "Birth date can't be in the future.",
      },
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: [100, "Nationality can't exceed 100 characters."],
    },
  },
  { timestamps: true }
);

const Author = model<IAuthor>("Author", authorSchema);

export default Author;
