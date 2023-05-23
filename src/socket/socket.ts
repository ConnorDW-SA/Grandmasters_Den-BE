import { Socket } from "socket.io";
import GameModel from "../api/models/games";
export const socketHandler = (newClient: Socket) => {
  console.log("NEW CONNECTION:", newClient.id);

  newClient.on("fetch_game", (gameId: string) => {
    console.log(`Client ${newClient.id} fetched game ${gameId}`);
    newClient.join(gameId);
  });

  newClient.on("move", async (gameId: string, newGameState) => {
    console.log(`Client ${newClient.id} updated game ${gameId}`);
    await GameModel.updateOne({ _id: gameId }, newGameState);

    // Retrieve the updated game from the database
    const updatedGame = await GameModel.findById(gameId);

    // Emit the move_made event with the current player ID
    newClient.to(gameId).emit("move_made", updatedGame?.currentPlayer);
  });

  newClient.on("disconnect", () => {
    newClient.broadcast.emit("User disconnected");
  });
};
