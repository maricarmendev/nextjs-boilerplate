"use client";

import { createPost, updatePost } from "@/lib/actions/posts";
import type { ActionResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Plus, Edit } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface Post {
  id: number;
  title: string;
  content: string | null;
  userId: string;
}

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormDialogProps {
  post?: Post;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function PostFormDialog({ post, trigger, onSuccess }: PostFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
    },
  });

  const onSubmit = async (data: PostFormData) => {
    setError("");
    
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content || "");
    if (post) {
      formData.append("id", post.id.toString());
    }

    try {
      const result = await (post ? updatePost : createPost)(formData);
      if (result.success) {
        setOpen(false);
        onSuccess?.();
        form.reset();
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter post title"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content..."
                      rows={4}
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                {form.formState.isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}