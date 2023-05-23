import { Socket } from "socket.io";
import GameModel from "../api/models/games";
export const socketHandler = (newClient: Socket) => {
  console.log("NEW CONNECTION:", newClient.id);

  newClient.on("fetch_game", (gameId: string) => {
    console.log(`Client ${newClient.id} fetched game ${gameId}`);
    newClient.join(gameId);
  });

  newClient.on("move", async (gameId: string, newGameState) => {
    if (
      String(newGameState.currentPlayer._id) ===
      String(newGameState.player1._id)
    ) {
      newGameState.currentPlayer = newGameState.player2._id;
    } else {
      newGameState.currentPlayer = newGameState.player1._id;
    }

    await GameModel.updateOne({ _id: gameId }, newGameState);
    console.log(`Client ${newClient.id} updated game ${gameId}`);
    newClient.to(gameId).emit("game_updated", newGameState);
  });

  newClient.on("disconnect", () => {
    newClient.broadcast.emit("User disconnected");
  });
};
