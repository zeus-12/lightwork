import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Router from "@/routes/index";
import { corsOptionsDelegate, PORT } from "@/lib/config";

dotenv.config();
const app = express();

app
  .listen(PORT)
  .on("listening", () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err: any) => {
    console.log(err);
  });

app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use("/api", Router);
