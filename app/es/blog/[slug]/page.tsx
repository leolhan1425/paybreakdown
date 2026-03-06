import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBlogSlugsEs, getPostBySlugEs } from '@/lib/blog-es';
import { breadcrumbSchema } from '@/lib/structured-data';

const BASE_URL = 'https://salaryhog.com';

// Map Spanish blog slugs to English equivalents for hreflang
const BLOG_HREFLANG: Record<string, string> = {
  'estados-sin-impuesto-sobre-la-renta': 'no-income-tax-states',
  '20-dolares-la-hora': '20-an-hour',
  'salario-vs-por-hora': 'salary-vs-hourly',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugsEs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlugEs(slug);
  if (!post) return {};

  const canonical = `${BASE_URL}/es/blog/${slug}`;
  const englishSlug = BLOG_HREFLANG[slug];

  return {
    title: `${post.title} | SalaryHog`,
    description: post.excerpt,
    alternates: {
      canonical,
      languages: englishSlug ? {
        'en': `${BASE_URL}/blog/${englishSlug}`,
        'es': canonical,
        'x-default': `${BASE_URL}/blog/${englishSlug}`,
      } : {
        'es': canonical,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonical,
      type: 'article',
      images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
    },
  };
}

export default async function SpanishBlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlugEs(slug);
  if (!post) notFound();

  const crumbSchema = breadcrumbSchema([
    { name: 'Inicio', url: `${BASE_URL}/es` },
    { name: 'Blog', url: `${BASE_URL}/es/blog` },
    { name: post.title, url: `${BASE_URL}/es/blog/${slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          dateModified: post.date,
          author: { '@type': 'Organization', name: 'SalaryHog' },
          publisher: { '@type': 'Organization', name: 'SalaryHog' },
          inLanguage: 'es',
        }),
      }} />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
          <Link href="/es" className="hover:text-blue-600">Inicio</Link>
          <span className="text-gray-300">&rsaquo;</span>
          <Link href="/es/blog" className="hover:text-blue-600">Blog</Link>
          <span className="text-gray-300">&rsaquo;</span>
          <span className="text-gray-800 font-medium truncate">{post.title}</span>
        </nav>

        <article>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-8">
            <span>Por SalaryHog</span>
            <span className="text-gray-300">&middot;</span>
            <span>{post.readingTime} min de lectura</span>
            <span className="text-gray-300">&middot;</span>
            <span>Actualizada para el ano fiscal 2025</span>
          </div>
          <div
            className="blog-prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4">
            <Link href="/es" className="text-sm text-blue-600 hover:underline font-medium">
              &larr; Calculadora de Sueldo
            </Link>
            <Link href="/es/blog" className="text-sm text-blue-600 hover:underline font-medium">
              Mas Articulos
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
