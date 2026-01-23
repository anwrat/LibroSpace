import { z } from "zod";

export const addToShelfSchema = z.object({
  bookId: z.number().int(),
  shelf: z.enum(["read", "currently_reading", "to_read", "favourites"]),
});

export const updateProgressSchema = z.object({
  bookId: z.number().int(),
  progress: z.number().min(0).max(100),
});
