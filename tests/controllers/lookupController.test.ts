import { Request, Response } from "express";
import { AxiosError } from "axios";
import { lookupController } from "../../src/controllers/lookupController";
import { fetchWhoisData } from "../../src/servcies/whoisService";
import { mocked } from "jest-mock";

// Mock the fetchWhoisData function
jest.mock("../../src/servcies/whoisService");

describe("lookupController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    json = res.json as jest.Mock;
  });

  it("should return 400 if query is not provided", async () => {
    req.body = {}; // No query

    await lookupController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Query is required" });
  });

  it("should call fetchWhoisData and return data", async () => {
    const query = "example.com";
    req.body = { query };

    // Mock the response of the fetchWhoisData function
    mocked(fetchWhoisData).mockResolvedValue({
      WhoisRecord: {
        domainName: query,
        registrarName: "Example Registrar",
        creationDate: "2000-01-01",
        expiryDate: "2025-01-01",
        status: "Active",
      },
    });

    await lookupController(req as Request, res as Response);

    expect(fetchWhoisData).toHaveBeenCalledWith(query);
    expect(res.json).toHaveBeenCalledWith({
      WhoisRecord: {
        domainName: query,
        registrarName: "Example Registrar",
        creationDate: "2000-01-01",
        expiryDate: "2025-01-01",
        status: "Active",
      },
    });
  });

  it("should handle AxiosError and return 500", async () => {
    const query = "example.com";
    req.body = { query };
    const axiosError = new AxiosError("Request failed");
    mocked(fetchWhoisData).mockRejectedValue(axiosError);

    await lookupController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });

  it("should handle unexpected errors and return 500", async () => {
    const query = "example.com";
    req.body = { query };

    // Mock fetchWhoisData to throw a non-Axios error
    const error = new Error("Unexpected error");
    mocked(fetchWhoisData).mockRejectedValue(error);

    await lookupController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });
});
