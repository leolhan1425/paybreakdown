import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllComparisonSlugs, parseComparisonSlug, getRelatedComparisons } from '@/lib/compare';
import { calculateTakeHome } from '@/lib/tax-engine';
import { breadcrumbSchema } from '@/lib/structured-data';
import { buildSlug } from '@/lib/slug-generator';
import CompareCalculator from '@/components/CompareCalculator';

const BASE_URL = 'https://salaryhog.com';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllComparisonSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseComparisonSlug(slug);
  if (!parsed) return {};

  const { stateA, stateB } = parsed;
  const resultA = calculateTakeHome({ amount: 75000, period: 'annual', stateCode: stateA.code, filingStatus: 'single' });
  const resultB = calculateTakeHome({ amount: 75000, period: 'annual', stateCode: stateB.code, filingStatus: 'single' });
  const diff = Math.abs(resultA.takeHome.annual - resultB.takeHome.annual);

  const title = `${stateA.name} vs ${stateB.name}: Take-Home Pay Comparison | SalaryHog`;
  const description = `Compare take-home pay in ${stateA.name} vs ${stateB.name}. On $75K, the difference is ${usd(diff)}/year. Free 2025 salary comparison calculator.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/compare/${slug}` },
    openGraph: { title, description, url: `${BASE_URL}/compare/${slug}` },
  };
}

const SALARY_LEVELS = [30000, 50000, 75000, 100000, 150000];

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseComparisonSlug(slug);
  if (!parsed) notFound();

  const { stateA, stateB } = parsed;

  const salaryRows = SALARY_LEVELS.map(amount => {
    const rA = calculateTakeHome({ amount, period: 'annual', stateCode: stateA.code, filingStatus: 'single' });
    const rB = calculateTakeHome({ amount, period: 'annual', stateCode: stateB.code, filingStatus: 'single' });
    return { amount, takeHomeA: rA.takeHome.annual, takeHomeB: rB.takeHome.annual, diff: rA.takeHome.annual - rB.takeHome.annual };
  });

  const related = getRelatedComparisons(stateA.slug, 4)
    .filter(s => s !== slug)
    .concat(getRelatedComparisons(stateB.slug, 4).filter(s => s !== slug))
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 6);

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Compare States', url: `${BASE_URL}/compare/${slug}` },
    { name: `${stateA.name} vs ${stateB.name}`, url: `${BASE_URL}/compare/${slug}` },
  ]);

  const noTaxA = !stateA.hasIncomeTax;
  const noTaxB = !stateB.hasIncomeTax;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{stateA.name} vs {stateB.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {stateA.name} vs {stateB.name}: Take-Home Pay Comparison
        </h1>
        <p className="text-gray-600 mb-8">
          See how much more you keep in {stateA.name} compared to {stateB.name} — or vice versa. Enter your salary below.
        </p>

        <CompareCalculator initialStateA={stateA.code} initialStateB={stateB.code} />

        {/* Multi-salary comparison table */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Side-by-Side at Common Salaries</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-4 font-medium">Salary</th>
                  <th className="text-right py-3 px-4 font-medium">{stateA.name}</th>
                  <th className="text-right py-3 px-4 font-medium">{stateB.name}</th>
                  <th className="text-right py-3 px-4 font-medium">Difference</th>
                </tr>
              </thead>
              <tbody>
                {salaryRows.map(row => (
                  <tr key={row.amount} className="border-t border-gray-100">
                    <td className="py-2.5 px-4 font-medium text-gray-900">{usd(row.amount)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-green-700">{usd(row.takeHomeA)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-green-700">{usd(row.takeHomeB)}</td>
                    <td className={`py-2.5 px-4 text-right tabular-nums font-medium ${row.diff > 0 ? 'text-green-600' : row.diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {row.diff > 0 ? '+' : ''}{usd(row.diff)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">Single filer, 2025 tax brackets, standard deduction. Positive difference means {stateA.name} keeps more.</p>
        </section>

        {/* Tax differences explanation */}
        <section className="mt-10 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Tax Differences</h2>
          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <p>
              <strong>{stateA.name}:</strong>{' '}
              {noTaxA
                ? 'No state income tax — you only pay federal taxes and FICA.'
                : stateA.taxType === 'flat' && stateA.flatRate
                ? `Flat ${(stateA.flatRate * 100).toFixed(1)}% state income tax on all earnings.`
                : stateA.taxType === 'progressive' && stateA.brackets
                ? `Progressive state income tax from ${(stateA.brackets.single[0].rate * 100).toFixed(1)}% to ${(stateA.brackets.single[stateA.brackets.single.length - 1].rate * 100).toFixed(1)}%.`
                : 'State income tax applies.'}
            </p>
            <p>
              <strong>{stateB.name}:</strong>{' '}
              {noTaxB
                ? 'No state income tax — you only pay federal taxes and FICA.'
                : stateB.taxType === 'flat' && stateB.flatRate
                ? `Flat ${(stateB.flatRate * 100).toFixed(1)}% state income tax on all earnings.`
                : stateB.taxType === 'progressive' && stateB.brackets
                ? `Progressive state income tax from ${(stateB.brackets.single[0].rate * 100).toFixed(1)}% to ${(stateB.brackets.single[stateB.brackets.single.length - 1].rate * 100).toFixed(1)}%.`
                : 'State income tax applies.'}
            </p>
          </div>
        </section>

        {/* Links to individual state pages */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Each State</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href={`/${stateA.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-900">{stateA.name} Salary Calculator</p>
              <p className="text-sm text-gray-500 mt-1">See all salary breakdowns for {stateA.name}</p>
            </Link>
            <Link href={`/${stateB.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-900">{stateB.name} Salary Calculator</p>
              <p className="text-sm text-gray-500 mt-1">See all salary breakdowns for {stateB.name}</p>
            </Link>
          </div>
        </section>

        {/* Related comparisons */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">More Comparisons</h2>
            <div className="flex flex-wrap gap-3">
              {related.map(s => {
                const p = parseComparisonSlug(s);
                if (!p) return null;
                return (
                  <Link key={s} href={`/compare/${s}`} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all">
                    {p.stateA.name} vs {p.stateB.name}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
