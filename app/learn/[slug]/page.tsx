import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllLearnSlugs, getLearnPageBySlug } from '@/lib/learn';
import { breadcrumbSchema, faqSchema } from '@/lib/structured-data';

const BASE_URL = 'https://salaryhog.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllLearnSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLearnPageBySlug(slug);
  if (!page) return {};

  return {
    title: `${page.title} | SalaryHog Learn`,
    description: page.description,
    alternates: { canonical: `${BASE_URL}/learn/${slug}/` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${BASE_URL}/learn/${slug}/`,
      type: 'article',
      images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
    },
  };
}

export default async function LearnArticle({ params }: PageProps) {
  const { slug } = await params;
  const page = getLearnPageBySlug(slug);
  if (!page) notFound();

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Learn', url: `${BASE_URL}/learn` },
    { name: page.title, url: `${BASE_URL}/learn/${slug}` },
  ]);

  // Related pages
  const relatedPages = page.relatedSlugs
    .map(s => getLearnPageBySlug(s))
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .slice(0, 5);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      {page.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(page.faq)) }} />
      )}

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <Link href="/learn" className="hover:text-blue-600">Learn</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">{page.title}</span>
        </nav>

        <article>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{page.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{page.category}</span>
            <span>{page.readingTime} min read</span>
            <span>&middot;</span>
            <span>Updated for 2025</span>
          </div>

          <div
            className="blog-prose max-w-none"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
        </article>

        {/* Calculator CTA */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
          <p className="font-semibold text-gray-900 mb-2">See your actual numbers</p>
          <p className="text-sm text-gray-600 mb-3">Try the free calculator with your salary and state.</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Calculate Take-Home Pay
          </Link>
        </div>

        {/* Related topics */}
        {relatedPages.length > 0 && (
          <section className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Related Topics</h2>
            <div className="space-y-2">
              {relatedPages.map(related => (
                <Link
                  key={related.slug}
                  href={`/learn/${related.slug}`}
                  className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-gray-900 text-sm">{related.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{related.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Nav links */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/learn" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
            &larr; All Guides
          </Link>
          <Link href="/blog" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
            Blog
          </Link>
          <Link href="/married" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
            Married Filing Calculator
          </Link>
        </div>
      </main>
    </>
  );
}
