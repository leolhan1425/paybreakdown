import { Metadata } from 'next';
import Link from 'next/link';
import AffordCalculator from '@/components/AffordCalculator';
import { calculateAffordability, getAllMetros } from '@/lib/rent-affordability';
import { faqSchema, breadcrumbSchema } from '@/lib/structured-data';

const BASE_URL = 'https://salaryhog.com';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export const metadata: Metadata = {
  title: 'Rent Affordability Calculator: How Much Rent Can You Afford? | SalaryHog',
  description: 'Find out how much rent you can afford based on your real take-home pay, not gross income. 50 US cities with actual rent data. Free 2025 calculator.',
  alternates: { canonical: `${BASE_URL}/afford` },
  openGraph: {
    title: 'How Much Rent Can You Afford? | SalaryHog',
    description: 'Find out based on your real take-home pay. 50 US cities.',
    url: `${BASE_URL}/afford`,
  },
};

const FAQ_ITEMS = [
  {
    question: 'How much of my income should I spend on rent?',
    answer: 'The widely recommended guideline is to spend no more than 30% of your take-home pay (after taxes) on rent. Under 25% is considered comfortable, 30-35% is tight, and over 35% puts financial strain on your other expenses and savings.',
  },
  {
    question: 'Should I use gross or net income for the 30% rule?',
    answer: "It's more practical to use net (take-home) income rather than gross. Your gross salary includes money you never see — federal taxes, state taxes, Social Security, and Medicare. Using take-home pay gives you a realistic picture of what you can actually afford.",
  },
  {
    question: 'What if I can\'t find rent under 30% of my income?',
    answer: 'Consider getting a roommate (can cut housing costs 30-50%), looking at slightly farther neighborhoods with lower rents, or negotiating your salary. In expensive cities like NYC or SF, many residents spend 35-45% on housing — it\'s common but means tight budgets elsewhere.',
  },
  {
    question: 'Does location affect how much rent I can afford?',
    answer: 'Yes, significantly. The same salary yields different take-home pay depending on state taxes. A $60,000 salary in Texas (no state tax) gives you about $200/month more take-home than in California, directly increasing how much rent you can afford.',
  },
];

export default function AffordLandingPage() {
  const allMetros = getAllMetros();
  const top50 = allMetros.slice(0, 50);
  const metroOptions = top50.map(m => ({ slug: m.slug, name: m.name, fullName: m.fullName, stateCode: m.stateCode }));

  // Most/least affordable for $50K
  const affordAt50K = top50.map(m => {
    const result = calculateAffordability(50000, m.stateCode, m);
    return { metro: m, pct: result.affordability.oneBed.percentOfIncome, verdict: result.affordability.oneBed.verdict, maxRent: result.maxRent30, rent: m.rent.oneBed };
  });

  const mostAffordable = [...affordAt50K].sort((a, b) => a.pct - b.pct).slice(0, 8);
  const leastAffordable = [...affordAt50K].sort((a, b) => b.pct - a.pct).slice(0, 8);

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Rent Affordability', url: `${BASE_URL}/afford` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQ_ITEMS.map(f => ({ question: f.question, answer: f.answer })))) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">Rent Affordability</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          How Much Rent Can You Afford?
        </h1>
        <p className="text-gray-600 mb-8">
          Based on your real take-home pay after taxes, not gross income. Enter your salary and city below.
        </p>

        <AffordCalculator metros={metroOptions} />

        {/* Most affordable cities */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Most Affordable Cities for a 1BR on $50K</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mostAffordable.map(item => (
              <Link
                key={item.metro.slug}
                href={`/afford/50000-in-${item.metro.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-gray-900 text-sm">{item.metro.fullName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  1BR: {usd(item.rent)} &middot; {item.pct}% of income &middot; Max: {usd(item.maxRent)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Most expensive cities */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hardest Cities to Afford on $50K</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {leastAffordable.map(item => (
              <Link
                key={item.metro.slug}
                href={`/afford/50000-in-${item.metro.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-gray-900 text-sm">{item.metro.fullName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  1BR: {usd(item.rent)} &middot; {item.pct}% of income
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by city */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by City</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {top50.sort((a, b) => a.name.localeCompare(b.name)).map(m => (
              <Link
                key={m.slug}
                href={`/afford/${m.slug}`}
                className="bg-white border border-gray-200 rounded-lg p-2.5 hover:border-blue-300 hover:shadow-sm transition-all text-sm"
              >
                <span className="font-medium text-gray-900">{m.name}</span>
                <span className="text-xs text-gray-400 ml-1">{m.stateCode}</span>
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
