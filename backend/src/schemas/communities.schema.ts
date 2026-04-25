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

export const CommunityIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Community ID must be a number").transform(Number)
});

export const DiscussionIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Discussion ID must be a number").transform(Number)
});

export const CreateDiscussionSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be under 100 characters"),
    content: z.string()
      .min(10, "Content should be at least 10 characters")
      .max(1000, "Content is too long"),
  }),
});

export const AddCommentSchema = z.object({
  body: z.object({
    content: z.string()
      .min(10, "Content should be at least 10 characters")
      .max(1000, "Content is too long"),
  }),
});

export const ChangeMemberRoleSchema = z.object({
  body: z.object({
    member_id: z.number(),
    role: z.enum(['mentor', 'moderator', 'member'], "Role must be one of mentor, moderator, or member"),
  })
});

export const StartNewRoomSchema = z.object({
  body: z.object({
    book_id: z.number(),
  }),
});