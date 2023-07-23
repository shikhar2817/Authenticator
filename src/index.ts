import express, { Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import router from "./router";
import { pool } from "./db";

dotenv.config();

// application setup

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(port, () => {
  return console.log(`Server is running on PORT: ${port}`);
});

app.get("/api/health", (req: Request, res: Response) => {
  res.send("<h1>Healthy</h1>");
});

// router setup
app.use("/api", router());
pool.connect();
