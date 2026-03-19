import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllMarriedSlugs, parseMarriedSlug, buildMarriedSlug, getSalaryPairs } from '@/lib/married-slugs';
import { calculateMarriedFiling } from '@/lib/married-tax';
import { getStateBySlug, getAllStates } from '@/lib/state-taxes';
import { breadcrumbSchema, faqSchema } from '@/lib/structured-data';
import MarriedCalculator from '@/components/MarriedCalculator';
import ProductCTA from '@/components/ProductCTA';

const BASE_URL = 'https://salaryhog.com';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllMarriedSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseMarriedSlug(slug);
  if (!parsed) return {};

  const state = getStateBySlug(parsed.stateSlug);
  if (!state) return {};

  const s1 = usd(parsed.salary1);
  const s2 = usd(parsed.salary2);

  return {
    title: `${s1} + ${s2} Married Filing in ${state.name} — Joint vs Separate 2025 | SalaryHog`,
    description: `Compare take-home pay for a ${s1} + ${s2} married couple in ${state.name}. See if filing jointly or separately saves more with 2025 tax brackets.`,
    alternates: { canonical: `${BASE_URL}/married/${slug}/` },
    openGraph: {
      title: `${s1} + ${s2} Married Filing in ${state.name}`,
      description: `Joint vs separate take-home pay comparison for ${state.name}.`,
      url: `${BASE_URL}/married/${slug}/`,
      images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
    },
  };
}

export default async function MarriedSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseMarriedSlug(slug);
  if (!parsed) notFound();

  const state = getStateBySlug(parsed.stateSlug);
  if (!state) notFound();

  const { salary1, salary2 } = parsed;
  const result = calculateMarriedFiling(salary1, salary2, state.code);

  // Related scenarios: same state, different salary pairs
  const allPairs = getSalaryPairs();
  const relatedPairs = allPairs
    .filter(([s1, s2]) => !(s1 === salary1 && s2 === salary2))
    .slice(0, 6);

  // Related states: same salary pair, different states
  const allStates = getAllStates();
  const popularStateCodes = ['TX', 'CA', 'NY', 'FL', 'WA', 'IL'];
  const relatedStates = popularStateCodes
    .filter(c => c !== state.code)
    .slice(0, 5)
    .map(c => allStates.find(s => s.code === c)!)
    .filter(Boolean);

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Married Filing Calculator', url: `${BASE_URL}/married` },
    { name: `${usd(salary1)} + ${usd(salary2)} in ${state.name}`, url: `${BASE_URL}/married/${slug}` },
  ]);

  const faqItems = [
    {
      question: `Should a ${usd(salary1)} + ${usd(salary2)} couple file jointly in ${state.name}?`,
      answer: result.betterOption === 'joint'
        ? `Yes. A married couple earning ${usd(salary1)} and ${usd(salary2)} in ${state.name} saves ${usd(result.savings)} per year by filing jointly. Their combined take-home is ${usd(result.joint.takeHome)} joint vs ${usd(result.separate.combinedTakeHome)} separate.`
        : result.betterOption === 'separate'
        ? `In this specific case, filing separately saves ${usd(Math.abs(result.savings))} per year. Combined take-home is ${usd(result.separate.combinedTakeHome)} separate vs ${usd(result.joint.takeHome)} joint.`
        : `Both options result in the same take-home pay of ${usd(result.joint.takeHome)} for this income combination in ${state.name}.`,
    },
    {
      question: `What's the effective tax rate for this couple in ${state.name}?`,
      answer: `Filing jointly, the effective tax rate is ${pct(result.joint.effectiveRate)} on ${usd(result.joint.combinedGross)} combined income. Filing separately, the combined effective rate is ${pct(result.separate.combinedEffectiveRate)}.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqItems)) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <Link href="/married" className="hover:text-blue-600">Married Filing</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">{usd(salary1)} + {usd(salary2)} in {state.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {usd(salary1)} + {usd(salary2)} Married Filing in {state.name}
          </h1>
          <p className="text-gray-600">
            Joint vs separate take-home pay comparison for a dual-income household earning {usd(result.joint.combinedGross)} total in {state.name}. 2025 tax year.
          </p>
        </div>

        {/* Summary */}
        <div className={`rounded-xl border-2 p-5 text-center mb-8 ${
          result.betterOption === 'joint'
            ? 'border-green-300 bg-green-50'
            : result.betterOption === 'separate'
            ? 'border-amber-300 bg-amber-50'
            : 'border-gray-200 bg-gray-50'
        }`}>
          {result.betterOption === 'joint' ? (
            <>
              <p className="text-xl font-bold text-green-800">Filing Jointly saves {usd(result.savings)}/year</p>
              <p className="text-sm text-green-700 mt-1">
                Take-home: {usd(result.joint.takeHome)} joint vs {usd(result.separate.combinedTakeHome)} separate
              </p>
            </>
          ) : result.betterOption === 'separate' ? (
            <>
              <p className="text-xl font-bold text-amber-800">Filing Separately saves {usd(Math.abs(result.savings))}/year</p>
              <p className="text-sm text-amber-700 mt-1">
                Take-home: {usd(result.separate.combinedTakeHome)} separate vs {usd(result.joint.takeHome)} joint
              </p>
            </>
          ) : (
            <p className="text-xl font-bold text-gray-800">Both options give the same take-home pay: {usd(result.joint.takeHome)}</p>
          )}
        </div>

        {/* Detailed comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Joint card */}
          <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${result.betterOption === 'joint' ? 'border-green-300' : 'border-gray-200'}`}>
            <div className={`px-4 py-3 border-b ${result.betterOption === 'joint' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
              <h2 className="font-semibold text-gray-900">Married Filing Jointly</h2>
              {result.betterOption === 'joint' && (
                <span className="text-xs text-green-700 font-medium">Recommended</span>
              )}
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Combined Gross</span><span className="font-medium tabular-nums">{usd(result.joint.combinedGross)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Federal Income Tax</span><span className="tabular-nums text-red-600">-{usd(result.joint.federalIncomeTax)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Social Security</span><span className="tabular-nums text-red-600">-{usd(result.joint.person1FICA.ss + result.joint.person2FICA.ss)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Medicare</span><span className="tabular-nums text-red-600">-{usd(result.joint.person1FICA.medicare + result.joint.person2FICA.medicare)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">State Tax ({state.name})</span><span className="tabular-nums text-red-600">-{usd(result.joint.stateIncomeTax)}</span></div>
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between font-bold"><span>Total Tax</span><span className="tabular-nums text-red-700">{usd(result.joint.totalTax)}</span></div>
                <div className="flex justify-between font-bold mt-1"><span>Take-Home Pay</span><span className="tabular-nums text-green-700">{usd(result.joint.takeHome)}</span></div>
                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Monthly Take-Home</span><span className="tabular-nums">{usd(result.joint.takeHome / 12)}</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>Effective Rate</span><span className="tabular-nums">{pct(result.joint.effectiveRate)}</span></div>
              </div>
            </div>
          </div>

          {/* Separate card */}
          <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${result.betterOption === 'separate' ? 'border-amber-300' : 'border-gray-200'}`}>
            <div className={`px-4 py-3 border-b ${result.betterOption === 'separate' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
              <h2 className="font-semibold text-gray-900">Married Filing Separately</h2>
              {result.betterOption === 'separate' && (
                <span className="text-xs text-amber-700 font-medium">Recommended</span>
              )}
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Combined Gross</span><span className="font-medium tabular-nums">{usd(result.separate.combinedGross)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Spouse 1 Federal Tax</span><span className="tabular-nums text-red-600">-{usd(result.separate.person1.federalIncomeTax)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Spouse 2 Federal Tax</span><span className="tabular-nums text-red-600">-{usd(result.separate.person2.federalIncomeTax)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">FICA (both)</span><span className="tabular-nums text-red-600">-{usd(
                result.separate.person1.socialSecurity + result.separate.person1.medicare +
                result.separate.person2.socialSecurity + result.separate.person2.medicare
              )}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">State Tax (both)</span><span className="tabular-nums text-red-600">-{usd(result.separate.person1.stateIncomeTax + result.separate.person2.stateIncomeTax)}</span></div>
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between font-bold"><span>Total Tax</span><span className="tabular-nums text-red-700">{usd(result.separate.combinedTax)}</span></div>
                <div className="flex justify-between font-bold mt-1"><span>Combined Take-Home</span><span className="tabular-nums text-green-700">{usd(result.separate.combinedTakeHome)}</span></div>
                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Monthly Take-Home</span><span className="tabular-nums">{usd(result.separate.combinedTakeHome / 12)}</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>Effective Rate</span><span className="tabular-nums">{pct(result.separate.combinedEffectiveRate)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Per-person breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Individual Breakdown (Filing Separately)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium"></th>
                  <th className="text-right py-2 px-2 font-medium">Spouse 1 ({usd(salary1)})</th>
                  <th className="text-right py-2 pl-2 font-medium">Spouse 2 ({usd(salary2)})</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-50">
                  <td className="py-1.5 pr-4 text-gray-600">Federal Income Tax</td>
                  <td className="text-right py-1.5 px-2 tabular-nums text-red-600">-{usd(result.separate.person1.federalIncomeTax)}</td>
                  <td className="text-right py-1.5 pl-2 tabular-nums text-red-600">-{usd(result.separate.person2.federalIncomeTax)}</td>
                </tr>
                <tr className="border-t border-gray-50">
                  <td className="py-1.5 pr-4 text-gray-600">Social Security</td>
                  <td className="text-right py-1.5 px-2 tabular-nums text-red-600">-{usd(result.separate.person1.socialSecurity)}</td>
                  <td className="text-right py-1.5 pl-2 tabular-nums text-red-600">-{usd(result.separate.person2.socialSecurity)}</td>
                </tr>
                <tr className="border-t border-gray-50">
                  <td className="py-1.5 pr-4 text-gray-600">Medicare</td>
                  <td className="text-right py-1.5 px-2 tabular-nums text-red-600">-{usd(result.separate.person1.medicare)}</td>
                  <td className="text-right py-1.5 pl-2 tabular-nums text-red-600">-{usd(result.separate.person2.medicare)}</td>
                </tr>
                <tr className="border-t border-gray-50">
                  <td className="py-1.5 pr-4 text-gray-600">State Tax</td>
                  <td className="text-right py-1.5 px-2 tabular-nums text-red-600">-{usd(result.separate.person1.stateIncomeTax)}</td>
                  <td className="text-right py-1.5 pl-2 tabular-nums text-red-600">-{usd(result.separate.person2.stateIncomeTax)}</td>
                </tr>
                <tr className="border-t border-gray-100 font-semibold">
                  <td className="py-1.5 pr-4 text-gray-900">Take-Home</td>
                  <td className="text-right py-1.5 px-2 tabular-nums text-green-700">{usd(result.separate.person1.takeHome)}</td>
                  <td className="text-right py-1.5 pl-2 tabular-nums text-green-700">{usd(result.separate.person2.takeHome)}</td>
                </tr>
                <tr className="border-t border-gray-50">
                  <td className="py-1.5 pr-4 text-gray-500 text-xs">Effective Rate</td>
                  <td className="text-right py-1.5 px-2 tabular-nums text-gray-500 text-xs">{pct(result.separate.person1.effectiveRate)}</td>
                  <td className="text-right py-1.5 pl-2 tabular-nums text-gray-500 text-xs">{pct(result.separate.person2.effectiveRate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive calculator */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Try Different Numbers</h2>
          <MarriedCalculator
            initialSalary1={salary1}
            initialSalary2={salary2}
            initialState={state.code}
          />
        </section>

        {/* Product CTA */}
        <section className="mb-8">
          <ProductCTA />
        </section>

        {/* Related salary pairs in this state */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Other Salary Combinations in {state.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relatedPairs.map(([s1, s2]) => (
              <Link
                key={`${s1}-${s2}`}
                href={`/married/${buildMarriedSlug(s1, s2, state.slug)}`}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {usd(s1)} + {usd(s2)}
              </Link>
            ))}
          </div>
        </section>

        {/* Same pair, different states */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{usd(salary1)} + {usd(salary2)} in Other States</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relatedStates.map(s => (
              <Link
                key={s.code}
                href={`/married/${buildMarriedSlug(salary1, salary2, s.slug)}`}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="pt-6 border-t border-gray-200 flex flex-wrap gap-3">
          <Link href="/married" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Married Filing Calculator
          </Link>
          <Link href={`/${state.slug}`} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
            {state.name} Calculator
          </Link>
          <Link href="/" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
            Salary Calculator
          </Link>
        </div>
      </main>
    </>
  );
}
