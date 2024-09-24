import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    Name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    about: {
      type: String,
    },
    isActive: {
      type: Boolean,
    },
    avatar: {
      type: String,
    },
    friendList: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          default: "Single",
        },
      },
    ],
    password: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

UserSchema.methods.generateAccessToken = async function () {
  const token = jwt.sign(
    {
      id: this._id,
      userName: this.userName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: "1d",
    }
  );
  return token;
};
export const User = mongoose.model("User", UserSchema);
