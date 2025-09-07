import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  //Subdocument
  _id?: mongoose.Types.ObjectId; //or TS, since subdocument and not extending Document so needs to be declared explicitly
  book: mongoose.Types.ObjectId;
  title: string;
  author: string;
  price: number;
  quantity: number;
  lineTotal: number; //Price*Quantity, stored, not virtual
}

const orderItemSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: [true, "Book's reference is required."],
  },
  title: {
    type: String,
    required: [true, "Book's title is required."],
    trim: true,
  },
  author: {
    type: String,
    required: [true, "Author's name is required."],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price of the book is required."],
    min: [0, "Price of the book can't be negative."],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required."],
    min: [1, "Quantity must be atleast 1."],
  },
  lineTotal: {
    type: Number,
    required: [true, "Line Total is required."],
    min: [0, "Line total can't be negative."],
  },
});
