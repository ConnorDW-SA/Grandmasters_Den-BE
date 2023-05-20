// -------------------------- IMPORTS -------------------------------------
import express from "express";
import createError from "http-errors";
import GameModel from "../models/games";
import UserModel from "../models/users";
import { jwtAuthMiddleware, UserRequest } from "../../auth/auth";

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
      console.log(games);
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
        console.log(game);
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
      });

      if (!game) {
        next(createError(404, "Game not found"));
        return;
      }

      const { oldPosition, newPosition, hasMoved } = req.body;

      const pieceIndex = game.boardState.findIndex(
        (piece) => piece.position === oldPosition
      );

      if (pieceIndex === -1) {
        next(createError(400, "Piece not found"));
        return;
      }

      game.boardState[pieceIndex].position = newPosition;
      if ("hasMoved" in game.boardState[pieceIndex]) {
        game.boardState[pieceIndex].hasMoved = hasMoved;
      }

      const currentPlayer =
        game.currentPlayer.toString() === game.player1.toString()
          ? game.player2
          : game.player1;
      game.currentPlayer = currentPlayer;

      const updatedGame = await game.save();

      res.send(updatedGame);
      console.log("User successfully updated game");
    } catch (error) {
      next(error);
    }
  });
