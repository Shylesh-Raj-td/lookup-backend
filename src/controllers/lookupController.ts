import { Request, Response } from "express";
import { fetchWhoisData } from "../servcies/whoisService";

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
