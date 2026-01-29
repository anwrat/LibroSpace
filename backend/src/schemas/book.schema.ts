import z from "zod";

export const getAllBooksPartialDataSchema = z.array(z.object({
    id: z.number().int(),
    title: z.string(),
    author: z.string(),
    cover_url: z.string().url().nullable(), // Nullable in case some books don't have a cover URL
}));

export const BookIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Book ID must be a number").transform(Number)
});