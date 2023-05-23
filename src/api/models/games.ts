import mongoose from "mongoose";
import { GameDocument, GameModel, Piece } from "./gameTypes";

const initialBoardState = [
  { type: "rook", color: "white", position: "a1", hasMoved: false },
  { type: "knight", color: "white", position: "b1" },
  { type: "bishop", color: "white", position: "c1" },
  { type: "queen", color: "white", position: "d1" },
  { type: "king", color: "white", position: "e1", hasMoved: false },
  { type: "bishop", color: "white", position: "f1" },
  { type: "knight", color: "white", position: "g1" },
  { type: "rook", color: "white", position: "h1", hasMoved: false },
  { type: "pawn", color: "white", position: "a2" },
  { type: "pawn", color: "white", position: "b2" },
  { type: "pawn", color: "white", position: "c2" },
  { type: "pawn", color: "white", position: "d2" },
  { type: "pawn", color: "white", position: "e2" },
  { type: "pawn", color: "white", position: "f2" },
  { type: "pawn", color: "white", position: "g2" },
  { type: "pawn", color: "white", position: "h2" },

  { type: "rook", color: "black", position: "a8", hasMoved: false },
  { type: "knight", color: "black", position: "b8" },
  { type: "bishop", color: "black", position: "c8" },
  { type: "queen", color: "black", position: "d8" },
  { type: "king", color: "black", position: "e8", hasMoved: false },
  { type: "bishop", color: "black", position: "f8" },
  { type: "knight", color: "black", position: "g8" },
  { type: "rook", color: "black", position: "h8", hasMoved: false },
  { type: "pawn", color: "black", position: "a7" },
  { type: "pawn", color: "black", position: "b7" },
  { type: "pawn", color: "black", position: "c7" },
  { type: "pawn", color: "black", position: "d7" },
  { type: "pawn", color: "black", position: "e7" },
  { type: "pawn", color: "black", position: "f7" },
  { type: "pawn", color: "black", position: "g7" },
  { type: "pawn", color: "black", position: "h7" }
];

const { Schema, model } = mongoose;

const PieceSchema = new Schema<Piece>({
  type: { type: String, required: true },
  color: { type: String, required: true },
  position: { type: String },
  hasMoved: { type: Boolean, default: false }
});

const GameSchema = new Schema<GameDocument, GameModel>(
  {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    boardState: {
      type: [PieceSchema],
      required: true,
      default: initialBoardState
    },
    currentPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      default: function () {
        return this.player1;
      }
    }
  },
  { timestamps: true }
);

export default model<GameDocument, GameModel>("Game", GameSchema);
