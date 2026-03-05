import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllAffordSlugs, parseAffordSlug, SALARY_LEVELS } from '@/lib/afford-slugs';
import { calculateAffordability, getAllMetros, SIZE_LABELS, ApartmentSize, Metro } from '@/lib/rent-affordability';
import { breadcrumbSchema, faqSchema } from '@/lib/structured-data';
import AffordCalculator from '@/components/AffordCalculator';

const BASE_URL = 'https://salaryhog.com';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllAffordSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseAffordSlug(slug);
  if (!parsed) return {};

  if (parsed.type === 'salary-city' && parsed.salary) {
    const salaryStr = `$${(parsed.salary / 1000).toFixed(0)}K`;
    const title = `Can I Afford Rent in ${parsed.metro.name} on ${salaryStr}? (2025) | SalaryHog`;
    const description = `See if you can afford a 1BR apartment in ${parsed.metro.fullName} on a ${salaryStr} salary. Based on real take-home pay after taxes.`;
    return { title, description, alternates: { canonical: `${BASE_URL}/afford/${slug}` }, openGraph: { title, description, url: `${BASE_URL}/afford/${slug}` } };
  }

  const title = `How Much Rent Can You Afford in ${parsed.metro.fullName}? | SalaryHog`;
  const description = `See what salary you need to afford rent in ${parsed.metro.name}. Studio to 3BR breakdown based on take-home pay.`;
  return { title, description, alternates: { canonical: `${BASE_URL}/afford/${slug}` }, openGraph: { title, description, url: `${BASE_URL}/afford/${slug}` } };
}

const metroOptions = getAllMetros().slice(0, 50).map(m => ({ slug: m.slug, name: m.name, fullName: m.fullName, stateCode: m.stateCode }));

export default async function AffordPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseAffordSlug(slug);
  if (!parsed) notFound();

  if (parsed.type === 'salary-city' && parsed.salary) {
    return <SalaryCityPage salary={parsed.salary} metro={parsed.metro} slug={slug} />;
  }

  return <CityOnlyPage metro={parsed.metro} slug={slug} />;
}

// --- Salary × City Page ---
function SalaryCityPage({ salary, metro, slug }: { salary: number; metro: Metro; slug: string }) {
  const result = calculateAffordability(salary, metro.stateCode, metro);
  const salaryStr = `$${salary.toLocaleString()}`;
  const sizes: ApartmentSize[] = ['studio', 'oneBed', 'twoBed', 'threeBed'];

  // Nearby cities comparison
  const allMetros = getAllMetros().slice(0, 50);
  const nearbyComparisons = allMetros
    .filter(m => m.slug !== metro.slug)
    .map(m => {
      const r = calculateAffordability(salary, m.stateCode, m);
      return { metro: m, oneBedPct: r.affordability.oneBed.percentOfIncome, verdict: r.affordability.oneBed.verdict };
    })
    .sort((a, b) => a.oneBedPct - b.oneBedPct)
    .slice(0, 5);

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Rent Affordability', url: `${BASE_URL}/afford` },
    { name: `${salaryStr} in ${metro.name}`, url: `${BASE_URL}/afford/${slug}` },
  ]);

  const faqItems = [
    {
      question: `Can I afford rent in ${metro.name} on ${salaryStr} a year?`,
      answer: `On ${salaryStr} in ${metro.fullName}, your monthly take-home pay is approximately ${usd(result.takeHomeMonthly)} after taxes. Using the 30% rule, you can afford up to ${usd(result.maxRent30)}/month in rent. The average 1-bedroom in ${metro.name} is ${usd(metro.rent.oneBed)}, which would be ${result.affordability.oneBed.percentOfIncome}% of your take-home.`,
    },
    {
      question: `What salary do I need to afford a 1-bedroom in ${metro.name}?`,
      answer: `To comfortably afford the average 1-bedroom apartment in ${metro.name} (${usd(metro.rent.oneBed)}/month) at 30% of take-home pay, you would need to earn approximately ${usd(result.salaryNeeded.oneBed)} per year.`,
    },
  ];

  const VERDICT_EMOJI: Record<string, string> = {
    'comfortable': 'Comfy', 'affordable': 'OK', 'tight': 'Tight', 'stretched': 'Stretch', 'not-affordable': 'No',
  };
  const VERDICT_COLOR: Record<string, string> = {
    'comfortable': 'text-green-700', 'affordable': 'text-green-700', 'tight': 'text-amber-600', 'stretched': 'text-red-600', 'not-affordable': 'text-red-600',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqItems)) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <Link href="/afford" className="hover:text-blue-600">Rent Affordability</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">{salaryStr} in {metro.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Can You Afford Rent in {metro.name} on {salaryStr}/Year?
        </h1>
        <p className="text-gray-600 mb-8">
          On {salaryStr} in {metro.fullName}, your take-home pay is {usd(result.takeHomeMonthly)}/month after taxes.
          Using the 30% rule, you can afford up to <strong>{usd(result.maxRent30)}/month</strong> in rent.
        </p>

        <AffordCalculator initialSalary={salary} initialMetro={metro.slug} metros={metroOptions} />

        {/* Affordability breakdown */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rent Affordability Breakdown</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-4 font-medium">Size</th>
                  <th className="text-right py-3 px-4 font-medium">Avg Rent</th>
                  <th className="text-right py-3 px-4 font-medium">% Income</th>
                  <th className="text-center py-3 px-4 font-medium">Verdict</th>
                  <th className="text-right py-3 px-4 font-medium">Left Over</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map(size => {
                  const a = result.affordability[size];
                  return (
                    <tr key={size} className="border-t border-gray-100">
                      <td className="py-2.5 px-4 font-medium text-gray-900">{SIZE_LABELS[size]}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{usd(a.rent)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{a.percentOfIncome}%</td>
                      <td className={`py-2.5 px-4 text-center font-medium ${VERDICT_COLOR[a.verdict]}`}>{VERDICT_EMOJI[a.verdict]}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-gray-600">{usd(a.remaining)}/mo</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Salary needed */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What Salary Do You Need?</h2>
          <p className="text-sm text-gray-600 mb-4">To comfortably afford rent in {metro.name} at the 30% threshold:</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-4 font-medium">Size</th>
                  <th className="text-right py-3 px-4 font-medium">Avg Rent</th>
                  <th className="text-right py-3 px-4 font-medium">Salary Needed</th>
                  <th className="text-right py-3 px-4 font-medium">Hourly Equiv</th>
                </tr>
              </thead>
              <tbody>
                {(['studio', 'oneBed', 'twoBed', 'threeBed'] as const).map(size => (
                  <tr key={size} className="border-t border-gray-100">
                    <td className="py-2.5 px-4 font-medium text-gray-900">{SIZE_LABELS[size]}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{usd(metro.rent[size])}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{usd(result.salaryNeeded[size])}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-gray-600">{usd(Math.round(result.salaryNeeded[size] / 2080 * 100) / 100)}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How city compares */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How {metro.name} Compares</h2>
          <p className="text-sm text-gray-600 mb-4">On {salaryStr}, here&rsquo;s what you can afford in other cities:</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-4 font-medium">City</th>
                  <th className="text-right py-3 px-4 font-medium">1BR Rent</th>
                  <th className="text-right py-3 px-4 font-medium">% Income</th>
                  <th className="text-center py-3 px-4 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {nearbyComparisons.map(c => (
                  <tr key={c.metro.slug} className="border-t border-gray-100">
                    <td className="py-2.5 px-4 font-medium text-gray-900">
                      <Link href={`/afford/${salary}-in-${c.metro.slug}`} className="hover:text-blue-600">{c.metro.fullName}</Link>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{usd(c.metro.rent.oneBed)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-gray-800">{c.oneBedPct}%</td>
                    <td className={`py-2.5 px-4 text-center font-medium ${VERDICT_COLOR[c.verdict]}`}>{VERDICT_EMOJI[c.verdict]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cross-links */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href={`/salary/${salary}-a-year-in-${metro.state}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-900 text-sm">Full Tax Breakdown: {salaryStr} in {metro.stateCode}</p>
              <p className="text-xs text-gray-500 mt-1">See exactly how {salaryStr} breaks down after taxes</p>
            </Link>
            <Link href={`/afford/${metro.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-900 text-sm">All Salary Levels in {metro.name}</p>
              <p className="text-xs text-gray-500 mt-1">Affordability at every income level</p>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

// --- City-Only Page ---
function CityOnlyPage({ metro, slug }: { metro: Metro; slug: string }) {
  const rows = SALARY_LEVELS.map(sal => {
    return calculateAffordability(sal, metro.stateCode, metro);
  });

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Rent Affordability', url: `${BASE_URL}/afford` },
    { name: metro.fullName, url: `${BASE_URL}/afford/${slug}` },
  ]);

  // Find salary needed for 1BR at 30%
  const oneBedNeeded = rows[0].salaryNeeded.oneBed;
  const oneBedHourly = Math.round(oneBedNeeded / 2080 * 100) / 100;

  const VERDICT_COLOR: Record<string, string> = {
    'comfortable': 'text-green-700', 'affordable': 'text-green-700', 'tight': 'text-amber-600', 'stretched': 'text-red-600', 'not-affordable': 'text-red-600',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <Link href="/afford" className="hover:text-blue-600">Rent Affordability</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">{metro.fullName}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          How Much Rent Can You Afford in {metro.fullName}?
        </h1>
        <p className="text-gray-600 mb-8">
          To comfortably afford a 1-bedroom in {metro.name} ({usd(metro.rent.oneBed)}/month), you need to earn at least <strong>{usd(oneBedNeeded)}/year ({usd(oneBedHourly)}/hr)</strong>.
        </p>

        <AffordCalculator initialSalary={60000} initialMetro={metro.slug} metros={metroOptions} />

        {/* All salary levels table */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Affordability at Every Income Level</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-3 font-medium">Salary</th>
                  <th className="text-right py-3 px-3 font-medium">Take-Home/mo</th>
                  <th className="text-right py-3 px-3 font-medium">Max Rent</th>
                  <th className="text-right py-3 px-3 font-medium">1BR ({usd(metro.rent.oneBed)})</th>
                  <th className="text-right py-3 px-3 font-medium hidden sm:table-cell">2BR ({usd(metro.rent.twoBed)})</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.salary} className="border-t border-gray-100">
                    <td className="py-2.5 px-3 font-medium text-gray-900">
                      <Link href={`/afford/${row.salary}-in-${slug}`} className="hover:text-blue-600">
                        {usd(row.salary)}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-800">{usd(row.takeHomeMonthly)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-800">{usd(row.maxRent30)}</td>
                    <td className={`py-2.5 px-3 text-right tabular-nums font-medium ${VERDICT_COLOR[row.affordability.oneBed.verdict]}`}>
                      {row.affordability.oneBed.percentOfIncome}%
                    </td>
                    <td className={`py-2.5 px-3 text-right tabular-nums font-medium hidden sm:table-cell ${VERDICT_COLOR[row.affordability.twoBed.verdict]}`}>
                      {row.affordability.twoBed.percentOfIncome}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">Single filer, 2025 tax brackets, 30% rule applied to take-home pay.</p>
        </section>

        {/* Browse other cities */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Compare Other Cities</h2>
          <div className="flex flex-wrap gap-2">
            {getAllMetros().slice(0, 50)
              .filter(m => m.slug !== metro.slug)
              .sort((a, b) => a.name.localeCompare(b.name))
              .slice(0, 15)
              .map(m => (
                <Link key={m.slug} href={`/afford/${m.slug}`} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:border-blue-300 transition-all">
                  {m.name}
                </Link>
              ))}
          </div>
        </section>

        {/* State link */}
        <section className="mt-10">
          <Link href={`/${metro.state}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all block">
            <p className="font-semibold text-gray-900 text-sm">{metro.stateCode} Salary Calculator</p>
            <p className="text-xs text-gray-500 mt-1">See tax breakdowns for all income levels</p>
          </Link>
        </section>
      </main>
    </>
  );
}
