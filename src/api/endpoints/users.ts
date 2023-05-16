import express from "express";
import createError from "http-errors";
import UserModel from "../models/users";
import { createAccessToken } from "../../auth/tools";
import { jwtAuthMiddleware, UserRequest } from "../../auth/auth";

const usersRouter = express.Router();

// Get users

usersRouter.get(
  "/allUsers",
  jwtAuthMiddleware,
  async (req: UserRequest, res, next) => {
    try {
      const currentUser = await UserModel.findById(req.user?._id);
      const users = await UserModel.find({ _id: { $ne: currentUser?._id } });
      res.send(users.map((user) => user.toJSON()));
    } catch (error) {
      next(error);
    }
  }
);

// Login

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.checkCredentials(email, password);

    if (user) {
      const payload = { _id: user._id };
      const accessToken = await createAccessToken(payload);
      res.send({ user, accessToken });
    } else {
      next(createError(401, "Invalid email or password"));
    }
  } catch (error) {
    next(error);
  }
});

// Register

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res
        .status(400)
        .send({ error: "Email or username already in use" });
    }
    const newUser = new UserModel({
      username,
      password,
      email
    });
    const { _id } = await newUser.save();
    const payload = { _id: newUser._id };
    const accessToken = await createAccessToken(payload);
    res.status(201).send({ user: newUser, accessToken });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
