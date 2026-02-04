import { z } from 'zod';

export const CreateCommunitySchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be under 50 characters"),
    description: z.string()
      .min(10, "Description should be at least 10 characters")
      .max(500, "Description is too long"),
  }),
});