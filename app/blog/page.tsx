import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — SalaryHog',
  description: 'Tax tips, salary guides, and take-home pay insights for every worker in America.',
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-600 mb-8">Tax tips, salary guides, and take-home pay insights.</p>

      <div className="space-y-6">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
            <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{post.readingTime} min read</span>
              <span>·</span>
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
