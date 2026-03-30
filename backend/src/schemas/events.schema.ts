import { z } from 'zod';

export const CreateExchangeSchema = z.object({
    body: z.object({
        book_title: z.string().min(1, "Title is required").max(255),
        book_author: z.string().min(1, "Author is required").max(255),
        condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Worn']),
        location_city: z.string().min(2, "City is required").max(100),
        description: z.string().max(500).optional(),
        // image_url: z.string().url().optional().or(z.literal('')),
    }),
});

export const RequestSwapSchema = z.object({
  body: z.object({
    listing_id: z.number().positive(),
  }),
});

export const UpdateSwapStatusSchema = z.object({
  body: z.object({
    request_id: z.number().positive(),
    new_status: z.enum(['accepted', 'rejected', 'completed']),
  }),
});

export const CompleteSwapSchema = z.object({
  body: z.object({
    request_id: z.number().positive(),
  }),
});