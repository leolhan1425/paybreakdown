import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllFreelanceSlugs, parseFreelanceSlug, INCOME_LEVELS } from '@/lib/freelance-slugs';
import { compare1099vsW2, calculate1099Tax } from '@/lib/self-employment-tax';
import { calculateTakeHome } from '@/lib/tax-engine';
import { breadcrumbSchema, faqSchema } from '@/lib/structured-data';
import FreelanceCalculator from '@/components/FreelanceCalculator';
import statesData from '../../../data/states.json';

const BASE_URL = 'https://salaryhog.com';
const NO_TAX_STATES = new Set(['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']);

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllFreelanceSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseFreelanceSlug(slug);
  if (!parsed) return {};

  if (parsed.type === 'income-state' && parsed.income) {
    const c = compare1099vsW2(parsed.income, parsed.state.code);
    const incomeStr = `$${(parsed.income / 1000).toFixed(0)}K`;
    const title = `1099 vs W2 at ${incomeStr} in ${parsed.state.name} (2025) | SalaryHog`;
    const description = `Freelancers earning ${incomeStr} in ${parsed.state.name} pay ${usd(c.taxDifference)} more in taxes than W2 employees. Full breakdown with self-employment tax.`;
    return {
      title,
      description,
      alternates: { canonical: `${BASE_URL}/freelance/${slug}` },
      openGraph: { title, description, url: `${BASE_URL}/freelance/${slug}` },
    };
  }

  const title = `Freelancer Taxes in ${parsed.state.name}: 1099 vs W2 (2025) | SalaryHog`;
  const description = `Compare 1099 vs W2 taxes in ${parsed.state.name} at every income level. See self-employment tax and what freelancers need to charge.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/freelance/${slug}` },
    openGraph: { title, description, url: `${BASE_URL}/freelance/${slug}` },
  };
}

export default async function FreelancePage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseFreelanceSlug(slug);
  if (!parsed) notFound();

  if (parsed.type === 'income-state' && parsed.income) {
    return <IncomeStatePage income={parsed.income} state={parsed.state} slug={slug} />;
  }

  return <StateOnlyPage state={parsed.state} slug={slug} />;
}

// --- Income × State Page ---
function IncomeStatePage({ income, state, slug }: { income: number; state: typeof statesData[0]; slug: string }) {
  const comparison = compare1099vsW2(income, state.code);
  const { w2, freelance } = comparison;
  const incomeStr = `$${income.toLocaleString()}`;

  // Comparison table across states
  const compareStates = ['TX', 'CA', 'NY', 'FL', 'WA', 'IL'].filter(c => c !== state.code).slice(0, 4);
  const stateComparisons = [state.code, ...compareStates].map(sc => {
    const c = compare1099vsW2(income, sc);
    const s = statesData.find(st => st.code === sc)!;
    return { code: sc, name: s.name, slug: s.slug, ...c };
  });

  // Freelance equivalents at multiple levels
  const equivLevels = [50000, 75000, 100000, 150000].map(inc => {
    const c = compare1099vsW2(inc, state.code);
    return { income: inc, equiv: c.freelanceEquivalent, hourly: c.freelanceEquivalentHourly };
  });

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: '1099 vs W2', url: `${BASE_URL}/freelance` },
    { name: `${incomeStr} in ${state.name}`, url: `${BASE_URL}/freelance/${slug}` },
  ]);

  const faqItems = [
    {
      question: `How much more tax do freelancers pay on ${incomeStr} in ${state.name}?`,
      answer: `A 1099 freelancer earning ${incomeStr} in ${state.name} pays approximately ${usd(comparison.taxDifference)} more in taxes than a W2 employee at the same income — ${usd(freelance.totalTax)} total vs ${usd(w2.totalTax)}. The extra cost comes primarily from self-employment tax of ${usd(freelance.totalSelfEmploymentTax)}.`,
    },
    {
      question: `What hourly rate should a freelancer charge to match a ${incomeStr} salary in ${state.name}?`,
      answer: `To take home the same amount as a ${incomeStr} W2 employee in ${state.name}, a freelancer would need to charge approximately ${usd(comparison.freelanceEquivalent)}/year, or about ${usd(comparison.freelanceEquivalentHourly)}/hour.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqItems)) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <Link href="/freelance" className="hover:text-blue-600">1099 vs W2</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">{incomeStr} in {state.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          1099 vs W2 at {incomeStr} in {state.name}
        </h1>
        <p className="text-gray-600 mb-8">
          A freelancer earning {incomeStr} in {state.name} pays {usd(comparison.taxDifference)} more in taxes than a W2 employee &mdash; {usd(freelance.totalTax)} total vs {usd(w2.totalTax)}. That&rsquo;s {usd(Math.round(comparison.takeHomeDifference / 12))}/month less in your pocket.
        </p>

        <FreelanceCalculator initialIncome={income} initialState={state.code} />

        {/* To match W2 take-home */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">To Match Your W2 Take-Home</h2>
          <p className="text-sm text-gray-600 mb-4">
            If you&rsquo;re leaving a {incomeStr} W2 job to freelance in {state.name}, here&rsquo;s what you&rsquo;d need to charge:
          </p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-4 font-medium">W2 Salary</th>
                  <th className="text-right py-3 px-4 font-medium">Freelance Equivalent</th>
                  <th className="text-right py-3 px-4 font-medium">Hourly Rate</th>
                </tr>
              </thead>
              <tbody>
                {equivLevels.map(row => (
                  <tr key={row.income} className="border-t border-gray-100">
                    <td className="py-2.5 px-4 font-medium text-gray-900">{usd(row.income)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{usd(row.equiv)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{usd(row.hourly)}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How to reduce tax */}
        <section className="mt-10 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">How to Reduce Your 1099 Tax Bill</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-1">1. Deduct Business Expenses</p>
              <p>Every legitimate expense (home office, internet, software, equipment, mileage) reduces your taxable income. $10,000 in deductions saves roughly $2,500&ndash;$3,500 in taxes.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">2. Open a Solo 401(k) or SEP-IRA</p>
              <p>You can contribute up to $23,500 (employee portion) plus 25% of net earnings to a Solo 401(k), directly reducing your taxable income.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">3. Consider S-Corp Election</p>
              <p>If you consistently earn over $50&ndash;60K freelancing, an S-Corp can save thousands by splitting income between &ldquo;salary&rdquo; (subject to SE tax) and &ldquo;distributions&rdquo; (not subject to SE tax). Consult a CPA.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">4. Pay Quarterly Estimated Taxes</p>
              <p>Due dates: April 15, June 15, September 15, January 15. Set aside 25&ndash;30% of every payment to avoid underpayment penalties.</p>
            </div>
          </div>
        </section>

        {/* How state compares */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How {state.name} Compares for Freelancers</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-4 font-medium">State</th>
                  <th className="text-right py-3 px-4 font-medium">1099 Tax</th>
                  <th className="text-right py-3 px-4 font-medium">Take-Home</th>
                  <th className="text-right py-3 px-4 font-medium">vs {state.name}</th>
                </tr>
              </thead>
              <tbody>
                {stateComparisons.map((sc, i) => {
                  const diff = sc.freelance.takeHomePay - stateComparisons[0].freelance.takeHomePay;
                  return (
                    <tr key={sc.code} className={`border-t border-gray-100 ${i === 0 ? 'bg-blue-50' : ''}`}>
                      <td className="py-2.5 px-4 font-medium text-gray-900">
                        <Link href={`/freelance/${income}-in-${sc.slug}`} className="hover:text-blue-600">
                          {sc.name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-red-600">{usd(sc.freelance.totalTax)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-green-700">{usd(sc.freelance.takeHomePay)}</td>
                      <td className={`py-2.5 px-4 text-right tabular-nums ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {i === 0 ? '—' : diff > 0 ? `+${usd(diff)}` : usd(diff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {NO_TAX_STATES.has(state.code) && (
            <p className="text-xs text-green-700 mt-2">
              {state.name} has no state income tax, making it especially attractive for freelancers who already pay the self-employment tax hit.
            </p>
          )}
        </section>

        {/* Cross-links */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href={`/salary/${income}-a-year-in-${state.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-900 text-sm">W2 Salary: {incomeStr} in {state.name}</p>
              <p className="text-xs text-gray-500 mt-1">Full tax breakdown for W2 employees</p>
            </Link>
            <Link href={`/freelance/${state.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-900 text-sm">All Income Levels in {state.name}</p>
              <p className="text-xs text-gray-500 mt-1">1099 vs W2 at every income level</p>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

// --- State-Only Page ---
function StateOnlyPage({ state, slug }: { state: typeof statesData[0]; slug: string }) {
  const rows = INCOME_LEVELS.map(income => {
    const c = compare1099vsW2(income, state.code);
    return {
      income,
      w2TakeHome: c.w2.takeHome.annual,
      freelanceTakeHome: c.freelance.takeHomePay,
      taxDiff: c.taxDifference,
      freelanceEquiv: c.freelanceEquivalent,
      freelanceHourly: c.freelanceEquivalentHourly,
      effectiveW2: c.w2.effectiveRate,
      effectiveFreelance: c.freelance.effectiveRate,
    };
  });

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: '1099 vs W2', url: `${BASE_URL}/freelance` },
    { name: state.name, url: `${BASE_URL}/freelance/${slug}` },
  ]);

  const faqItems = [
    {
      question: `How much more do freelancers pay in taxes in ${state.name}?`,
      answer: `At $75,000, a freelancer in ${state.name} pays approximately ${usd(rows.find(r => r.income === 75000)?.taxDiff || 0)} more than a W2 employee. The difference is almost entirely self-employment tax (15.3% on 92.35% of net earnings).`,
    },
    {
      question: `Is ${state.name} a good state for freelancers?`,
      answer: NO_TAX_STATES.has(state.code)
        ? `Yes. ${state.name} has no state income tax, which means freelancers only face federal income tax and self-employment tax. This makes it one of the most tax-friendly states for independent contractors.`
        : `${state.name} has state income tax, which adds to the already-higher self-employment tax burden. Freelancers in ${state.name} should consider maximizing deductions and retirement contributions to reduce their tax bill.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqItems)) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <Link href="/freelance" className="hover:text-blue-600">1099 vs W2</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">{state.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Freelancer Taxes in {state.name}: 1099 vs W2
        </h1>
        <p className="text-gray-600 mb-8">
          Compare 1099 vs W2 taxes in {state.name} at every income level. See self-employment tax, take-home pay, and the freelance rate you&rsquo;d need to charge.
        </p>

        <FreelanceCalculator initialIncome={75000} initialState={state.code} />

        {/* All income levels table */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1099 vs W2 at Every Income Level</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-3 font-medium">Income</th>
                  <th className="text-right py-3 px-3 font-medium">W2 Take-Home</th>
                  <th className="text-right py-3 px-3 font-medium">1099 Take-Home</th>
                  <th className="text-right py-3 px-3 font-medium">Extra Tax</th>
                  <th className="text-right py-3 px-3 font-medium hidden sm:table-cell">Need to Charge</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.income} className="border-t border-gray-100">
                    <td className="py-2.5 px-3 font-medium text-gray-900">
                      <Link href={`/freelance/${row.income}-in-${slug}`} className="hover:text-blue-600">
                        {usd(row.income)}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-green-700">{usd(row.w2TakeHome)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-green-700">{usd(row.freelanceTakeHome)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-red-600">+{usd(row.taxDiff)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-800 hidden sm:table-cell">{usd(row.freelanceEquiv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">Single filer, no business expenses, 2025 tax brackets.</p>
        </section>

        {/* Browse other states */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Compare Other States</h2>
          <div className="flex flex-wrap gap-2">
            {statesData
              .filter(s => s.code !== state.code)
              .sort((a, b) => a.name.localeCompare(b.name))
              .slice(0, 15)
              .map(s => (
                <Link key={s.code} href={`/freelance/${s.slug}`} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:border-blue-300 transition-all">
                  {s.name}
                </Link>
              ))}
          </div>
        </section>

        {/* Cross-link to state hub */}
        <section className="mt-10">
          <Link href={`/${state.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all block">
            <p className="font-semibold text-gray-900 text-sm">{state.name} Salary Calculator</p>
            <p className="text-xs text-gray-500 mt-1">See W2 salary breakdowns for all income levels in {state.name}</p>
          </Link>
        </section>
      </main>
    </>
  );
}
