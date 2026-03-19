import { Metadata } from 'next';
import Link from 'next/link';
import MarriedCalculator from '@/components/MarriedCalculator';
import FAQAccordion from '@/components/FAQAccordion';
import { calculateMarriedFiling } from '@/lib/married-tax';
import { buildMarriedSlug, getSalaryPairs } from '@/lib/married-slugs';
import { getAllStates } from '@/lib/state-taxes';
import { faqSchema, breadcrumbSchema } from '@/lib/structured-data';
import ProductCTA from '@/components/ProductCTA';

const BASE_URL = 'https://salaryhog.com';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export const metadata: Metadata = {
  title: 'Married Filing Calculator — Joint vs Separate 2025 | SalaryHog',
  description: 'Should you file jointly or separately? Compare your married take-home pay both ways with 2025 federal and state tax brackets. Free calculator.',
  alternates: { canonical: `${BASE_URL}/married/` },
  openGraph: {
    title: 'Married Filing Calculator — Joint vs Separate | SalaryHog',
    description: 'Compare joint vs separate take-home pay for married couples in all 50 states.',
    url: `${BASE_URL}/married/`,
    images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
  },
};

const FAQ_ITEMS = [
  {
    question: 'When is it better to file jointly?',
    answer: 'Filing jointly is usually better when one spouse earns significantly more than the other. The wider joint tax brackets mean more of your combined income is taxed at lower rates. For most married couples, joint filing saves money.',
  },
  {
    question: 'When might filing separately make sense?',
    answer: 'Filing separately can sometimes be better when both spouses have similar high incomes, or when one spouse has large itemized deductions (like medical expenses that must exceed 7.5% of AGI). It can also matter for income-driven student loan repayments.',
  },
  {
    question: 'How does FICA work for married couples?',
    answer: "Social Security (6.2%) and Medicare (1.45%) taxes are always calculated on each person's individual wages, regardless of filing status. Your filing status only affects federal income tax and some state taxes.",
  },
  {
    question: 'Do all states have married filing brackets?',
    answer: "Not all states have separate married brackets. Some states use the same brackets for all filers, while others (like California and New York) have distinct married filing jointly brackets with wider ranges. Nine states don't have income tax at all.",
  },
  {
    question: 'Is this calculator accurate for my situation?',
    answer: 'This calculator uses 2025 federal and state tax brackets with standard deductions. Actual results may vary based on itemized deductions, tax credits, pre-tax contributions (401k, HSA), investment income, and other factors. Consult a tax professional for personalized advice.',
  },
];

export default function MarriedPage() {
  const states = getAllStates();
  const sortedStates = [...states].sort((a, b) => a.name.localeCompare(b.name));

  // Pre-computed popular scenarios for the table
  const POPULAR_SCENARIOS = [
    { s1: 75000, s2: 50000, state: 'TX' },
    { s1: 100000, s2: 75000, state: 'CA' },
    { s1: 60000, s2: 60000, state: 'NY' },
    { s1: 100000, s2: 100000, state: 'FL' },
    { s1: 50000, s2: 40000, state: 'IL' },
    { s1: 120000, s2: 80000, state: 'WA' },
  ];

  const scenarioRows = POPULAR_SCENARIOS.map(s => {
    const stateInfo = states.find(st => st.code === s.state)!;
    const result = calculateMarriedFiling(s.s1, s.s2, s.state);
    return { ...s, stateInfo, result };
  });

  const faqStructuredItems = FAQ_ITEMS.map(f => ({ question: f.question, answer: f.answer }));
  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Married Filing Calculator', url: `${BASE_URL}/married` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqStructuredItems)) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">Married Filing Calculator</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Married Filing Calculator: Joint vs Separate
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Enter both salaries and your state to see which filing status gives you more take-home pay. Updated with 2025 federal and state tax brackets.
          </p>
        </div>

        {/* Interactive Calculator */}
        <MarriedCalculator />

        {/* Popular Scenarios */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Married Filing Scenarios</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium">Salaries</th>
                    <th className="text-left px-4 py-2.5 font-medium">State</th>
                    <th className="text-right px-4 py-2.5 font-medium">Joint Take-Home</th>
                    <th className="text-right px-4 py-2.5 font-medium">Separate Take-Home</th>
                    <th className="text-right px-4 py-2.5 font-medium">Better Option</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioRows.map((row, i) => (
                    <tr key={i} className={`border-t border-gray-50 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                      <td className="px-4 py-2">
                        <Link
                          href={`/married/${buildMarriedSlug(row.s1, row.s2, row.stateInfo.slug)}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {usd(row.s1)} + {usd(row.s2)}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{row.stateInfo.name}</td>
                      <td className="text-right px-4 py-2 tabular-nums text-green-700 font-medium">{usd(row.result.joint.takeHome)}</td>
                      <td className="text-right px-4 py-2 tabular-nums text-gray-700">{usd(row.result.separate.combinedTakeHome)}</td>
                      <td className="text-right px-4 py-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          row.result.betterOption === 'joint'
                            ? 'bg-green-50 text-green-700'
                            : row.result.betterOption === 'separate'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {row.result.betterOption === 'joint'
                            ? `Joint (+${usd(row.result.savings)})`
                            : row.result.betterOption === 'separate'
                            ? `Separate (+${usd(Math.abs(row.result.savings))})`
                            : 'Same'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Browse by State */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Married Filing by State</h2>
          <p className="text-gray-600 text-sm mb-4">See joint vs separate results for $75K + $50K in every state.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sortedStates.map(state => (
              <Link
                key={state.code}
                href={`/married/${buildMarriedSlug(75000, 50000, state.slug)}`}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {state.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Product CTA */}
        <section className="mt-10">
          <ProductCTA />
        </section>

        {/* How it works */}
        <section className="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How Married Filing Status Affects Your Taxes</h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              When you&apos;re married, you have two filing options: <strong>Married Filing Jointly (MFJ)</strong> and <strong>Married Filing Separately (MFS)</strong>. Each uses different tax bracket widths and standard deductions.
            </p>
            <p>
              <strong>Married Filing Jointly</strong> combines both incomes and applies wider tax brackets. The 2025 standard deduction for joint filers is $30,000 (double the single deduction). This typically results in a lower combined tax bill, especially when one spouse earns significantly more than the other.
            </p>
            <p>
              <strong>Married Filing Separately</strong> means each spouse files their own return. The brackets are narrower (similar to single filer brackets), and the standard deduction is $15,000 per person. While the deductions sum to $30,000, the narrower brackets mean higher earners may pay more tax.
            </p>
            <p>
              <strong>FICA taxes</strong> (Social Security at 6.2% and Medicare at 1.45%) are always calculated individually on each person&apos;s wages, regardless of filing status.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </section>

        {/* Cross links */}
        <section className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">More Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Salary Calculator
            </Link>
            <Link href="/relocate" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
              Relocation Calculator
            </Link>
            <Link href="/afford" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
              Affordability Calculator
            </Link>
            <Link href="/freelance" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
              1099 vs W-2
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
