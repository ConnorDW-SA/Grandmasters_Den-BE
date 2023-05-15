import { Socket } from "socket.io";

interface Move {
  from: string;
  to: string;
  currentTurn: string;
  capturedPiece?: string;
  promotion?: string;
}

interface ChatMessage {
  sender: string;
  content: string;
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
        )} in game ${gameId}. Current turn: ${move.currentTurn}`
      );
      newClient.to(gameId).emit("opponent move", move);
    }
  );

  newClient.on(
    "send chat message",
    ({ gameId, message }: { gameId: string; message: ChatMessage }) => {
      console.log(
        `Client ${newClient.id} sent a chat message in game ${gameId}`
      );
      newClient.to(gameId).emit("receive chat message", message);
    }
  );

  newClient.on("disconnect", () => {
    newClient.broadcast.emit("User disconnected");
  });
};
