import axios from "axios";
import dotenv from "dotenv";
import NodeCache from "node-cache";

dotenv.config();

const WHOIS_API_URL =
  process.env.WHOIS_API_URL ||
  "https://www.whoisxmlapi.com/whoisserver/WhoisService";
const API_KEY = process.env.WHOIS_API_KEY;
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Fetches Whois data for a given domain query.
 *
 * First checks if the data for the domain is available in cache. If available, it returns the cached data.
 * If not, it makes an API request to fetch the Whois data and stores the result in cache.
 *
 * The function requires an API key in the environment variables to work properly.
 *
 * @param {string} query - The domain name (or IP address) for which to fetch the Whois data.
 * @returns {Promise<any>} - A promise that resolves to the Whois data for the given query, either from cache or the API response.
 * @throws {Error} - Throws an error if the API key is missing, or if the API request fails.
 */

export const fetchWhoisData = async (query: string) => {
  if (!API_KEY) {
    throw new Error("API_KEY is missing in environment variables");
  }

  const cachedData = cache.get(query);

  if (cachedData) {
    return cachedData;
  }
  try {
    const response = await axios.get(WHOIS_API_URL, {
      params: {
        apiKey: process.env.WHOIS_API_KEY,
        domainName: query,
        outputFormat: "JSON",
      },
    });
    cache.set(query, response.data);
    console.log("API response stored in cache:", query);
    return response.data;
  } catch (error) {
    throw new Error("API request failed");
  }
};
