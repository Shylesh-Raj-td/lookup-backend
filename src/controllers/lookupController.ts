import { Request, Response } from "express";
import { AxiosError } from "axios";
import { fetchWhoisData } from "../servcies/whoisService";

export const lookupController = async (req: Request, res: Response) => {
  const { query } = req.body;
  console.log("Request Body inside lookupController:", req.body);

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const data = await fetchWhoisData(query);
    res.json(data);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error(
        "Error fetching data from JsonWhois API:",
        error.response?.data || error.message
      );
    } else {
      console.error("An unexpected error occurred:", error);
    }
    throw error;
  }
};
