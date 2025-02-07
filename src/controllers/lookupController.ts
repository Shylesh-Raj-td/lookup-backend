import { Request, Response } from "express";
import { fetchWhoisData } from "../servcies/whoisService";

/**
 * Controller function for handling the Whois lookup request.
 *
 * This function is responsible for processing the request body, extracting the query,
 * and fetching the Whois data using the `fetchWhoisData` function.
 * It returns the data in the response or handles errors appropriately.
 *
 * @param {Request} req - The Express request object, containing the query in the request body.
 * @param {Response} res - The Express response object used to send back the result or error.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
export const lookupController = async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const data = await fetchWhoisData(query);
    res.json(data);
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
