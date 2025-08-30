"use server";

import { prisma } from "@/lib/db";
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ActionResponse } from "@/types";

export async function createPost(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: {
        message: "You must be logged in to create posts",
      },
    };
  }

  const validatedFields = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: {
        message: "Validation failed",
        details: validatedFields.error.flatten().fieldErrors,
      },
    };
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        userId: session.user.id,
      },
      select: { id: true },
    });

    revalidatePath("/");
    return { 
      success: true,
      data: { id: newPost.id }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to create post",
      },
    };
  }
}

export async function updatePost(formData: FormData): Promise<ActionResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: {
        message: "You must be logged in to update posts",
      },
    };
  }

  const validatedFields = updatePostSchema.safeParse({
    id: Number(formData.get("id")),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: {
        message: "Validation failed",
        details: validatedFields.error.flatten().fieldErrors,
      },
    };
  }

  try {
    // Only update if the post belongs to the current user
    await prisma.post.updateMany({
      where: {
        id: validatedFields.data.id,
        userId: session.user.id,
      },
      data: {
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to update post",
      },
    };
  }
}

export async function deletePost(id: number): Promise<ActionResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: {
        message: "You must be logged in to delete posts",
      },
    };
  }

  try {
    // Only delete if the post belongs to the current user
    await prisma.post.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Failed to delete post",
      },
    };
  }
}

export async function getPosts() {
  try {
    const allPosts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return allPosts;
  } catch (error) {
    console.error("Failed to fetch posts:", error instanceof Error ? error.message : "Failed to fetch posts");
    return [];
  }
}