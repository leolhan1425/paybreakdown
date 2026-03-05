import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllRelocationSlugs, parseRelocationSlug, getRelatedRelocations, buildRelocationSlug } from '@/lib/relocation-slugs';
import { calculateEquivalentSalary, getAllMetros } from '@/lib/cost-of-living';
import { calculateTakeHome } from '@/lib/tax-engine';
import { breadcrumbSchema, faqSchema } from '@/lib/structured-data';
import RelocationCalculator from '@/components/RelocationCalculator';
import statesData from '@/data/states.json';

const BASE_URL = 'https://salaryhog.com';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllRelocationSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseRelocationSlug(slug);
  if (!parsed) return {};

  const { from, to } = parsed;
  const result = calculateEquivalentSalary(75000, from, to);
  const colDir = result.colPercentDifference > 0 ? 'higher' : 'lower';
  const colPct = Math.abs(result.colPercentDifference).toFixed(0);

  const title = `${from.name} to ${to.name}: Salary Comparison & Cost of Living 2025 | SalaryHog`;
  const description = `Moving from ${from.name} to ${to.name}? Cost of living is ${colPct}% ${colDir}. See what salary you need. Free 2025 calculator.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/relocate/${slug}` },
    openGraph: { title, description, url: `${BASE_URL}/relocate/${slug}` },
  };
}

const SALARY_LEVELS = [40000, 50000, 60000, 75000, 100000, 150000];

function getStateTaxDescription(stateCode: string): string {
  const state = statesData.find((s: { code: string }) => s.code === stateCode);
  if (!state) return '';
  if (!state.hasIncomeTax) return `${state.name} has no state income tax`;
  if (state.taxType === 'flat' && state.flatRate) return `${state.name} has a flat ${(state.flatRate * 100).toFixed(1)}% state income tax`;
  if (state.taxType === 'progressive' && state.brackets) {
    const b = (state.brackets as { single: { rate: number }[] }).single;
    return `${state.name} has a progressive state income tax from ${(b[0].rate * 100).toFixed(1)}% to ${(b[b.length - 1].rate * 100).toFixed(1)}%`;
  }
  return `${state.name} has a state income tax`;
}

export default async function RelocationPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseRelocationSlug(slug);
  if (!parsed) notFound();

  const { from, to } = parsed;
  const allMetros = getAllMetros();
  const metroOptions = allMetros.map(m => ({
    slug: m.slug, name: m.name, fullName: m.fullName, stateCode: m.stateCode,
    rpp: m.rpp, rppHousing: m.rppHousing, averageRent1BR: m.averageRent1BR,
    medianHomePrice: m.medianHomePrice, lat: m.lat, lng: m.lng,
  }));

  const baseResult = calculateEquivalentSalary(75000, from, to);
  const colDir = baseResult.colPercentDifference > 0 ? 'higher' : 'lower';
  const colPct = Math.abs(baseResult.colPercentDifference).toFixed(1);
  const housingDir = baseResult.housingPercentDifference > 0 ? 'more expensive' : 'cheaper';
  const housingPct = Math.abs(baseResult.housingPercentDifference).toFixed(0);

  // Salary equivalency table
  const salaryRows = SALARY_LEVELS.map(amount => {
    const r = calculateEquivalentSalary(amount, from, to);
    return {
      amount,
      equivalent: r.equivalentSalary,
      diff: r.equivalentSalary - amount,
      takeHome: r.equivalentTakeHome.takeHome.annual,
    };
  });

  // Related comparisons
  const relatedFrom = getRelatedRelocations(from.slug, 'from', 5).filter(s => s !== slug);
  const relatedTo = getRelatedRelocations(to.slug, 'to', 5).filter(s => s !== slug);

  const fromStateName = statesData.find((s: { code: string }) => s.code === from.stateCode)?.name || from.stateCode;
  const toStateName = statesData.find((s: { code: string }) => s.code === to.stateCode)?.name || to.stateCode;

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Relocate', url: `${BASE_URL}/relocate` },
    { name: `${from.name} to ${to.name}`, url: `${BASE_URL}/relocate/${slug}` },
  ]);

  const faqs = faqSchema([
    {
      question: `What salary do I need in ${to.name} to match $75,000 in ${from.name}?`,
      answer: `To maintain the same standard of living, you would need approximately ${usd(baseResult.equivalentSalary)} in ${to.name} to match a $75,000 salary in ${from.name}. ${to.name}'s cost of living is ${colPct}% ${colDir}, primarily driven by housing costs. ${getStateTaxDescription(from.stateCode)}, while ${getStateTaxDescription(to.stateCode).toLowerCase()}.`,
    },
    {
      question: `Is ${to.name} more expensive than ${from.name}?`,
      answer: `${baseResult.colPercentDifference > 0 ? `Yes, ${to.name} is approximately ${colPct}% more expensive than ${from.name} overall.` : `No, ${to.name} is approximately ${colPct}% cheaper than ${from.name} overall.`} Housing costs are ${housingPct}% ${housingDir} in ${to.name}. Average 1-bedroom rent: ${usd(to.averageRent1BR)}/month in ${to.name} vs ${usd(from.averageRent1BR)}/month in ${from.name}.`,
    },
    {
      question: `How much does it cost to move from ${from.name} to ${to.name}?`,
      answer: `Moving from ${from.name} to ${to.name} (approximately ${Math.round(baseResult.movingCost.mid / 500) * 500 > 1000 ? Math.round(haversine(from, to)).toLocaleString() : 'a short'} miles) typically costs ${usd(baseResult.movingCost.low)}\u2013${usd(baseResult.movingCost.high)} depending on whether you choose DIY, container, or full-service movers for a 2-bedroom household.`,
    },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqs) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <Link href="/relocate" className="hover:text-blue-600">Relocate</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">{from.name} to {to.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Moving from {from.name} to {to.name}?
        </h1>
        <p className="text-gray-600 mb-8">
          Here&apos;s what you&apos;d need to earn to maintain your lifestyle.
        </p>

        <RelocationCalculator
          metros={metroOptions}
          initialFrom={from.slug}
          initialTo={to.slug}
        />

        {/* Salary equivalency table at multiple levels */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Salary Equivalents: {from.name} to {to.name}</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-4 font-medium">Your {from.name} Salary</th>
                  <th className="text-right py-3 px-4 font-medium">{to.name} Equivalent</th>
                  <th className="text-right py-3 px-4 font-medium">Difference</th>
                  <th className="text-right py-3 px-4 font-medium">{to.name} Take-Home</th>
                </tr>
              </thead>
              <tbody>
                {salaryRows.map(row => (
                  <tr key={row.amount} className="border-t border-gray-100">
                    <td className="py-2.5 px-4 font-medium text-gray-900">
                      <Link href={`/salary/${row.amount >= 1000 ? row.amount : row.amount}-a-year-in-${from.state}`} className="hover:text-blue-600">
                        {usd(row.amount)}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{usd(row.equivalent)}</td>
                    <td className={`py-2.5 px-4 text-right tabular-nums font-medium ${row.diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {row.diff > 0 ? '+' : ''}{usd(row.diff)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-green-700">{usd(row.takeHome)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">Single filer, 2025 tax brackets, standard deduction. Equivalents based on BEA Regional Price Parities.</p>
        </section>

        {/* Cost comparison section */}
        <section className="mt-10 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How {from.name} and {to.name} Compare</h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Housing ({housingPct}% {housingDir} in {to.name})</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                The average 1-bedroom apartment in {to.name} rents for {usd(to.averageRent1BR)}/month compared to {usd(from.averageRent1BR)}/month in {from.name}.
                Median home prices: {usd(to.medianHomePrice)} in {to.name} vs {usd(from.medianHomePrice)} in {from.name}.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Taxes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {getStateTaxDescription(from.stateCode)}. {getStateTaxDescription(to.stateCode)}.
                {baseResult.taxDifference !== 0 && (
                  <> On a $75,000 salary, moving to {to.name} would {baseResult.taxDifference > 0 ? 'save' : 'cost'} you about {usd(Math.abs(baseResult.taxDifference))}/year in taxes alone.</>
                )}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Overall Cost of Living</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {to.name}&apos;s overall cost of living is {colPct}% {colDir} than {from.name}, based on the BEA Regional Price Parity index (where 100 = national average).
                {from.name}: {from.rpp.toFixed(1)}, {to.name}: {to.rpp.toFixed(1)}.
              </p>
            </div>
          </div>
        </section>

        {/* Monetization block */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mt-10">
          <h2 className="font-bold text-gray-900 mb-4">Plan Your Move</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-semibold text-gray-900 text-sm mb-2">Get Free Moving Quotes</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Compare rates from licensed movers for your {from.name} to {to.name} move. Average cost: {usd(baseResult.movingCost.low)}&ndash;{usd(baseResult.movingCost.high)}.
              </p>
              <span className="text-xs text-blue-600 font-medium">Compare Moving Quotes &rarr;</span>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-semibold text-gray-900 text-sm mb-2">Find Apartments in {to.name}</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Average 1BR rent in {to.name}: {usd(to.averageRent1BR)}/month. Browse available listings.
              </p>
              <span className="text-xs text-blue-600 font-medium">Search Apartments &rarr;</span>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-semibold text-gray-900 text-sm mb-2">High-Yield Savings</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Park your moving fund in a 4.5%+ APY savings account while you plan your relocation.
              </p>
              <span className="text-xs text-blue-600 font-medium">Compare Savings Rates &rarr;</span>
            </div>
          </div>
        </div>

        {/* Related comparisons */}
        {(relatedFrom.length > 0 || relatedTo.length > 0) && (
          <section className="mt-10">
            {relatedFrom.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">More Comparisons from {from.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedFrom.map(s => {
                    const p = parseRelocationSlug(s);
                    if (!p) return null;
                    return (
                      <Link key={s} href={`/relocate/${s}`} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all">
                        {p.from.name} &rarr; {p.to.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {relatedTo.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">More Comparisons to {to.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedTo.map(s => {
                    const p = parseRelocationSlug(s);
                    if (!p) return null;
                    return (
                      <Link key={s} href={`/relocate/${s}`} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all">
                        {p.from.name} &rarr; {p.to.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Cross-links to salary/state pages */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Full Tax Breakdowns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href={`/${from.state}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-900">{fromStateName} Salary Calculator</p>
              <p className="text-sm text-gray-500 mt-1">See all salary breakdowns for {fromStateName}</p>
            </Link>
            <Link href={`/${to.state}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-900">{toStateName} Salary Calculator</p>
              <p className="text-sm text-gray-500 mt-1">See all salary breakdowns for {toStateName}</p>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

// Inline haversine for FAQ distance text
function haversine(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const R = 3959;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
