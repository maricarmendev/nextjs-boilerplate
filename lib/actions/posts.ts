"use server";

import { db } from "@/lib/db";
import { posts, user } from "@/lib/db/schema";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type ActionState = {
  error?: string | { [key: string]: string[] };
  success?: boolean;
} | null;

export async function createPost(formData: FormData): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      error: "You must be logged in to create posts",
    };
  }

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
      userId: session.user.id,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      error: "Failed to create post",
    };
  }
}

export async function updatePost(formData: FormData): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      error: "You must be logged in to update posts",
    };
  }

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
    // Only update if the post belongs to the current user
    const result = await db
      .update(posts)
      .set({
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        updatedAt: new Date(),
      })
      .where(and(
        eq(posts.id, validatedFields.data.id),
        eq(posts.userId, session.user.id)
      ));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      error: "Failed to update post",
    };
  }
}

export async function deletePost(id: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      error: "You must be logged in to delete posts",
    };
  }

  try {
    // Only delete if the post belongs to the current user
    await db.delete(posts).where(and(
      eq(posts.id, id),
      eq(posts.userId, session.user.id)
    ));
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
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        userId: posts.userId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(posts)
      .leftJoin(user, eq(posts.userId, user.id))
      .orderBy(posts.createdAt);
    return allPosts;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}