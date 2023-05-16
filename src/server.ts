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

// ------------------------------ Server and Config ------------------------------
dotenv.config();
const expressServer = express();
const httpServer = createServer(expressServer);
const port = process.env.PORT || 3003;

// ------------------------------ Socket.io ------------------------------
const io = new Server(httpServer, {
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
  allowedHeaders: "Content-Type,Authorization"
};
expressServer.use(cors(corsOptions));
expressServer.use(express.json({ limit: "5mb" }));
expressServer.use(errorHandler);
expressServer.use("/users", usersRouter);
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
