import mongoose from "mongoose";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log("Error:", err);

  switch (err.status) {
    case 400:
    case err instanceof mongoose.Error.ValidationError:
      res.status(400).send({ message: "Bad request" });
      break;
    case 401:
      res.status(401).send({ message: "Unauthorized" });
      break;
    case 403:
      res.status(403).send({ success: false, message: "Forbidden" });
      break;
    case 404:
      res.status(404).send({ message: "Not found" });
      break;
    default:
      res.status(500).send({ message: "Server Error" });
  }
};

class CustomError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export default CustomError;
