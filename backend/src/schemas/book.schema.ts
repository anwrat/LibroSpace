import z from "zod";
import { id } from "zod/locales";

export const getAllBooksPartialDataSchema = z.array(z.object({
    id: z.number().int(),
    title: z.string(),
    author: z.string(),
    cover_url: z.string().url().nullable(), // Nullable in case some books don't have a cover URL
}));

export const BookIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Book ID must be a number").transform(Number)
});

export const createGenreSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Genre name is required").max(100, "Genre name must be less than 100 characters")
  })
});

export const deleteGenreSchema = z.object({
  id: z.string().regex(/^\d+$/, "Genre ID must be a number").transform(Number)
})

export const createBookQuoteSchema = z.object({
  body: z.object({
    book_id: z.number().int(),
    quote: z.string().min(1, "Quote content is required"),
    pageNumber: z.number().int().positive("Page number must be a positive integer")
  })
});

export const deleteBookQuoteSchema = z.object({
  id: z.string().regex(/^\d+$/, "Quote ID must be a number").transform(Number)
});

export const getQuotesByBookIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Book ID must be a number").transform(Number)
})