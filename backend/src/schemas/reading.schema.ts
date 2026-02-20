import { z } from 'zod';

export const StartSessionSchema = z.object({
  body: z.object({
    book_id: z.number({message: "Book ID is required" }).int().positive(),
    start_page: z.number().int().min(0, "Start page cannot be negative"),
  }),
});

export const UpdateNotesSchema = z.object({
  body: z.object({
    session_id: z.number({ message: "Session ID is required" }).int().positive(),
    notes: z.string().optional().default(""), 
  }),
});

export const EndSessionSchema = z.object({
  body: z.object({
    session_id: z.number({ message: "Session ID is required" }).int().positive(),
    book_id: z.number({ message: "Book ID is required" }).int().positive(),
    end_page: z.number().int().positive("End page must be greater than 0"),
    notes: z.string().optional(),
  })
});