"use server";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string | { [key: string]: string[] };
  success?: boolean;
} | null;

export async function createPost(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await db.insert(posts).values({
      title: validatedFields.data.title,
      content: validatedFields.data.content,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      error: "Failed to create post",
    };
  }
}

export async function updatePost(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = updatePostSchema.safeParse({
    id: Number(formData.get("id")),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await db
      .update(posts)
      .set({
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, validatedFields.data.id));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      error: "Failed to update post",
    };
  }
}

export async function deletePost(id: number) {
  try {
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      error: "Failed to delete post",
    };
  }
}

export async function getPosts() {
  try {
    const allPosts = await db.select().from(posts).orderBy(posts.createdAt);
    return allPosts;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}