import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBlogSlugs, getPostBySlug } from '@/lib/blog';
import { breadcrumbSchema } from '@/lib/structured-data';
import EmailCapture from '@/components/EmailCapture';

const BASE_URL = 'https://salaryhog.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | SalaryHog`,
    description: post.excerpt,
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${BASE_URL}/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Blog', url: `${BASE_URL}/blog` },
    { name: post.title, url: `${BASE_URL}/blog/${slug}` },
  ]);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: { '@type': 'Organization', name: 'SalaryHog' },
    datePublished: post.date,
    dateModified: post.date,
    publisher: { '@type': 'Organization', name: 'SalaryHog' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{post.title}</span>
        </nav>

        <article>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
            <span>By SalaryHog</span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
            <span>·</span>
            <span>Updated for 2025 Tax Year</span>
          </div>

          <div
            className="blog-prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>

        <div className="mt-10">
          <EmailCapture />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">More from SalaryHog</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Calculate Your Take-Home Pay
            </Link>
            <Link href="/blog" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
              More Articles
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
