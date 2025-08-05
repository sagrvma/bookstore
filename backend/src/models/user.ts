import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  //Represents the User data after mongoose processing, not the input data
  name: string;
  email: string;
  password: string;
  role: "user" | "admin"; //Even if they are having default values, not optional ? since when they are saved they will be supplied a value even if its a default one. The optional part is in the user input.
  isActive: boolean; //Same as above
  comparePassword(userPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

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
      select: false, //Doesn't not get included in queries by default
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
  },
  { timestamps: true }
);

//Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  //Cant use arrow fns here since they lexically bing this to the enclosing module's scope which means this.password could be undefined
  //Regular functions dynamically bing this based on how the fn is called, in this case in the document's scope

  //Only hash if password was modified (new user or changed password)
  if (!this.isModified("password")) {
    //isModified is a mongoose document method
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  }
});

//Compare password method and validate if its the correct one
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
