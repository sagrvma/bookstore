import mongoose, { Document, mongo, Schema } from "mongoose";
import bcrypt from "bcryptjs";

import { IShippingAddress } from "./order";
export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  //Represents the User data after mongoose processing, not the input data
  name: string;
  email: string;
  password: string;
  role: "user" | "admin"; //Even if they are having default values, not optional ? since when they are saved they will be supplied a value even if its a default one. The optional part is in the user input.
  isActive: boolean; //Same as above
  addresses: IAddress[]; //Added to store multiple addresses for a user
  comparePassword(userPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required."],
    trim: true,
    maxLength: [100, "Full name can't exceed 100 characters"],
  },

  street: {
    type: String,
    required: [true, "Street is required."],
    trim: true,
    maxLength: [200, "Street address can't exceed 200 characters."],
  },

  city: {
    type: String,
    required: [true, "City is required."],
    trim: true,
    maxLength: [100, "City can't be exceed 100 characters."],
  },
  state: {
    type: String,
    required: [true, "State is required."],
    trim: true,
    maxLength: [50, "State can't exceed 50 characters."],
  },
  pinCode: {
    type: String,
    required: [true, "Pin Code is required."],
    trim: true,
    match: [/^[1-9][0-9]{5}$/, "Please enter a valid Pin Code."],
  },
  country: {
    type: String,
    required: [true, "Country is required."],
    trim: true,
    maxlength: [50, "Country can't exceed 50 characters."],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required."],
    trim: true,
    match: [
      /^(\+[1-9]\d{0,3})?[6-9]\d{9}$/,
      "Please enter a valid phone number.",
    ],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new Schema( //Represents how the input data for user is to be taken
  {
    name: {
      type: String,
      required: [true, "User name is required."],
      trim: true,
      minlength: [2, "User name must be at least 2 characters."],
      maxlength: [100, "User name cannot be more than 100 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      select: false, //Doesn't not get included in queries by default, use .select("+password") to include if needed
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addresses: {
      type: [addressSchema], //Added addresses array
      default: [],
      required: [true, "Addresses are required."],
      validate: {
        validator: (addresses: IAddress[]) => {
          //Return if no addresses, as that is allowed
          if (!addresses || addresses.length === 0) {
            return;
          }
          //Otherwise make sure atleast one address is default
          return addresses.some((addr) => addr.isDefault === true);
        },
        message:
          "If addresses are provided, atleast one of them must be default.",
      },
    },
  },
  { timestamps: true }
);

//Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  //Only hash if password was modified (new user or changed password)
  if (this.isModified("password")) {
    //isModified is a mongoose document method
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

//Pre-save middleware to ensure there is only one default address.
userSchema.pre("save", async function (next) {
  if (this.isModified("addresses")) {
    const defaultAddresses = this.addresses.filter(
      (address) => address.isDefault === true
    );

    if (defaultAddresses.length > 1) {
      //Keep only the last one as default
      const lastDefaultIndex = this.addresses
        .map((addr, idx) => ({ addr, idx })) //Convert to this address, indx object format
        .filter(({ addr }) => addr.isDefault) //Filter only default addresses
        .map(({ idx }) => idx) //Change format to only indexes
        .pop(); //Pop the last index

      this.addresses.forEach((addr, idx) => {
        addr.isDefault = idx === lastDefaultIndex;
      });
    }
  }
});

//Compare password method and validate if its the correct one
//Adding this method to all individual document instances using userSchema.methods
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
