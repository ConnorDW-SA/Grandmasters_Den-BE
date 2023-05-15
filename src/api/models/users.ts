import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface User extends Document {
  username: string;
  password: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  toJSON(): User;
}

interface UserSchemaStatics {
  checkCredentials(email: string, plainPW: string): Promise<User | null>;
}

const UserSchema = new Schema<User, Model<User, UserSchemaStatics>>(
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

UserSchema.pre<User>("save", async function (next) {
  const newUser = this;
  const plainPW = newUser.password;
  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

UserSchema.methods.toJSON = function (): User {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.createdAt;
  delete user.updatedAt;
  return user;
};

UserSchema.statics.checkCredentials = async function (
  email: string,
  plainPW: string
): Promise<User | null> {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

const UserModel = mongoose.model<User, Model<User, UserSchemaStatics>>(
  "User",
  UserSchema
);

export { User, UserModel };
