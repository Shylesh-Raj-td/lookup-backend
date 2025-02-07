import axios from "axios";
import dotenv from "dotenv";
import NodeCache from "node-cache";

dotenv.config();

const WHOIS_API_URL =
  process.env.WHOIS_API_URL ||
  "https://www.whoisxmlapi.com/whoisserver/WhoisService";
const API_KEY = process.env.WHOIS_API_KEY;
const cache = new NodeCache({ stdTTL: 300 });

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
