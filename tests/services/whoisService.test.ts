import axios from "axios";
import NodeCache from "node-cache";
import { fetchWhoisData } from "../../src/servcies/whoisService";

jest.mock("axios");

describe("fetchWhoisData", () => {
  let mockCache: jest.Mocked<NodeCache>;

  beforeEach(() => {
    // Create a mock instance of NodeCache
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      // Add any other methods you expect to use in your tests
      mget: jest.fn(),
      del: jest.fn(),
      flushAll: jest.fn(),
      // You can add any other method or property that you need
    };

    // Mock NodeCache constructor to return the mock instance
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

    // Mock cache to return data for the query
    mockCache.get.mockReturnValueOnce(mockData);

    // Call the function
    const result = await fetchWhoisData(mockQuery);

    // Ensure axios was not called
    expect(axios.get).not.toHaveBeenCalled();

    // Verify cache hit was successful
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

    // Mock cache to return null (cache miss)
    mockCache.get.mockReturnValueOnce(null);

    // Mock axios response
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: mockData,
    });

    // Call the function
    const result = await fetchWhoisData(mockQuery);

    // Ensure axios was called
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

    // Ensure data was cached
    expect(mockCache.set).toHaveBeenCalledWith(mockQuery, mockData);

    // Verify result matches the fetched data
    expect(result).toEqual(mockData);
  });

  it("should handle errors gracefully", async () => {
    const mockQuery = "example.com";

    // Mock cache to return null (cache miss)
    mockCache.get.mockReturnValueOnce(null);

    // Mock axios to throw an error
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    // Call the function and expect it to throw an error
    await expect(fetchWhoisData(mockQuery)).rejects.toThrow("API error");

    // Ensure axios was called
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

    // Ensure cache set was not called on error
    expect(mockCache.set).not.toHaveBeenCalled();
  });
});
