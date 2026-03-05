import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllStateSlugs, getStateBySlug } from '@/lib/slug-generator';
import { buildSpanishSlug } from '@/lib/spanish-slugs';
import { calculateTakeHome } from '@/lib/tax-engine';
import { breadcrumbSchema } from '@/lib/structured-data';
import { es, stateNamesEs } from '@/lib/i18n/es';
import StatePageClient from '@/components/StatePageClient';
import statesData from '../../../data/states.json';

interface PageProps {
  params: Promise<{ state: string }>;
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function getEsName(slug: string): string {
  return stateNamesEs[slug] || slug;
}

export async function generateStaticParams() {
  return getAllStateSlugs().map(state => ({ state }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) return {};
  const esName = getEsName(stateSlug);
  const noTax = !state.hasIncomeTax;
  return {
    title: `Calculadora de Sueldo en ${esName} — Impuestos 2025 | SalaryHog`,
    description: `Calcula tu sueldo neto en ${esName}. ${noTax ? 'Sin impuesto estatal sobre la renta. ' : ''}Desglose de impuestos federales y estatales. Gratis, 2025.`,
    alternates: {
      canonical: `https://salaryhog.com/es/${stateSlug}`,
      languages: {
        'en': `https://salaryhog.com/${stateSlug}`,
        'es': `https://salaryhog.com/es/${stateSlug}`,
        'x-default': `https://salaryhog.com/${stateSlug}`,
      },
    },
    openGraph: {
      url: `https://salaryhog.com/es/${stateSlug}`,
      images: [{ url: 'https://salaryhog.com/og-image.svg', width: 1200, height: 630 }],
    },
  };
}

function getTaxBadge(state: typeof statesData[0]) {
  if (!state.hasIncomeTax) return { text: es.stateInfo.noIncomeTaxBadge, cls: 'bg-green-50 text-green-700 border-green-200' };
  if (state.taxType === 'flat' && state.flatRate) return { text: `${es.stateInfo.flatTax}: ${(state.flatRate * 100).toFixed(1)}%`, cls: 'bg-gray-100 text-gray-700 border-gray-200' };
  if (state.taxType === 'progressive' && state.brackets) {
    const b = state.brackets.single;
    const min = (b[0].rate * 100).toFixed(1);
    const max = (b[b.length - 1].rate * 100).toFixed(1);
    return { text: `${es.stateInfo.progressiveTax}: ${min}%–${max}%`, cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  return { text: 'Impuesto sobre la Renta', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
}

const HOURLY_TABLE = [10, 12, 15, 17, 20, 22, 25, 30, 35, 40, 50];
const ANNUAL_TABLE = [30000, 40000, 50000, 60000, 75000, 80000, 90000, 100000, 120000, 150000];
const COMPARISON_STATES = ['TX', 'CA', 'NY', 'FL', 'WA'];
const POPULAR_STATES = ['CA', 'TX', 'NY', 'FL', 'WA', 'IL', 'CO', 'AZ'];

export default async function SpanishStatePage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) notFound();

  const esName = getEsName(stateSlug);
  const t = es.statePage;

  const initialResult = calculateTakeHome({ amount: 20, period: 'hourly', stateCode: state.code, filingStatus: 'single' });

  const hourlyRows = HOURLY_TABLE.map(amt => ({
    amount: amt,
    result: calculateTakeHome({ amount: amt, period: 'hourly', stateCode: state.code, filingStatus: 'single' }),
  }));

  const annualRows = ANNUAL_TABLE.map(amt => ({
    amount: amt,
    result: calculateTakeHome({ amount: amt, period: 'annual', stateCode: state.code, filingStatus: 'single' }),
  }));

  const compCodes = COMPARISON_STATES.filter(c => c !== state.code).slice(0, 4);
  const compStates = compCodes.map(c => statesData.find(s => s.code === c)!).filter(Boolean);
  const compRows = [
    { name: esName, slug: state.slug, takeHome: calculateTakeHome({ amount: 60000, period: 'annual', stateCode: state.code, filingStatus: 'single' }).takeHome.annual, isCurrent: true },
    ...compStates.map(s => ({
      name: getEsName(s.slug), slug: s.slug,
      takeHome: calculateTakeHome({ amount: 60000, period: 'annual', stateCode: s.code, filingStatus: 'single' }).takeHome.annual,
      isCurrent: false,
    })),
  ].sort((a, b) => b.takeHome - a.takeHome);
  const maxTakeHome = compRows[0].takeHome;

  const relatedStates = POPULAR_STATES
    .filter(c => c !== state.code)
    .slice(0, 6)
    .map(c => statesData.find(s => s.code === c)!)
    .filter(Boolean);

  const badge = getTaxBadge(state);
  const baseUrl = 'https://salaryhog.com';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Inicio', url: `${baseUrl}/es` },
            { name: `Calculadora de Sueldo en ${esName}`, url: `${baseUrl}/es/${stateSlug}` },
          ])),
        }}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {t.calculatorTitle(esName)}
            </h1>
            <span className={`text-sm px-3 py-1 rounded-full border font-medium ${badge.cls}`}>
              {badge.text}
            </span>
          </div>
          <p className="text-gray-600 max-w-2xl">
            {!state.hasIncomeTax
              ? t.noIncomeTaxDesc(esName)
              : state.taxType === 'flat' && state.flatRate
              ? t.flatTaxDesc(esName, (state.flatRate * 100).toFixed(1))
              : state.taxType === 'progressive' && state.brackets
              ? t.progressiveTaxDesc(esName).split('.')[0] + '.'
              : ''}
          </p>
        </div>

        {/* Interactive calculator */}
        <StatePageClient
          stateCode={state.code}
          stateName={esName}
          stateSlug={stateSlug}
          initialResult={initialResult}
          lang="es"
        />

        {/* Common salaries tables */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.commonSalaries(esName)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hourly table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="font-semibold text-gray-900 px-4 py-3 border-b border-gray-100 bg-gray-50">{t.hourlyWages}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-4 py-2 font-medium">{t.rate}</th>
                    <th className="text-right px-4 py-2 font-medium">{t.annualGross}</th>
                    <th className="text-right px-4 py-2 font-medium">{t.takeHome}</th>
                    <th className="text-right px-4 py-2 font-medium">{t.effRate}</th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyRows.map(({ amount, result }, i) => (
                    <tr key={amount} className={`border-t border-gray-50 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                      <td className="px-4 py-2">
                        <Link href={`/es/salario/${buildSpanishSlug(amount, 'hourly', stateSlug)}`} className="text-blue-600 hover:underline font-medium">
                          ${amount}/hora
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
              <h3 className="font-semibold text-gray-900 px-4 py-3 border-b border-gray-100 bg-gray-50">{t.annualSalaries}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-4 py-2 font-medium">{t.salary}</th>
                    <th className="text-right px-4 py-2 font-medium">{t.monthlyTakeHome}</th>
                    <th className="text-right px-4 py-2 font-medium">{t.annualTakeHome}</th>
                    <th className="text-right px-4 py-2 font-medium">{t.effRate}</th>
                  </tr>
                </thead>
                <tbody>
                  {annualRows.map(({ amount, result }, i) => (
                    <tr key={amount} className={`border-t border-gray-50 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                      <td className="px-4 py-2">
                        <Link href={`/es/salario/${buildSpanishSlug(amount, 'annual', stateSlug)}`} className="text-blue-600 hover:underline font-medium">
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.howTaxesWork(esName)}</h2>
          {!state.hasIncomeTax ? (
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>{t.noIncomeTaxDesc(esName)}</p>
              <p>{t.noIncomeTaxCompare(esName)}</p>
            </div>
          ) : state.taxType === 'flat' && state.flatRate ? (
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>{t.flatTaxDesc(esName, (state.flatRate * 100).toFixed(1))}</p>
              <p>{t.flatTaxExtra}</p>
            </div>
          ) : state.taxType === 'progressive' && state.brackets ? (
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>{t.progressiveTaxDesc(esName)}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden mt-2">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">{t.incomeRange}</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">{t.taxRate}</th>
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
              <p className="text-xs text-gray-500">{t.bracketNote}</p>
            </div>
          ) : null}
        </section>

        {/* State comparison at $60K */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.compareToStates(esName)}</h2>
          <p className="text-gray-600 text-sm mb-4">{t.compareSubtitle}</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            {compRows.map(row => (
              <div key={row.slug}>
                <div className="flex justify-between text-sm mb-1">
                  <Link
                    href={`/es/${row.slug}`}
                    className={`font-medium ${row.isCurrent ? 'text-blue-700' : 'text-gray-700 hover:text-blue-600'}`}
                  >
                    {row.name} {row.isCurrent && t.current}
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.compareWithOther}</h2>
          <div className="flex flex-wrap gap-3">
            {relatedStates.map(s => (
              <Link
                key={s.code}
                href={`/es/${s.slug}`}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {getEsName(s.slug)} &rarr;
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
