import { Metadata } from 'next';
import Link from 'next/link';
import FreelanceCalculator from '@/components/FreelanceCalculator';
import { compare1099vsW2 } from '@/lib/self-employment-tax';
import { faqSchema, breadcrumbSchema } from '@/lib/structured-data';
import statesData from '../../data/states.json';

const BASE_URL = 'https://salaryhog.com';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export const metadata: Metadata = {
  title: '1099 vs W2 Calculator: Freelancer Tax Comparison (2025) | SalaryHog',
  description: 'See how much more tax freelancers and 1099 contractors pay vs W2 employees. Side-by-side comparison with self-employment tax breakdown. Free 2025 calculator.',
  alternates: { canonical: `${BASE_URL}/freelance` },
  openGraph: {
    title: '1099 vs W2 Calculator: Freelancer Tax Comparison | SalaryHog',
    description: 'See how much more tax freelancers pay vs W2 employees. Free 2025 calculator.',
    url: `${BASE_URL}/freelance`,
  },
};

const NO_TAX_STATES = ['TX', 'FL', 'WA', 'TN', 'NV', 'SD', 'WY', 'AK', 'NH'];
const POPULAR_INCOMES = [50000, 75000, 100000, 150000];

const FAQ_ITEMS = [
  {
    question: 'How much more tax do 1099 freelancers pay?',
    answer: 'Freelancers pay self-employment tax of 15.3% (12.4% Social Security + 2.9% Medicare) on net earnings, compared to 7.65% for W2 employees whose employer covers the other half. At $75,000, this typically means $4,000-$5,000 more in taxes depending on your state.',
  },
  {
    question: 'What is self-employment tax?',
    answer: 'Self-employment tax covers Social Security and Medicare contributions. W2 employees split this 50/50 with their employer (each paying 7.65%). Freelancers and 1099 contractors pay both halves — 15.3% total on 92.35% of net self-employment income.',
  },
  {
    question: 'How can freelancers reduce their tax bill?',
    answer: 'Key strategies include: deducting legitimate business expenses (home office, equipment, software), contributing to a Solo 401(k) or SEP-IRA, considering S-Corp election for income over $50-60K, and deducting half of self-employment tax from adjusted gross income (this happens automatically).',
  },
  {
    question: 'What hourly rate should a freelancer charge to match a W2 salary?',
    answer: 'As a rule of thumb, multiply the W2 hourly equivalent by 1.25-1.40 to account for self-employment tax and the lack of employer-paid benefits. For example, a $75,000 W2 salary ($36/hr) would require charging roughly $40-50/hr as a freelancer.',
  },
  {
    question: 'Do freelancers pay quarterly estimated taxes?',
    answer: 'Yes. 1099 workers must pay estimated taxes quarterly (April 15, June 15, September 15, January 15) or face underpayment penalties. Most freelancers should set aside 25-30% of each payment for taxes.',
  },
];

export default function FreelanceLandingPage() {
  // Popular comparison cards
  const popularCards = POPULAR_INCOMES.flatMap(income =>
    ['TX', 'CA', 'NY'].map(sc => {
      const c = compare1099vsW2(income, sc);
      const state = statesData.find(s => s.code === sc)!;
      return {
        income,
        state,
        taxDiff: c.taxDifference,
        equiv: c.freelanceEquivalent,
        href: `/freelance/${income}-in-${state.slug}`,
      };
    })
  );

  const sorted = [...statesData].sort((a, b) => a.name.localeCompare(b.name));

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: '1099 vs W2 Calculator', url: `${BASE_URL}/freelance` },
  ]);

  const faqStructured = faqSchema(FAQ_ITEMS.map(f => ({ question: f.question, answer: f.answer })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructured) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">1099 vs W2 Calculator</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          1099 vs W2: How Much More Tax Do Freelancers Pay?
        </h1>
        <p className="text-gray-600 mb-8">
          See the real difference in take-home pay between W2 employment and freelancing. Based on 2025 tax brackets and self-employment tax rates.
        </p>

        <FreelanceCalculator />

        {/* SE Tax Explained */}
        <section className="mt-10 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">The Self-Employment Tax Explained</h2>
          <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
            <p>
              When you&rsquo;re a W2 employee, your employer pays half of your Social Security and Medicare taxes (7.65%). You pay the other half. As a 1099 freelancer, you pay <strong>both halves &mdash; 15.3% total</strong>.
            </p>
            <p>
              The IRS does give freelancers two breaks: (1) you calculate SE tax on 92.35% of net earnings (not 100%), and (2) you can deduct half of the SE tax from your adjusted gross income, which lowers your income tax slightly.
            </p>
            <p>
              Even with these adjustments, the extra tax adds up fast. At $75K, a freelancer in a no-income-tax state pays roughly $4,000&ndash;$5,000 more per year than a W2 employee at the same income.
            </p>
          </div>
        </section>

        {/* Quarterly taxes */}
        <section className="mt-8 bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Quarterly Estimated Taxes</h2>
          <p className="text-sm text-gray-700 mb-3">
            As a 1099 worker, you must pay estimated taxes four times a year or face underpayment penalties. Set aside 25&ndash;30% of every payment.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Apr 15', 'Jun 15', 'Sep 15', 'Jan 15'].map(d => (
              <div key={d} className="bg-white rounded-lg p-2 text-center border border-amber-100">
                <p className="text-sm font-semibold text-gray-900">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular comparisons */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Popular 1099 vs W2 Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {popularCards.slice(0, 12).map(card => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-gray-900 text-sm">${(card.income / 1000)}K in {card.state.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Freelancer pays {usd(card.taxDiff)} more &middot; Need {usd(card.equiv)} to match
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by state */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by State</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {sorted.map(state => (
              <Link
                key={state.code}
                href={`/freelance/${state.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-blue-300 hover:shadow-sm transition-all text-sm"
              >
                <span className="font-medium text-gray-900">{state.name}</span>
                {NO_TAX_STATES.includes(state.code) && (
                  <span className="ml-1 text-xs text-green-600">No tax</span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="bg-white border border-gray-200 rounded-xl">
                <summary className="px-5 py-4 cursor-pointer font-medium text-gray-900 text-sm">
                  {item.question}
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
