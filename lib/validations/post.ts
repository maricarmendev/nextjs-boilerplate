import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().optional(),
});

export const updatePostSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;