// -------------------------- IMPORTS -------------------------------------
import express from "express";
import createError from "http-errors";
import UserModel from "../models/users";
import GameModel from "../models/games";
import { createAccessToken } from "../../auth/tools";
import { jwtAuthMiddleware, UserRequest } from "../../auth/auth";
import mongoose from "mongoose";

// -------------------------- ROUTER -------------------------------------
const usersRouter = express.Router();

export default usersRouter

  // -------------------------- GET USERS -------------------------------------
  .get("/allUsers", jwtAuthMiddleware, async (req: UserRequest, res, next) => {
    try {
      const currentUserID = req.user?._id;
      const games = await GameModel.find({
        $or: [
          { player1: new mongoose.Types.ObjectId(currentUserID) },
          { player2: new mongoose.Types.ObjectId(currentUserID) }
        ]
      });
      const usersWithExistingGames = games.map((game) =>
        game.player1.toString() === currentUserID
          ? game.player2.toString()
          : game.player1.toString()
      );
      const users = await UserModel.find({
        _id: {
          $ne: currentUserID,
          $nin: usersWithExistingGames
        }
      });
      res.send(users.map((user) => user.toJSON()));
    } catch (error) {
      next(error);
    }
  })

  // -------------------------- LOGIN -------------------------------------
  .post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.checkCredentials(email, password);

      if (user) {
        const payload = { _id: user._id };
        const accessToken = await createAccessToken(payload);
        res.send({ user, accessToken });
        console.log(user.email, "logged in");
      } else {
        next(createError(401, "Invalid email or password"));
      }
    } catch (error) {
      next(error);
    }
  })

  // -------------------------- REGISTER -------------------------------------
  .post("/register", async (req, res, next) => {
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
