"use client";

import { deletePost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostFormDialog } from "./post-form-dialog";
import { Trash2, User } from "lucide-react";
import { useState, useTransition } from "react";
import { useSession } from "@/lib/auth-client";

interface Post {
  id: number;
  title: string;
  content: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
}

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setDeletingId(id);
    startTransition(async () => {
      await deletePost(id);
      setDeletingId(null);
    });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No posts yet. Create your first post!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="relative">
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <div className="flex-1">
                <span className="block">{post.title}</span>
                {post.userName && (
                  <span className="text-xs text-muted-foreground font-normal flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    {post.userName}
                  </span>
                )}
              </div>
              {session?.user && session.user.id === post.userId && (
                <div className="flex gap-2">
                  <PostFormDialog post={post} />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(post.id)}
                    disabled={isPending || deletingId === post.id}
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
      ))}
    </div>
  );
}