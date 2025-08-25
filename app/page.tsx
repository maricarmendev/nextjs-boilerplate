import { getPosts } from "@/lib/actions/posts";
import { PostFormDialog } from "@/components/post/post-form-dialog";
import { PostList } from "@/components/post/post-list";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Posts CRUD with Next.js 15</h1>
      <div className="space-y-6">
        <PostFormDialog />
        <PostList posts={posts} />
      </div>
    </div>
  );
}