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

export interface IShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
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

const shippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      max: [0, "Full name can't exceed 100 characters."],
    },
    street: {
      type: String,
      required: [true, "Street address is required."],
      trim: true,
      max: [200, "Street address can't exceed 200 characters."],
    },
    city: {
      type: String,
      required: [true, "City is required."],
      trim: true,
      max: [50, "City can't exceed 50 characters."],
    },
    state: {
      type: String,
      required: [true, "State is required."],
      trim: true,
      max: [50, "State can't exceed 50 characters."],
    },
    zipCode: {
      type: String,
      required: [true, "Zip Code is required."],
      trim: true,
      match: [/^d{6}$/, "Please enter a valid Zip Code."],
    },
    country: {
      type: String,
      required: [true, "Country is required."],
      trim: true,
      max: [50, "Country can't exceed 50 characters."],
    },
    phone: {
      type: Number,
      required: [true, "Phone number is required."],
      trim: true,
      match: [/^\+?[\d\s-()]{10,15}$/, "Please enter a valid phone number."],
    },
  },
  {
    id: false, // ID not needed for shipping address.
  }
);
