import Link from 'next/link';
import { calculateTakeHome } from '@/lib/tax-engine';
import { buildSpanishSlug } from '@/lib/spanish-slugs';
import HomepageCalculator from '@/components/HomepageCalculator';
import FAQAccordion from '@/components/FAQAccordion';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { faqSchema, webAppSchema } from '@/lib/structured-data';
import { es, stateNamesEs } from '@/lib/i18n/es';
import statesData from '../../data/states.json';

const NO_TAX_STATES = new Set(['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']);

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const POPULAR_HOURLY = [15, 20, 25, 30, 40, 50];
const POPULAR_ANNUAL = [40000, 50000, 60000, 75000, 100000, 150000];

function getStateTaxBadge(state: typeof statesData[0]) {
  if (!state.hasIncomeTax) return { text: es.stateInfo.noIncomeTaxBadge, cls: 'bg-green-50 text-green-700 border-green-200' };
  if (state.taxType === 'flat' && state.flatRate) return { text: `${es.stateInfo.flatTax} ${(state.flatRate * 100).toFixed(1)}%`, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  if (state.taxType === 'progressive' && state.brackets) {
    const b = state.brackets.single;
    const min = (b[0].rate * 100).toFixed(1);
    const max = (b[b.length - 1].rate * 100).toFixed(1);
    return { text: `${es.stateInfo.progressiveTax} ${min}–${max}%`, cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  return { text: 'Impuesto sobre la Renta', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
}

export default function SpanishHomePage() {
  const initialResult = calculateTakeHome({ amount: 20, period: 'hourly', stateCode: 'TX', filingStatus: 'single' });

  const hourlyCards = POPULAR_HOURLY.map(amt => ({
    label: `$${amt}/hora`,
    preview: usd(calculateTakeHome({ amount: amt, period: 'hourly', stateCode: 'TX', filingStatus: 'single' }).takeHome.annual),
    href: `/es/salario/${buildSpanishSlug(amt, 'hourly')}`,
  }));
  const annualCards = POPULAR_ANNUAL.map(amt => ({
    label: `$${(amt / 1000).toFixed(0)}K/ano`,
    preview: usd(calculateTakeHome({ amount: amt, period: 'annual', stateCode: 'TX', filingStatus: 'single' }).takeHome.annual),
    href: `/es/salario/${buildSpanishSlug(amt, 'annual')}`,
  }));
  const popularCards = [...hourlyCards, ...annualCards];

  const sortedStates = [...statesData].sort((a, b) => {
    const nameA = stateNamesEs[a.slug] || a.name;
    const nameB = stateNamesEs[b.slug] || b.name;
    return nameA.localeCompare(nameB);
  });

  const faqStructuredItems = es.faq.items.map(f => ({
    question: f.question,
    answer: f.answer,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqStructuredItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema()) }} />

      <link rel="alternate" hrefLang="en" href="https://salaryhog.com/" />
      <link rel="alternate" hrefLang="es" href="https://salaryhog.com/es/" />
      <link rel="alternate" hrefLang="x-default" href="https://salaryhog.com/" />

      {/* Hero */}
      <section className="bg-white py-10 md:py-16 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {es.hero.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {es.hero.subtitle}
          </p>
          <HomepageCalculator initialResult={initialResult} lang="es" />
        </div>
      </section>

      {/* Popular Calculations */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{es.popular.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularCards.map(card => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{card.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Sueldo neto ~{card.preview} {es.popular.inState}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section id="estados" className="bg-gray-50 py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{es.browseStates.title}</h2>
          <p className="text-gray-600 mb-6">{es.browseStates.subtitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sortedStates.map(state => {
              const badge = getStateTaxBadge(state);
              const esName = stateNamesEs[state.slug] || state.name;
              return (
                <Link
                  key={state.code}
                  href={`/es/${state.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-gray-900 text-sm mb-1">{esName}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>
                    {badge.text}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{es.faq.title}</h2>
          <FAQAccordion items={es.faq.items} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{es.cta.readyToCalculate}</h2>
          <ScrollToTopButton />
        </div>
      </section>
    </>
  );
}
