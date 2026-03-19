import Link from 'next/link';
import { calculateTakeHome } from '@/lib/tax-engine';
import { buildSlug } from '@/lib/slug-generator';
import { getAllPosts } from '@/lib/blog';
import HomepageCalculator from '@/components/HomepageCalculator';
import FAQAccordion from '@/components/FAQAccordion';
import EmailCapture from '@/components/EmailCapture';
import ProductCTA from '@/components/ProductCTA';
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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 py-12 md:py-20 border-b border-gray-200/50">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-blue-600 mb-3 tracking-wide uppercase">Free 2025 Calculator</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            How Much Do You <span className="text-gradient">Actually</span> Take Home?
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto">
            Federal &amp; state tax breakdowns for all 50 states. Enter your salary and see exactly what hits your bank account.
          </p>
          <HomepageCalculator initialResult={initialResult} />
        </div>
      </section>

      {/* Email Capture — below calculator */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <EmailCapture
            headline="We're building more tools"
            subtext="Cost-of-living comparisons, relocation calculators, and freelance tax breakdowns are coming. Get notified."
            source="homepage"
          />
        </div>
      </section>

      {/* Product CTA */}
      <section className="py-6">
        <div className="max-w-2xl mx-auto px-4">
          <ProductCTA />
        </div>
      </section>

      {/* Popular Calculations */}
      <section className="py-14 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Popular Salary Calculations</h2>
          <p className="text-sm text-gray-500 mb-6">Take-home estimates for Texas (no state tax). Click to see your state.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {popularCards.map(card => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white border border-gray-200 rounded-xl p-4 card-hover group"
              >
                <p className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">{card.label}</p>
                <p className="text-sm text-green-600 font-medium mt-1">{card.preview}</p>
                <p className="text-xs text-gray-400 mt-0.5">take-home in TX</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section id="states" className="bg-gradient-to-b from-gray-50 to-white py-14 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Browse by State</h2>
          <p className="text-gray-500 text-sm mb-6">Select a state to see salary calculations with state-specific tax rates.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sortedStates.map(state => {
              const badge = getStateTaxBadge(state);
              return (
                <Link
                  key={state.code}
                  href={`/${state.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-3 card-hover"
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

      {/* Relocating? */}
      <section className="py-14 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thinking About Relocating?</h2>
              <p className="text-gray-500 text-sm mt-1">See what salary you&apos;d need in a new city to maintain your lifestyle.</p>
            </div>
            <Link href="/relocate" className="text-sm text-blue-600 hover:text-blue-800 font-medium hidden sm:block">Calculator &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'NYC \u2192 Miami', href: '/relocate/new-york-ny-to-miami-fl', desc: 'Cost of living 10% lower' },
              { label: 'SF \u2192 Austin', href: '/relocate/san-francisco-ca-to-austin-tx', desc: 'Cost of living 16% lower' },
              { label: 'Chicago \u2192 Nashville', href: '/relocate/chicago-il-to-nashville-tn', desc: 'Cost of living 6% lower' },
              { label: 'LA \u2192 Phoenix', href: '/relocate/los-angeles-ca-to-phoenix-az', desc: 'Cost of living 14% lower' },
            ].map(card => (
              <Link key={card.href} href={card.href} className="bg-white border border-gray-200 rounded-xl p-4 card-hover group">
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{card.label}</p>
                <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* From the Blog */}
      <section className="py-14 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">From the Blog</h2>
            <Link href="/blog" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAllPosts().slice(0, 3).map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-5 card-hover group"
              >
                <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-snug group-hover:text-blue-600 transition-colors">{post.title}</h3>
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

      {/* Spanish CTA */}
      <section className="py-6">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Link href="/es" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            Hablas espanol? <span className="text-blue-600 font-medium">Calculadora en espanol &rarr;</span>
          </Link>
        </div>
      </section>

      {/* What's Next */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Explore More Tools</h2>
          <p className="text-sm text-gray-500 text-center mb-8">Every angle on your paycheck, from relocation to filing status.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/married"
              className="bg-white border border-gray-200 rounded-xl p-6 card-hover text-center group"
            >
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              </div>
              <p className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Married Filing</p>
              <p className="text-xs text-gray-500">Joint vs separate</p>
            </Link>
            <Link
              href="/afford"
              className="bg-white border border-gray-200 rounded-xl p-6 card-hover text-center group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
              </div>
              <p className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Budget Your Pay</p>
              <p className="text-xs text-gray-500">Rent affordability</p>
            </Link>
            <Link
              href="/compare/texas-vs-california"
              className="bg-white border border-gray-200 rounded-xl p-6 card-hover text-center group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
              </div>
              <p className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Compare States</p>
              <p className="text-xs text-gray-500">Side by side</p>
            </Link>
            <Link
              href="/freelance"
              className="bg-white border border-gray-200 rounded-xl p-6 card-hover text-center group"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>
              </div>
              <p className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">1099 vs W-2</p>
              <p className="text-xs text-gray-500">Freelance comparison</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
