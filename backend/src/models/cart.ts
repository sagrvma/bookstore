import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
  _id?: mongoose.Types.ObjectId; //For TS, as this is a subdocument and we are not extending Document, so it doesnt get _id by default through that and needs to be explicity defined
  book: mongoose.Types.ObjectId; //Book's id
  title: string; // Book's title
  price: number; //Price when being added to the cart(Price protection)
  quantity: number;
  // subtotal: number; //Price X Quantity (NOT KEEPING PERSISTED JUST LIKE TOTALS IN CART, USING VIRTUALS INSTEAD)
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
  // totalQuantity: number;//Not keeping totals persisted as they might not automatically update when we update items,
  // totalAmount: number;//Using virtuals instead
  //This is because pre.save middleware doesnt run for update paths/findOneAndUpdate
  createdAt: Date;
  updatedAt: Date;
  // calculateTotals(): void; //Function to recalculate totals (NOT NEEDED AS NOW USING VIRTUALS)
}

const cartItemSchema = new Schema(
  {
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
    // subtotal: { (VIRTUAL)
    //   type: Number,
    //   required: [true, "Subtotal is required."],
    //   min: [0, "Subtotal can't be negative"],
    // },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

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
    // totalQuantity: { (VIRTUAL)
    //   type: Number,
    //   default: 0,
    //   min: [0, "Quantity can't be negative."],
    // },
    // totalAmount: { (VIRTUAL)
    //   type: Number,
    //   default: 0,
    //   min: [0, "Amount can't be negative."],
    // },
  },
  {
    timestamps: true,
    //To make sure virtuals appear in API responses
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// //Method to calculate and update totals (NOT NEEDED AS NOW USING VIRTUALS INSTEAD)
// cartSchema.methods.calculateTotals = function (): void {
//   this.totalQuantity = this.items.reduce(
//     (total: number, item: ICartItem) => total + item.quantity,
//     0
//   );
//   this.totalAmount = this.items.reduce(
//     (total: number, item: ICartItem) => total + item.subtotal,
//     0
//   );
// };

// //Pre-save middleware to calculate item subtotals and cart totals (NOT NEEDED AS USING VIRTUALS INSTEAD)
// cartSchema.pre("save", function (this: ICart, next): void {
//   //not next:NextFunction as this next is the mongoose next callback function and not from express. Also defined this:Icart explicitly as TS doesnt know what this type can hold and doesnt know if it would have this.calculateTotals, only needed cuz its a custom method and TS is not sure of its. Not needed for just this.items or other schema properties.

//   //Calculate subtotal for each item
//   this.items.forEach((item: ICartItem) => {
//     item.subtotal = item.price * item.quantity;
//   });

//   // Calculate cart totals x (USING VIRTUALS INSTEAD)
//   // this.calculateTotals();
//   next();
// });

cartItemSchema.virtual("subtotal").get(function (this: ICartItem) {
  return this.price * this.quantity;
});

cartSchema.virtual("totalQuantity").get(function (this: ICart) {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual("totalPrice").get(function (this: ICart) {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  ); //Error as subtotal is a virtual
});

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
