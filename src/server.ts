import express, { RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { lookupController } from "./controllers/lookupController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
console.log("cors is done");
app.use(express.json());
console.log("request body");
app.use(express.urlencoded({ extended: true }));
console.log("url encoding is done");

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.body);
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.post("/lookup", lookupController as RequestHandler);

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}, process.env.PORT=${process.env.PORT}`
  );
});
