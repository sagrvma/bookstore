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

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string; //Human friendly ID (ORD-78654321-001)
  items: mongoose.Types.DocumentArray<IOrderItem & mongoose.Types.Subdocument>; //For TS, basically is just IOrderItem[]
  subtotal: number; //Sum of lineTotals of all order items
  tax: number; // Tax Amount (0 for now)
  shippingCost: number; // Shipping cost (0 for now)
  totalAmount: number; //subtotal+tax+totalAmount
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "cash_on_delivery" | "card";
  paymentIntentID?: string; //Stripe Payment intent ID
  shippingAddress: IShippingAddress;
  notes?: string; //Order notes, extra info if available/needed
  createdAt: Date;
  updatedAt: Date;
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

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
    },
    orderNumber: {
      type: String,
      required: [true, "Order Number is required."],
      unique: true,
      uppercase: true,
    },

    items: {
      type: [orderItemSchema],
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal can't be negative."],
    },
    tax: {
      type: Number,
      required: [true, "Tax is required."],
      default: 0,
      min: [0, "Tax can't be negative."],
    },
    shippingCost: {
      type: Number,
      required: [true, "Shipping cost is required."],
      default: 0,
      min: [0, "Shipping cost can't be negative."],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required."],
      min: [0, "Total amount can't be negative."],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required."],
      enum: ["cash_on_delivery", "card"],
      default: "cash_on_delivery",
    },
    paymentIntentId: {
      type: String,
      sparse: true, //Only present for card payments
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required."],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes can't exceed 500 characters."],
    },
  },
  {
    timestamps: true,
  }
);

//Generate unique orderNumber
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); //Converts date to ISO String and then slices it to only first 10 digits eg 2025-05-09 and them removes all hyphens (g means global to remove all hyphens and not just the first one) =>
    const count = await mongoose.model("Order").countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 59)),
      },
    });
    this.orderNumber = `ORD-${date}-${String(count + 1).padStart(3, "0")}`; //Pad start makes sure it is a 3 digit with as 0 prefixes as required, 1 becomes 001, 12 becomes 012 etc.
    next();
  }
});

//Indexes for efficient queryies
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
