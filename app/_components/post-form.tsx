"use client";

import { createPost, updatePost, type ActionState } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";

interface PostFormProps {
  post?: {
    id: number;
    title: string;
    content: string | null;
  };
  onCancel?: () => void;
}

export function PostForm({ post, onCancel }: PostFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    post ? updatePost : createPost,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {post && <input type="hidden" name="id" value={post.id} />}
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={post?.title}
          required
          disabled={isPending}
        />
        {state?.error && typeof state.error === "object" && state.error.title && (
          <p className="text-sm text-red-500">{state.error.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={post?.content || ""}
          rows={4}
          disabled={isPending}
        />
        {state?.error && typeof state.error === "object" && state.error.content && (
          <p className="text-sm text-red-500">{state.error.content}</p>
        )}
      </div>

      {state?.error && typeof state.error === "string" && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}