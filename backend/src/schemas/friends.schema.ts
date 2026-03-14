import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  body: z.object({
    addresseeId: z.number().int().positive({message: "Addressee ID must be a positive integer"}),
  })
});

export const acceptRequestSchema = z.object({
  body: z.object({
    requesterId: z.number().int().positive({message: "Requester ID must be a positive integer"}),
  })
});

export const deleteRequestSchema = z.object({
  body: z.object({
    targetId: z.number().int().positive({message: "Target ID must be a positive integer"}),
  })
});

export const messageSchema = z.object({
  receiverId: z.number().positive(),
  
  content: z.string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long")
    .trim(),
});

export const getChatHistorySchema = z.object({
  friendId: z.string().regex(/^\d+$/, "Friend ID must be a number").transform(Number)
});