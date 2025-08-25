"use client";

import { deletePost } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit } from "lucide-react";
import { useState, useTransition } from "react";

interface Post {
  id: number;
  title: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PostListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
}

export function PostList({ posts, onEdit }: PostListProps) {
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
              <span className="pr-8">{post.title}</span>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(post)}
                  disabled={isPending}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(post.id)}
                  disabled={isPending || deletingId === post.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          {post.content && (
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
              <p className="text-xs text-gray-400 mt-4">
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