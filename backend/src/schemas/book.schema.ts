import z from "zod";

export const getAllBooksPartialDataSchema = z.array(z.object({
    id: z.number().int(),
    title: z.string(),
    author: z.string(),
    cover_url: z.string().url().nullable(), // Nullable in case some books don't have a cover URL
}));