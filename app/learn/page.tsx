import { Metadata } from 'next';
import Link from 'next/link';
import { getLearnPagesByCategory } from '@/lib/learn';
import { breadcrumbSchema } from '@/lib/structured-data';

const BASE_URL = 'https://salaryhog.com';

export const metadata: Metadata = {
  title: 'Learn — Tax & Salary Guides | SalaryHog',
  description: 'Plain-English guides to taxes, deductions, take-home pay, and salary topics. Learn how your paycheck works with real examples and numbers.',
  alternates: { canonical: `${BASE_URL}/learn/` },
  openGraph: {
    title: 'Learn — Tax & Salary Guides | SalaryHog',
    description: 'Plain-English guides to taxes, deductions, and take-home pay.',
    url: `${BASE_URL}/learn/`,
    images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
  },
};

const CATEGORY_ORDER = [
  'Tax Basics',
  'Paycheck & Deductions',
  'Filing Status',
  'State Taxes',
  'Self-Employment',
  'Salary & Compensation',
  'Retirement & Benefits',
  'Life Events',
];

export default function LearnIndexPage() {
  const categorized = getLearnPagesByCategory();
  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Learn', url: `${BASE_URL}/learn` },
  ]);

  // Sort categories by predefined order, put any extras at the end
  const sortedCategories = Object.keys(categorized).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const totalPages = Object.values(categorized).reduce((sum, pages) => sum + pages.length, 0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">Learn</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Tax &amp; Salary Guides
          </h1>
          <p className="text-gray-600 max-w-2xl">
            {totalPages} plain-English guides covering everything from tax brackets to FICA to filing status. Real numbers, real examples, no jargon.
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-10">
          {sortedCategories.map(category => (
            <section key={category}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categorized[category].map(page => (
                  <Link
                    key={page.slug}
                    href={`/learn/${page.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                  >
                    <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{page.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{page.readingTime} min read</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <section className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-4">Ready to see your actual numbers?</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Calculate Your Take-Home Pay
          </Link>
        </section>
      </main>
    </>
  );
}
