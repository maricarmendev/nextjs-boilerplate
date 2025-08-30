"use client";

import { PostListItem } from "./post-list-item";

interface Post {
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
}

interface PostListProps {
  posts: Post[];
  userId?: string;
}

export function PostList({ posts, userId }: PostListProps) {

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
        <PostListItem
          key={post.id}
          post={post}
          canEdit={!!userId && userId === post.userId}
        />
      ))}
    </div>
  );
}