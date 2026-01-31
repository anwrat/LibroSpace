import { z } from 'zod';

export const addresseeIdSchema = z.object({
  body: z.object({
    addresseeId: z.number().int().positive({message: "Addressee ID must be a positive integer"}),
  })
});