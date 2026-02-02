// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import { errorMiddleware } from "./util/errorhandler";
import router from "./routes";
import connectDB from "./dbs/mongodb";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://manager-fe.testhmc.site/",
    "http://157.10.199.146:3001",
    "https://manager-fe.testhmc.site",
    "http://localhost:3001",
    "https://sv.yhn.edu.vn"
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});
app.use("/api", router);

app.use(errorMiddleware);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});
