import { Document, Model } from "mongoose";
import { UserDocument } from "./userTypes";

export interface Piece {
  type: string;
  color: string;
  position?: string;
  hasMoved?: boolean;
}

export interface Game {
  player1: UserDocument;
  player2: UserDocument;
  boardState: Piece[];
  currentPlayer: UserDocument;
}

export interface GameDocument extends Game, Document {}

export interface GameModel extends Model<GameDocument> {}
