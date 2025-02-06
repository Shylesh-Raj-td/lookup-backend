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
  const cachedData = cache.get(query);

  if (cachedData) {
    return cachedData;
  }

  const response = await axios.get(WHOIS_API_URL, {
    params: {
      apiKey: API_KEY,
      domainName: query,
      outputFormat: "JSON",
    },
  });

  cache.set(query, response.data);
  console.log("API response stored in cache:", query);
  return response.data;
};
