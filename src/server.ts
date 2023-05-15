import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { socketHandler } from "./socket/socket";

import { errorHandler } from "./auth/errorHandlers";

const expressServer = express();

const httpServer = createServer(expressServer);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "PUT", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});
io.on("connection", socketHandler);

const corsOptions = {
  origin: "http://localhost:3000",
  optionSuccessStatus: 200,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};

expressServer.use(cors(corsOptions));
expressServer.use(express.json({ limit: "5mb" }));

expressServer.use(errorHandler);

export { httpServer, expressServer };
