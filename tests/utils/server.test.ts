import request from "supertest";
import express, { RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { lookupController } from "../../src/controllers/lookupController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/lookup", lookupController as RequestHandler);

describe("server App", () => {
  it("should return a 200 status for the root endpoint", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Server is running");
  });

  it("should return a 200 status for successful lookup", async () => {
    const mockData = { domain: "example.com", registrar: "Test Registrar" };
    const mockLookupController = jest.fn((req, res) => {
      res.status(200).json(mockData);
    });
    app.post("/lookup", mockLookupController);

    const response = await request(app)
      .post("/lookup")
      .send({ query: "example.com" });
    expect(response.status).toBe(200);
  });

  it("should return a 400 status for invalid lookup data", async () => {
    const response = await request(app).post("/lookup").send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(undefined);
  });
});
