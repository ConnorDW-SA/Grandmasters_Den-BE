import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserDocument, UserModel } from "./userTypes";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPW = newUser.password;
  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.createdAt;
  delete user.updatedAt;
  return user;
};

UserSchema.static(
  "checkCredentials",
  async function (email: string, password: string) {
    const user: UserDocument = await this.findOne({ email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        return user;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
);

export default model<UserDocument, UserModel>("User", UserSchema);
