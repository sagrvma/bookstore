import { NextFunction } from "express";
import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  _id?: mongoose.Types.ObjectId; //For TS, as this is a subdocument and we are not extending Document, so it doesnt get _id by default through that and needs to be explicity defined
  book: mongoose.Types.ObjectId; //Book's id
  title: string; // Book's title
  price: number; //Price when being added to the cart(Price protection)
  quantity: number;
  subtotal: number; //Price X Quantity
}
/*
ICartItem is a subdocument of ICart and therefore doesnt need to extend Document. It will only be saved when ICart will be saved so there is no use of extending docuemnt. Only top level documents should extend Document, as Icart will.

If ICartItem extends Document, TypeScript thinks you can do:
const item: ICartItem = cart.items;
await item.save();        // ❌ Doesn't work - subdocs can't save independently
await item.remove();      // ❌ Doesn't work - no independent removal
item.populate('book');    // ❌ Confusing - subdocs don't populate like documents

// If ICartItem extends Document, TypeScript thinks you can do:
const item: ICartItem = cart.items;
await item.save();        // ❌ Doesn't work - subdocs can't save independently
await item.remove();      // ❌ Doesn't work - no independent removal
item.populate('book');    // ❌ Confusing - subdocs don't populate like documents
*/

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: mongoose.Types.DocumentArray<ICartItem & mongoose.Types.Subdocument>; //ICartItem[]; So we can use subdocument methods like id(), pull() and push() on document arrays. & because the ICartItem gives field options for the document ICartItem and the subdocument gives access to id(), push() and pull().
  totalQuantity: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  calculateTotals(): void; //Function to recalculate totals
}

const cartItemSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: [true, "Book reference is required."],
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
  subtotal: {
    type: Number,
    required: [true, "Subtotal is required."],
    min: [0, "Subtotal can't be negative"],
  },
});

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference for cart is required."],
      unique: true, //Only 1 cart for each user
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalQuantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity can't be negative."],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Amount can't be negative."],
    },
  },
  { timestamps: true }
);

//Method to calculate and update totals
cartSchema.methods.calculateTotals = function (): void {
  this.totalQuantity = this.items.reduce(
    (total: number, item: ICartItem) => total + item.quantity,
    0
  );
  this.totalAmount = this.items.reduce(
    (total: number, item: ICartItem) => total + item.subtotal,
    0
  );
};

//Pre-save middleware to calculate item subtotals and cart totals
cartSchema.pre("save", function (this: ICart, next): void {
  //not next:NextFunction as this next is the mongoose next callback function and not from express. Also defined this:Icart explicitly as TS doesnt know what this type can hold and doesnt know if it would have this.calculateTotals, only needed cuz its a custom method and TS is not sure of its. Not needed for just this.items or other schema properties.

  //Calculate subtotal for each item
  this.items.forEach((item: ICartItem) => {
    item.subtotal = item.price * item.quantity;
  });

  //Calculate cart totals
  this.calculateTotals();
  next();
});

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
