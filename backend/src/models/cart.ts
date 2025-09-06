import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  _id?: mongoose.Types.ObjectId; //Unique Item id, will be useful for React rendering
  book: mongoose.Types.ObjectId; //Book's id
  title: string; // Book's title
  price: number; //Price when being added to the cart(Price protection)
  quantity: number;
  subtotal: number; //Price X Quantity
}

const cartItemSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: ["true", "Book reference is required."],
  },
  title: {
    type: String,
    trim: true,
    required: [true, "Title of the book is required."],
  },
  price: {
    type: Number,
    required: [true, "Price of the book is required."],
    min: [0, "Price of the book can't be negative."],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required."],
    min: [1, "Quantity should be atleast 1."],
    max: [10, "Maximum 10 copies of 1 book allowed."],
  },
});
