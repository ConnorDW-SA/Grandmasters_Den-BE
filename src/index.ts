import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import { httpServer, expressServer } from "./server";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 3001;

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
