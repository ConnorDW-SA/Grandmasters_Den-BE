import { Socket } from "socket.io";

interface Move {
  from: string;
  to: string;
  currentPlayer: string;
  capturedPiece?: string;
  promotion?: string;
  moveHistory: [{}];
}

export const socketHandler = (newClient: Socket) => {
  console.log("NEW CONNECTION:", newClient.id);
  newClient.emit("welcome", { message: `Hello ${newClient.id}` });

  newClient.on("join game", (gameId: string) => {
    console.log(`Client ${newClient.id} joined game ${gameId}`);
    newClient.join(gameId);
    newClient.to(gameId).emit("player joined", { playerId: newClient.id });
  });

  newClient.on(
    "make move",
    ({ gameId, move }: { gameId: string; move: Move }) => {
      console.log(
        `Client ${newClient.id} made move ${JSON.stringify(
          move
        )} in game ${gameId}. Current turn: ${move.currentPlayer}`
      );
      newClient.to(gameId).emit("opponent move", move);
    }
  );

  newClient.on("disconnect", () => {
    newClient.broadcast.emit("User disconnected");
  });
};
