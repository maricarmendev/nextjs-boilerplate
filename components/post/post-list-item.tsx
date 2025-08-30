"use client";

import { deletePost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostFormDialog } from "./post-form-dialog";
import { Trash2, User } from "lucide-react";
import { useState, useTransition } from "react";

interface PostListItemProps {
  post: {
    id: number;
    title: string;
    content: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      name: string;
      email: string;
    } | null;
  };
  canEdit: boolean;
}

export function PostListItem({ post, canEdit }: PostListItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    startTransition(async () => {
      await deletePost(post.id);
      setIsDeleting(false);
    });
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div className="flex-1">
            <span className="block">{post.title}</span>
            {post.user?.name && (
              <span className="text-xs text-muted-foreground font-normal flex items-center gap-1 mt-1">
                <User className="h-3 w-3" />
                {post.user.name}
              </span>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <PostFormDialog post={post} />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                disabled={isPending || isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      {post.content && (
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
          <p className="text-xs text-muted-foreground mt-4">
            Created: {new Date(post.createdAt).toLocaleDateString()}
            {post.updatedAt !== post.createdAt && (
              <> • Updated: {new Date(post.updatedAt).toLocaleDateString()}</>
            )}
          </p>
        </CardContent>
      )}
    </Card>
  );
}