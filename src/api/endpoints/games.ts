// -------------------------- IMPORTS -------------------------------------
import express from "express";
import createError from "http-errors";
import GameModel from "../models/games";
import UserModel from "../models/users";
import { jwtAuthMiddleware, UserRequest } from "../../auth/auth";
import { io } from "../../server";
// -------------------------- ROUTER -------------------------------------
const gamesRouter = express.Router();

export default gamesRouter

  // -------------------------- GET USER GAMES -------------------------------------
  .get("/userGames", jwtAuthMiddleware, async (req: UserRequest, res, next) => {
    try {
      const games = await GameModel.find({
        $or: [{ player1: req.user?._id }, { player2: req.user?._id }]
      }).populate("player1 player2");
      res.send(games);
    } catch (error) {
      next(error);
    }
  })

  // -------------------------- CREATE GAME -------------------------------------
  .post(
    "/createGame",
    jwtAuthMiddleware,
    async (req: UserRequest, res, next) => {
      try {
        const player2Id = req.body.player2;
        console.log("player2id:", player2Id);
        const player2User = await UserModel.findById(player2Id);
        if (!player2User) {
          console.log("player not found");
          return res.status(404).send({ error: "Player 2 not found" });
        }
        const existingGame = await GameModel.findOne({
          $or: [
            { player1: req.user?._id, player2: player2Id },
            { player1: player2Id, player2: req.user?._id }
          ]
        });

        if (existingGame) {
          console.log("A game between these players already exists");
          return res
            .status(400)
            .send({ error: "A game between these players already exists" });
        }

        const newGame = new GameModel({
          player1: req.user?._id,
          player2: player2Id
        });
        const { _id } = await newGame.save();
        res.status(201).send({ _id });
        console.log(_id);
      } catch (error) {
        next(error);
      }
    }
  )

  // -------------------------- GET USER GAME BY ID -------------------------------------
  .get("/:gameId", jwtAuthMiddleware, async (req: UserRequest, res, next) => {
    console.log("Request received for game ID:", req.params.gameId);
    try {
      const game = await GameModel.findOne({
        _id: req.params.gameId,
        $or: [{ player1: req.user?._id }, { player2: req.user?._id }]
      }).populate("player1 player2");

      if (game) {
        res.send(game);
      } else {
        next(createError(404, "Game not found"));
      }
    } catch (error) {
      next(error);
    }
  })

  // -------------------------- UPDATE GAME -------------------------------------
  .put("/:gameId", jwtAuthMiddleware, async (req: UserRequest, res, next) => {
    try {
      const game = await GameModel.findOne({
        _id: req.params.gameId,
        $or: [{ player1: req.user?._id }, { player2: req.user?._id }]
      }).populate("player1 player2");
      if (!game) {
        next(createError(404, "Game not found"));
        return;
      }
      const updatedGame = req.body;

      Object.assign(game, updatedGame);
      const savedGame = await game.save();
      console.log("Game updated");
      res.send(savedGame);
    } catch (error) {
      next(error);
    }
  });
