import axios from "axios";
import NodeCache from "node-cache";
import { fetchWhoisData } from "../../src/servcies/whoisService";

jest.mock("axios");

describe("fetchWhoisData", () => {
  let mockCache: jest.Mocked<NodeCache>;

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      mget: jest.fn(),
      del: jest.fn(),
      flushAll: jest.fn(),
    };

    (NodeCache as jest.Mock) = jest.fn(() => mockCache);
  });

  it("should return cached data if available", async () => {
    const mockQuery = "example.com";
    const mockData = {
      WhoisRecord: {
        domainName: mockQuery,
        registrarName: "Example Registrar",
        creationDate: "2000-01-01",
        expiryDate: "2025-01-01",
        status: "Active",
      },
    };

    mockCache.get.mockReturnValueOnce(mockData);

    const result = await fetchWhoisData(mockQuery);

    expect(axios.get).not.toHaveBeenCalled();

    expect(result).toEqual(mockData);
  });

  it("should fetch and cache data if not available in cache", async () => {
    const mockQuery = "example.com";
    const mockData = {
      WhoisRecord: {
        domainName: mockQuery,
        registrarName: "Example Registrar",
        creationDate: "2000-01-01",
        expiryDate: "2025-01-01",
        status: "Active",
      },
    };

    mockCache.get.mockReturnValueOnce(null);

    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: mockData,
    });

    const result = await fetchWhoisData(mockQuery);

    expect(axios.get).toHaveBeenCalledWith(
      "https://www.whoisxmlapi.com/whoisserver/WhoisService",
      expect.objectContaining({
        params: {
          apiKey: process.env.WHOIS_API_KEY,
          domainName: mockQuery,
          outputFormat: "JSON",
        },
      })
    );

    expect(mockCache.set).toHaveBeenCalledWith(mockQuery, mockData);

    expect(result).toEqual(mockData);
  });

  it("should handle errors gracefully", async () => {
    const mockQuery = "example.com";

    mockCache.get.mockReturnValueOnce(null);

    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    await expect(fetchWhoisData(mockQuery)).rejects.toThrow("API error");
    expect(axios.get).toHaveBeenCalledWith(
      "https://www.whoisxmlapi.com/whoisserver/WhoisService",
      expect.objectContaining({
        params: {
          apiKey: process.env.WHOIS_API_KEY,
          domainName: mockQuery,
          outputFormat: "JSON",
        },
      })
    );
    expect(mockCache.set).not.toHaveBeenCalled();
  });
});
