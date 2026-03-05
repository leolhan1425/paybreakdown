import Link from 'next/link';
import { calculateTakeHome } from '@/lib/tax-engine';
import { buildSlug } from '@/lib/slug-generator';
import { getAllPosts } from '@/lib/blog';
import HomepageCalculator from '@/components/HomepageCalculator';
import FAQAccordion from '@/components/FAQAccordion';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { faqSchema, webAppSchema, websiteSchema } from '@/lib/structured-data';
import statesData from '../data/states.json';

const NO_TAX_STATES = new Set(['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']);

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

// Popular calculations — link to stateless slug, show TX take-home as preview
const POPULAR_HOURLY = [15, 20, 25, 30, 40, 50];
const POPULAR_ANNUAL = [40000, 50000, 60000, 75000, 100000, 150000];

function getStateTaxBadge(state: typeof statesData[0]) {
  if (!state.hasIncomeTax) return { text: 'No Income Tax', cls: 'bg-green-50 text-green-700 border-green-200' };
  if (state.taxType === 'flat' && state.flatRate) return { text: `Flat ${(state.flatRate * 100).toFixed(1)}%`, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  if (state.taxType === 'progressive' && state.brackets) {
    const b = state.brackets.single;
    const min = (b[0].rate * 100).toFixed(1);
    const max = (b[b.length - 1].rate * 100).toFixed(1);
    return { text: `Progressive ${min}–${max}%`, cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  return { text: 'Income Tax', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
}

const FAQ_ITEMS = [
  {
    question: 'How is take-home pay calculated?',
    answer: 'Your take-home pay is your gross salary minus all tax withholdings. This includes federal income tax (based on IRS tax brackets), Social Security tax (6.2% up to $176,100), Medicare tax (1.45% plus 0.9% on income over $200,000), and state income tax (varies by state). Our calculator applies the 2025 standard deduction before calculating federal income tax.',
  },
  {
    question: 'What taxes are deducted from my paycheck?',
    answer: 'Four main taxes are deducted: federal income tax, Social Security (6.2%), Medicare (1.45%), and state income tax (if your state has one). Nine states — Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming — have no state income tax.',
  },
  {
    question: 'Which states have no income tax?',
    answer: 'Nine states have no state income tax: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. This means residents of these states only pay federal taxes, keeping more of their gross pay.',
  },
  {
    question: 'How accurate is this calculator?',
    answer: 'Our calculator uses 2025 federal and state tax brackets and provides a close estimate of your take-home pay. Actual amounts may vary due to pre-tax deductions (401k, health insurance), local/city taxes, tax credits, and your specific tax situation. For precise calculations, consult a tax professional.',
  },
  {
    question: "What's the difference between gross and net pay?",
    answer: "Gross pay is your total earnings before any deductions. Net pay (take-home pay) is what you actually receive after federal, state, and payroll taxes are withheld. For example, a $50,000 gross salary might result in approximately $39,000–$42,000 in take-home pay depending on your state.",
  },
];

export default function HomePage() {
  const initialResult = calculateTakeHome({ amount: 20, period: 'hourly', stateCode: 'TX', filingStatus: 'single' });

  // Popular cards — preview against Texas
  const hourlyCards = POPULAR_HOURLY.map(amt => ({
    label: `$${amt}/hr`,
    preview: usd(calculateTakeHome({ amount: amt, period: 'hourly', stateCode: 'TX', filingStatus: 'single' }).takeHome.annual),
    href: `/salary/${buildSlug(amt, 'hourly')}`,
  }));
  const annualCards = POPULAR_ANNUAL.map(amt => ({
    label: `$${(amt / 1000).toFixed(0)}K/yr`,
    preview: usd(calculateTakeHome({ amount: amt, period: 'annual', stateCode: 'TX', filingStatus: 'single' }).takeHome.annual),
    href: `/salary/${buildSlug(amt, 'annual')}`,
  }));
  const popularCards = [...hourlyCards, ...annualCards];

  const sortedStates = [...statesData].sort((a, b) => a.name.localeCompare(b.name));

  const faqStructuredItems = FAQ_ITEMS.map(f => ({
    question: f.question,
    answer: typeof f.answer === 'string' ? f.answer : f.question,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqStructuredItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema()) }} />

      {/* Hero */}
      <section className="bg-white py-10 md:py-16 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            How Much Do You Actually Take Home?
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Free salary calculator with federal & state tax breakdowns for all 50 states. Updated for 2025.
          </p>
          <HomepageCalculator initialResult={initialResult} />
        </div>
      </section>

      {/* Popular Calculations */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Salary Calculations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularCards.map(card => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{card.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Take-home ~{card.preview} in TX</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section id="states" className="bg-gray-50 py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by State</h2>
          <p className="text-gray-600 mb-6">Select a state to see salary calculations with state-specific tax rates.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sortedStates.map(state => {
              const badge = getStateTaxBadge(state);
              return (
                <Link
                  key={state.code}
                  href={`/${state.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-gray-900 text-sm mb-1">{state.name}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>
                    {badge.text}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* From the Blog */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">From the Blog</h2>
            <Link href="/blog" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAllPosts().slice(0, 3).map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-snug">{post.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                <p className="text-xs text-gray-400 mt-3">{post.readingTime} min read</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to calculate your take-home pay?</h2>
          <ScrollToTopButton />
        </div>
      </section>
    </>
  );
}
