// ------------------------------ Imports ------------------------------

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import usersRouter from "./api/endpoints/users.js";
// import gamesRouter from "./api/endpoints/games.js";
import { errorHandler } from "./auth/errorHandlers";

// ------------------------------ Server ------------------------------

dotenv.config();
const server = express();

// ------------------------------ MiddleWares ------------------------------

const corsOptions = {
  origin: "http://localhost:3000",
  optionSuccessStatus: 200,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};

server.use(cors(corsOptions));
server.use(express.json({ limit: "5mb" }));

// ------------------------------ Routes ------------------------------

// server.use("/users", usersRouter);
// server.use("/games", gamesRouter);

// // ------------------------------ Error Handlers ------------------------------

server.use(errorHandler);

export default server;
