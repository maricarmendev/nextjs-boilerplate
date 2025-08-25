import { getPosts } from "@/app/actions/posts";
import { PostManager } from "@/app/_components/post-manager";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Posts CRUD with Next.js 15</h1>
      <PostManager initialPosts={posts} />
    </div>
  );
}