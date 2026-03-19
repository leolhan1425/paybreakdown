import { Metadata } from 'next';
import Link from 'next/link';
import products from '@/data/products.json';
import EmailCapture from '@/components/EmailCapture';
import { breadcrumbSchema } from '@/lib/structured-data';

const BASE_URL = 'https://salaryhog.com';

export const metadata: Metadata = {
  title: 'Shop — Spreadsheets & Tools | SalaryHog',
  description: 'Budget planners, tax calculators, and relocation workbooks built by the SalaryHog team. Practical spreadsheet tools to manage your money.',
  alternates: { canonical: `${BASE_URL}/shop/` },
  openGraph: {
    title: 'Shop — Spreadsheets & Tools | SalaryHog',
    description: 'Budget planners, tax calculators, and relocation workbooks.',
    url: `${BASE_URL}/shop/`,
    images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
  },
};

export default function ShopPage() {
  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Shop', url: `${BASE_URL}/shop` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">Shop</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Tools That Work With Your Paycheck
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Spreadsheets and references designed around real take-home pay data. Built by the same team behind the calculator.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col hover:border-blue-300 hover:shadow-sm transition-all relative"
            >
              {product.badge && (
                <span className="absolute -top-2.5 left-4 bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {product.badge}
                </span>
              )}
              <h2 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h2>
              <p className="text-2xl font-bold text-blue-600 mb-3">{product.price}</p>
              <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>
              <ul className="space-y-1.5 mb-5">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get It &mdash; {product.price}
              </a>
            </div>
          ))}
        </div>

        {/* Trust block */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-10 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Why Buy From SalaryHog?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 mt-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Built on Real Data</p>
              <p>Same 2025 tax data that powers our calculators. Not generic templates.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Instant Access</p>
              <p>Download immediately after purchase. Google Sheets or PDF, ready to use.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Free Updates</p>
              <p>When tax rates change, you get the updated version at no extra cost.</p>
            </div>
          </div>
        </div>

        {/* Email Capture */}
        <EmailCapture
          headline="Want to be first to know about new tools?"
          subtext="We're building more calculators and spreadsheets. Drop your email to get early access."
          source="shop-page"
        />

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            &larr; Back to Calculator
          </Link>
        </div>
      </main>
    </>
  );
}
