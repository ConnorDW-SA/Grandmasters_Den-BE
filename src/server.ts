// ------------------------------ Imports ------------------------------
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { socketHandler } from "./socket/socket";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { errorHandler } from "./auth/errorHandlers";
import usersRouter from "./api/endpoints/users";
import gamesRouter from "./api/endpoints/games";

// ------------------------------ Server and Config ------------------------------
dotenv.config();
const expressServer = express();
const httpServer = createServer(expressServer);
const port = process.env.PORT || 3001;

// ------------------------------ Socket.io ------------------------------
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "PUT", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});
io.on("connection", socketHandler);

// ------------------------------ Middlewares ------------------------------
const corsOptions = {
  origin: "http://localhost:3000",
  optionSuccessStatus: 200,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization,If-Match"
};
expressServer.use(cors(corsOptions));
expressServer.use(express.json({ limit: "5mb" }));

expressServer.use("/users", usersRouter);
expressServer.use("/games", gamesRouter);
expressServer.use(errorHandler);

// ------------------------------ Database Connection and Server Start ------------------------------

mongoose
  .connect(process.env.MONGO_CONNECTION!)
  .then(() => {
    console.log("Connected to Mongo!");
    httpServer.listen(port, () => {
      console.log("Server running on port", port);
      console.table(listEndpoints(expressServer));
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

process.on("SIGINT", function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");

  httpServer.close(() => {
    console.log("Http server closed.");
  });
});
