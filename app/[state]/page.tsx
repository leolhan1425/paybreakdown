import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllStateSlugs, getStateBySlug, buildSlug } from '@/lib/slug-generator';
import { calculateTakeHome } from '@/lib/tax-engine';
import { breadcrumbSchema } from '@/lib/structured-data';
import StatePageClient from '@/components/StatePageClient';
import statesData from '../../data/states.json';

interface PageProps {
  params: Promise<{ state: string }>;
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export async function generateStaticParams() {
  return getAllStateSlugs().map(state => ({ state }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) return {};
  const noTax = !state.hasIncomeTax;
  return {
    title: `${state.name} Salary Calculator — Take-Home Pay 2025`,
    description: `Calculate your take-home pay in ${state.name}. ${noTax ? 'No state income tax. ' : ''}Free 2025 calculator with federal tax breakdown for any salary.`,
    alternates: { canonical: `https://paybreakdown.com/${stateSlug}` },
    openGraph: {
      url: `https://paybreakdown.com/${stateSlug}`,
      images: [{ url: 'https://paybreakdown.com/og-image.svg', width: 1200, height: 630 }],
    },
  };
}

function getStateSummary(state: typeof statesData[0]): string {
  if (!state.hasIncomeTax) {
    return `${state.name} has no state income tax, meaning your only payroll deductions are federal income tax, Social Security (6.2%), and Medicare (1.45%). This makes ${state.name} one of the most tax-friendly states for workers.`;
  }
  if (state.taxType === 'flat' && state.flatRate) {
    return `${state.name} has a flat state income tax rate of ${(state.flatRate * 100).toFixed(1)}% applied to all income. In addition to federal taxes and FICA, every dollar you earn in ${state.name} is taxed at the same rate.`;
  }
  if (state.taxType === 'progressive' && state.brackets) {
    const b = state.brackets.single;
    const minRate = (b[0].rate * 100).toFixed(1);
    const maxRate = (b[b.length - 1].rate * 100).toFixed(1);
    return `${state.name} uses a progressive income tax system with rates from ${minRate}% to ${maxRate}% for single filers. Higher earners pay a larger percentage of their income in state taxes.`;
  }
  return '';
}

function getTaxBadge(state: typeof statesData[0]) {
  if (!state.hasIncomeTax) return { text: 'No State Income Tax', cls: 'bg-green-50 text-green-700 border-green-200' };
  if (state.taxType === 'flat' && state.flatRate) return { text: `Flat Tax: ${(state.flatRate * 100).toFixed(1)}%`, cls: 'bg-gray-100 text-gray-700 border-gray-200' };
  if (state.taxType === 'progressive' && state.brackets) {
    const b = state.brackets.single;
    const min = (b[0].rate * 100).toFixed(1);
    const max = (b[b.length - 1].rate * 100).toFixed(1);
    return { text: `Progressive Tax: ${min}%–${max}%`, cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  return { text: 'Income Tax', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
}

const HOURLY_TABLE = [10, 12, 15, 17, 20, 22, 25, 30, 35, 40, 50];
const ANNUAL_TABLE = [30000, 40000, 50000, 60000, 75000, 80000, 90000, 100000, 120000, 150000];
const COMPARISON_STATES = ['TX', 'CA', 'NY', 'FL', 'WA'];
const POPULAR_STATES = ['CA', 'TX', 'NY', 'FL', 'WA', 'IL', 'CO', 'AZ'];

export default async function StatePage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) notFound();

  const initialResult = calculateTakeHome({ amount: 20, period: 'hourly', stateCode: state.code, filingStatus: 'single' });

  const hourlyRows = HOURLY_TABLE.map(amt => ({
    amount: amt,
    result: calculateTakeHome({ amount: amt, period: 'hourly', stateCode: state.code, filingStatus: 'single' }),
  }));

  const annualRows = ANNUAL_TABLE.map(amt => ({
    amount: amt,
    result: calculateTakeHome({ amount: amt, period: 'annual', stateCode: state.code, filingStatus: 'single' }),
  }));

  // Comparison at $60K
  const compCodes = COMPARISON_STATES.filter(c => c !== state.code).slice(0, 4);
  const compStates = compCodes.map(c => statesData.find(s => s.code === c)!).filter(Boolean);
  const compRows = [
    { name: state.name, slug: state.slug, takeHome: calculateTakeHome({ amount: 60000, period: 'annual', stateCode: state.code, filingStatus: 'single' }).takeHome.annual, isCurrent: true },
    ...compStates.map(s => ({
      name: s.name, slug: s.slug,
      takeHome: calculateTakeHome({ amount: 60000, period: 'annual', stateCode: s.code, filingStatus: 'single' }).takeHome.annual,
      isCurrent: false,
    })),
  ].sort((a, b) => b.takeHome - a.takeHome);
  const maxTakeHome = compRows[0].takeHome;

  // Related states
  const relatedStates = POPULAR_STATES
    .filter(c => c !== state.code)
    .slice(0, 6)
    .map(c => statesData.find(s => s.code === c)!)
    .filter(Boolean);

  const badge = getTaxBadge(state);
  const summary = getStateSummary(state);
  const baseUrl = 'https://paybreakdown.com';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', url: baseUrl },
            { name: `${state.name} Salary Calculator`, url: `${baseUrl}/${stateSlug}` },
          ])),
        }}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {state.name} Salary &amp; Take-Home Pay Calculator
            </h1>
            <span className={`text-sm px-3 py-1 rounded-full border font-medium ${badge.cls}`}>
              {badge.text}
            </span>
          </div>
          <p className="text-gray-600 max-w-2xl">{summary}</p>
        </div>

        {/* Interactive calculator */}
        <StatePageClient
          stateCode={state.code}
          stateName={state.name}
          stateSlug={stateSlug}
          initialResult={initialResult}
        />

        {/* Common salaries tables */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Common Salaries in {state.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hourly table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="font-semibold text-gray-900 px-4 py-3 border-b border-gray-100 bg-gray-50">Hourly Wages</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-4 py-2 font-medium">Rate</th>
                    <th className="text-right px-4 py-2 font-medium">Annual Gross</th>
                    <th className="text-right px-4 py-2 font-medium">Take-Home</th>
                    <th className="text-right px-4 py-2 font-medium">Eff. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyRows.map(({ amount, result }, i) => (
                    <tr key={amount} className={`border-t border-gray-50 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                      <td className="px-4 py-2">
                        <Link href={`/salary/${buildSlug(amount, 'hourly', stateSlug)}`} className="text-blue-600 hover:underline font-medium">
                          ${amount}/hr
                        </Link>
                      </td>
                      <td className="text-right px-4 py-2 tabular-nums text-gray-600">{usd(result.gross.annual)}</td>
                      <td className="text-right px-4 py-2 tabular-nums text-green-700 font-medium">{usd(result.takeHome.annual)}</td>
                      <td className="text-right px-4 py-2 tabular-nums text-gray-500">{pct(result.effectiveRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Annual table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="font-semibold text-gray-900 px-4 py-3 border-b border-gray-100 bg-gray-50">Annual Salaries</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-4 py-2 font-medium">Salary</th>
                    <th className="text-right px-4 py-2 font-medium">Monthly</th>
                    <th className="text-right px-4 py-2 font-medium">Annual Take-Home</th>
                    <th className="text-right px-4 py-2 font-medium">Eff. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {annualRows.map(({ amount, result }, i) => (
                    <tr key={amount} className={`border-t border-gray-50 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                      <td className="px-4 py-2">
                        <Link href={`/salary/${buildSlug(amount, 'annual', stateSlug)}`} className="text-blue-600 hover:underline font-medium">
                          {usd(amount)}
                        </Link>
                      </td>
                      <td className="text-right px-4 py-2 tabular-nums text-gray-600">{usd(result.takeHome.monthly)}</td>
                      <td className="text-right px-4 py-2 tabular-nums text-green-700 font-medium">{usd(result.takeHome.annual)}</td>
                      <td className="text-right px-4 py-2 tabular-nums text-gray-500">{pct(result.effectiveRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How taxes work */}
        <section className="mt-10 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How {state.name} Taxes Work</h2>
          {!state.hasIncomeTax ? (
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>{state.name} is one of nine states with no state income tax. Residents only pay federal taxes: federal income tax (based on IRS brackets), Social Security (6.2%), and Medicare (1.45%).</p>
              <p>Compared to California — where top earners pay 13.3% state tax — living in {state.name} can mean thousands more in take-home pay each year. On a $75,000 salary, the difference can be over $3,000 annually.</p>
            </div>
          ) : state.taxType === 'flat' && state.flatRate ? (
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>{state.name} uses a flat income tax rate of <strong>{(state.flatRate * 100).toFixed(1)}%</strong> on all taxable income. Unlike progressive states, every dollar is taxed at the same rate regardless of your income level.</p>
              <p>On top of this, all residents pay federal income tax, Social Security (6.2%), and Medicare (1.45%).</p>
            </div>
          ) : state.taxType === 'progressive' && state.brackets ? (
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>{state.name} uses progressive tax brackets — higher earners pay a higher marginal rate. Here are the {state.name} income tax brackets for single filers:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden mt-2">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Income Range</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.brackets.single.map((b, i) => (
                      <tr key={i} className={`border-t ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                        <td className="px-4 py-2 text-gray-700">
                          {usd(b.min)}{b.max ? ` – ${usd(b.max)}` : '+'}
                        </td>
                        <td className="text-right px-4 py-2 font-medium text-blue-700">{(b.rate * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500">Rates shown are marginal — you only pay each rate on the portion of income within that bracket. Social Security (6.2%) and Medicare (1.45%) apply in addition to these rates.</p>
            </div>
          ) : null}
        </section>

        {/* State comparison at $60K */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compare {state.name} to Other States</h2>
          <p className="text-gray-600 text-sm mb-4">Take-home pay on a $60,000 salary (single filer, 2025)</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            {compRows.map(row => (
              <div key={row.slug}>
                <div className="flex justify-between text-sm mb-1">
                  <Link
                    href={`/${row.slug}`}
                    className={`font-medium ${row.isCurrent ? 'text-blue-700' : 'text-gray-700 hover:text-blue-600'}`}
                  >
                    {row.name} {row.isCurrent && '(current)'}
                  </Link>
                  <span className="tabular-nums text-gray-800 font-medium">{usd(row.takeHome)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.isCurrent ? 'bg-blue-500' : 'bg-green-400'}`}
                    style={{ width: `${(row.takeHome / maxTakeHome) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related states */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Compare with Other States</h2>
          <div className="flex flex-wrap gap-3">
            {relatedStates.map(s => (
              <Link
                key={s.code}
                href={`/${s.slug}`}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {s.name} →
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
