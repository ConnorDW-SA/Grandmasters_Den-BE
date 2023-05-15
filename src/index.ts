// ------------------------------ Imports ------------------------------

import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import server from "./server.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket/socket";

// ------------------------------ Server ------------------------------

const port = process.env.PORT || 3001;

// ------------------------------ Socket ------------------------------

const httpServer = createServer(server);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "PUT", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});
io.on("connection", socketHandler);

// ------------------------------ DB ------------------------------

mongoose
  .connect(process.env.MONGO_CONNECTION!)
  .then(() => {
    console.log("Connected to Mongo!");
    httpServer.listen(port, () => {
      console.log("Server running on port", port);
      console.table(listEndpoints(server));
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
