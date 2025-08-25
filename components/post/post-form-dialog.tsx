"use client";

import { createPost, updatePost, type ActionState } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionState, useState } from "react";
import { Plus, Edit } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Post {
  id: number;
  title: string;
  content: string | null;
  userId: string;
}

interface PostFormDialogProps {
  post?: Post;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function PostFormDialog({ post, trigger, onSuccess }: PostFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prevState: ActionState, formData: FormData) => {
      const result = await (post ? updatePost : createPost)(prevState, formData);
      if (result?.success) {
        setOpen(false);
        onSuccess?.();
      }
      return result;
    },
    null
  );

  // Only show create button if logged in
  if (!session?.user && !post) {
    return (
      <div className="text-muted-foreground">
          Login to create posts
      </div>
    );
  }

  // Only show edit button if user owns the post
  if (post && session?.user && post.userId !== session.user.id) {
    return null;
  }

  const defaultTrigger = (
    <Button className={post ? "h-8 w-8 p-0" : "w-full sm:w-auto"} variant={post ? "ghost" : "default"}>
      {post ? (
        <Edit className="h-4 w-4" />
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Post" : "Create New Post"}</DialogTitle>
        </DialogHeader>
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
              <p className="text-sm text-danger-500">{state.error.title}</p>
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
              <p className="text-sm text-danger-500">{state.error.content}</p>
            )}
          </div>

          {state?.error && typeof state.error === "string" && (
            <p className="text-sm text-danger-500">{state.error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving..." : post ? "Update Post" : "Create Post"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}