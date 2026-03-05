import Link from 'next/link';
import { Metadata } from 'next';
import { getAllPostsEs } from '@/lib/blog-es';

export const metadata: Metadata = {
  title: 'Blog — SalaryHog en Espanol',
  description: 'Articulos sobre sueldos, impuestos y finanzas personales en Estados Unidos. Escrito en espanol.',
  alternates: {
    canonical: 'https://salaryhog.com/es/blog',
    languages: {
      'en': 'https://salaryhog.com/blog',
      'es': 'https://salaryhog.com/es/blog',
      'x-default': 'https://salaryhog.com/blog',
    },
  },
};

export default function SpanishBlogIndex() {
  const posts = getAllPostsEs();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-600 mb-8">Articulos sobre sueldos, impuestos y finanzas personales.</p>

      <div className="space-y-6">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/es/blog/${post.slug}`}
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <h2 className="font-semibold text-gray-900 text-lg mb-2 leading-snug">{post.title}</h2>
            <p className="text-sm text-gray-500 mb-3">{post.excerpt}</p>
            <p className="text-xs text-gray-400">{post.readingTime} min de lectura</p>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-gray-500 text-center py-12">No hay articulos todavia.</p>
      )}
    </main>
  );
}
