import request from "supertest";
import express, { RequestHandler } from "express";
import { lookupController } from "../../src/controllers/lookupController";
import { fetchWhoisData } from "../../src/servcies/whoisService";

jest.mock("../../src/servcies/whoisService", () => ({
  fetchWhoisData: jest.fn(),
}));

const app = express();
app.use(express.json());
app.post("/lookup", lookupController as RequestHandler);

describe("lookupController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return WHOIS data for a valid query", async () => {
    (fetchWhoisData as jest.Mock).mockResolvedValue({
      domain: "example.com",
      registrar: "Test Registrar",
    });

    const res = await request(app)
      .post("/lookup")
      .send({ query: "example.com" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("domain", "example.com");
    expect(res.body).toHaveProperty("registrar", "Test Registrar");
  });

  it("should return 400 for missing query", async () => {
    const res = await request(app).post("/lookup").send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "Query is required" });
  });

  it("should return 400 for empty query", async () => {
    const res = await request(app).post("/lookup").send({ query: "" });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "Query is required" });
  });

  it("should return 500 on unexpected errors", async () => {
    (fetchWhoisData as jest.Mock).mockRejectedValue(
      new Error("Unexpected Error")
    );

    const res = await request(app)
      .post("/lookup")
      .send({ query: "example.com" });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });

  it("should handle non-existent domain lookup (assuming API returns an error)", async () => {
    (fetchWhoisData as jest.Mock).mockResolvedValue({
      error: "Domain not found",
    });

    const res = await request(app)
      .post("/lookup")
      .send({ query: "nonexistentdomain12345.com" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("error", "Domain not found");
  });

  it("should return a response for malformed queries (e.g., invalid domain)", async () => {
    (fetchWhoisData as jest.Mock).mockResolvedValue({
      error: "Invalid domain format",
    });

    const res = await request(app)
      .post("/lookup")
      .send({ query: "invalid_domain" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("error", "Invalid domain format");
  });
});
