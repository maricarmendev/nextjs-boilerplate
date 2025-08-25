"use client";

import { useState } from "react";
import { PostForm } from "./post-form";
import { PostList } from "./post-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Post {
  id: number;
  title: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PostManagerProps {
  initialPosts: Post[];
}

export function PostManager({ initialPosts }: PostManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {!isCreating && !editingPost && (
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      )}

      {isCreating && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
          <PostForm onCancel={handleCancelCreate} />
        </div>
      )}

      {editingPost && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Edit Post</h2>
          <PostForm post={editingPost} onCancel={handleCancelEdit} />
        </div>
      )}

      <PostList posts={initialPosts} onEdit={handleEdit} />
    </div>
  );
}