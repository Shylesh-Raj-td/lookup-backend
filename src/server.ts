import express, { RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { lookupController } from "./controllers/lookupController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.post("/lookup", lookupController as RequestHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
