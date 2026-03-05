import { Metadata } from 'next';
import Link from 'next/link';
import { getAllMetros } from '@/lib/cost-of-living';
import { calculateEquivalentSalary } from '@/lib/cost-of-living';
import { buildRelocationSlug } from '@/lib/relocation-slugs';
import { breadcrumbSchema } from '@/lib/structured-data';
import RelocationCalculator from '@/components/RelocationCalculator';

const BASE_URL = 'https://salaryhog.com';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export const metadata: Metadata = {
  title: 'Relocation Salary Calculator — What Would You Need to Earn? | SalaryHog',
  description: 'Moving to a new city? See what salary you need to maintain your lifestyle. Compare cost of living, taxes, and take-home pay across 50 US metros.',
  alternates: { canonical: `${BASE_URL}/relocate` },
  openGraph: {
    title: 'Relocation Salary Calculator | SalaryHog',
    description: 'Moving to a new city? See what salary you need to maintain your lifestyle.',
    url: `${BASE_URL}/relocate`,
  },
};

const POPULAR_ROUTES: [string, string][] = [
  ['new-york-ny', 'miami-fl'],
  ['san-francisco-ca', 'austin-tx'],
  ['chicago-il', 'nashville-tn'],
  ['los-angeles-ca', 'phoenix-az'],
  ['seattle-wa', 'denver-co'],
  ['boston-ma', 'raleigh-nc'],
  ['new-york-ny', 'austin-tx'],
  ['san-francisco-ca', 'seattle-wa'],
  ['los-angeles-ca', 'dallas-tx'],
  ['washington-dc', 'atlanta-ga'],
  ['chicago-il', 'tampa-fl'],
  ['boston-ma', 'charlotte-nc'],
];

export default function RelocatePage() {
  const allMetros = getAllMetros();
  const metroOptions = allMetros.map(m => ({
    slug: m.slug, name: m.name, fullName: m.fullName, stateCode: m.stateCode,
    rpp: m.rpp, rppHousing: m.rppHousing, averageRent1BR: m.averageRent1BR,
    medianHomePrice: m.medianHomePrice, lat: m.lat, lng: m.lng,
  }));

  const popularCards = POPULAR_ROUTES.map(([fromSlug, toSlug]) => {
    const from = allMetros.find(m => m.slug === fromSlug);
    const to = allMetros.find(m => m.slug === toSlug);
    if (!from || !to) return null;
    const result = calculateEquivalentSalary(75000, from, to);
    return {
      from, to,
      slug: buildRelocationSlug(from, to),
      equivalentSalary: result.equivalentSalary,
      colPct: result.colPercentDifference,
    };
  }).filter(Boolean) as { from: typeof allMetros[0]; to: typeof allMetros[0]; slug: string; equivalentSalary: number; colPct: number }[];

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Relocate', url: `${BASE_URL}/relocate` },
  ]);

  // Group metros by first letter for browse section
  const grouped = new Map<string, typeof allMetros>();
  for (const m of [...allMetros].sort((a, b) => a.name.localeCompare(b.name))) {
    const letter = m.name[0];
    if (!grouped.has(letter)) grouped.set(letter, []);
    grouped.get(letter)!.push(m);
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">&rsaquo;</span>
          <span className="text-gray-700">Relocate</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">What Would You Need to Earn?</h1>
        <p className="text-gray-600 mb-8">See your salary equivalent in any US city — factoring in cost of living and state taxes.</p>

        <RelocationCalculator
          metros={metroOptions}
          initialFrom="austin-tx"
          initialTo="denver-co"
        />

        {/* Popular Relocation Comparisons */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Relocation Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularCards.map(card => (
              <Link
                key={card.slug}
                href={`/relocate/${card.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  {card.from.name} &rarr; {card.to.name}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Cost of living is {card.colPct > 0 ? `${card.colPct.toFixed(0)}% higher` : `${Math.abs(card.colPct).toFixed(0)}% lower`}
                </p>
                <p className="text-sm text-gray-700">
                  You&apos;d need <span className="font-medium">{usd(card.equivalentSalary)}</span> to match $75K
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by City */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by City</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allMetros
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(m => (
                  <div key={m.slug} className="text-sm">
                    <span className="font-medium text-gray-900">{m.fullName}</span>
                    <div className="flex gap-2 mt-0.5">
                      <Link href={`/relocate/${m.slug}-to-${m.slug === 'new-york-ny' ? 'miami-fl' : 'new-york-ny'}`} className="text-xs text-blue-600 hover:underline">
                        Moving from
                      </Link>
                      <Link href={`/relocate/${m.slug === 'new-york-ny' ? 'los-angeles-ca' : 'new-york-ny'}-to-${m.slug}`} className="text-xs text-blue-600 hover:underline">
                        Moving to
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
