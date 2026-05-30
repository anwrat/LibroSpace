import type { Request, Response } from "express";
import { getGreeting, getResponse } from "../../utils/ollama.js";

export const getCharacterGreeting = async (req: Request, res: Response) => {
  try {
    const { book, author } = req.body;
    const greeting = await getGreeting(book, author);
    return res.status(200).json({ greeting });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Internal Server Error while getting greeting" });
  }
};

export const getCharacterResponse = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const response = await getResponse(prompt);
    return res.status(200).json({ response });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error while getting response" });
  }
};
