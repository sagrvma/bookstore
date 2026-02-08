import mongoose, { Document, model, Schema } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: mongoose.Types.ObjectId | string;
  isbn: string;
  price: number;
  stock: number;
  description?: string;
  coverImage?: string;
  category: string;
  publishedDate?: Date;
  pages?: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Book's title is required."],
      trim: true,
      minlength: [2, "Book's title must be at least 2 characters."],
      maxlength: [100, "Book's title can't exceed 100 characters."],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: [true, "Book's author is required."],
    },
    isbn: {
      type: String,
      required: [true, "Book's ISBN is required."],
      unique: true,
      trim: true,
      match: [/^[0-9-]{10,17}$/, "Please enter a valid ISBN"],
    },
    price: {
      type: Number,
      required: [true, "Book's price is required."],
      min: [0, "Price can't be negative."],
    },
    stock: {
      type: Number,
      required: [true, "Book's stock is required."],
      min: [0, "Stock can't be negative."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description can't exceed 2000 characters."],
    },
    coverImage: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string) => {
          return value.startsWith("http://") || value.startsWith("https://");
        },
        message: "Cover image URL must start with http:// or https://",
      },
    },
    category: {
      type: String,
      required: [true, "Book's category is required."],
      trim: true,
      maxlength: [50, "Category can't exceed 50 characters."],
    },
    publishedDate: {
      type: Date,
      validate: {
        validator: (value: Date) => {
          return !value || value <= new Date();
        },
        message: "Published date can't be in the future.",
      },
    },
    pages: {
      type: Number,
      min: [1, "Number of pages should be at least 1."],
    },
  },
  { timestamps: true },
);

const Book = model<IBook>("Book", bookSchema);

export default Book;
