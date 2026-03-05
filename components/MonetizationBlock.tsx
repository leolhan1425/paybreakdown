import Link from 'next/link';
import { TaxResult } from '@/lib/tax-engine';
import { en } from '@/lib/i18n/en';
import { es } from '@/lib/i18n/es';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const NO_TAX_STATES = new Set(['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']);
const NEAREST_NO_TAX: Record<string, string> = {
  CA: 'nevada', NY: 'florida', IL: 'florida', NJ: 'florida', PA: 'florida',
  OR: 'washington', CO: 'wyoming', AZ: 'nevada', GA: 'florida', NC: 'tennessee',
  OH: 'tennessee', VA: 'florida', MA: 'new-hampshire', CT: 'florida', MD: 'florida',
};

interface Props {
  result: TaxResult;
  stateCode: string;
  stateName: string;
  stateSlug: string;
  lang?: 'en' | 'es';
}

export default function MonetizationBlock({ result, stateCode, stateName, stateSlug, lang = 'en' }: Props) {
  const t = lang === 'es' ? es.monetization : en.monetization;
  const grossAnnual = result.gross.annual;
  const takeHomeAnnual = result.takeHome.annual;
  const savingsInterest = Math.round(takeHomeAnnual * 0.1 * 0.045);
  const match3 = Math.round(grossAnnual * 0.03);
  const match6 = Math.round(grossAnnual * 0.06);
  const hasStateTax = !NO_TAX_STATES.has(stateCode);
  const nearestNoTaxSlug = NEAREST_NO_TAX[stateCode] || 'texas';
  const prefix = lang === 'es' ? '/es' : '';
  const blogPath = lang === 'es' ? '/es/blog/estados-sin-impuesto-sobre-la-renta' : '/blog/no-income-tax-states';

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="font-bold text-gray-900 mb-4">{t.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: HYSA */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="font-semibold text-gray-900 text-sm mb-2">{t.hysa.title}</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            {t.hysa.body(usd(Math.round(takeHomeAnnual * 0.1)), usd(savingsInterest))}
          </p>
          <span className="text-xs text-blue-600 font-medium">{t.hysa.cta} &rarr;</span>
        </div>

        {/* Card 2: 401k */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="font-semibold text-gray-900 text-sm mb-2">{t.retirement.title}</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            {t.retirement.body(usd(match3), usd(match6))}
          </p>
          <span className="text-xs text-blue-600 font-medium">{t.retirement.cta} &rarr;</span>
        </div>

        {/* Card 3: State tax */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {hasStateTax ? (
            <>
              <p className="font-semibold text-gray-900 text-sm mb-2">{t.noTaxState.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {t.noTaxState.body(usd(result.stateIncomeTax), stateName)}
              </p>
              <Link href={`${prefix}/compare/${stateSlug}-vs-${nearestNoTaxSlug}`} className="text-xs text-blue-600 font-medium hover:underline">
                {lang === 'es'
                  ? `Comparar ${stateName} vs ${nearestNoTaxSlug.charAt(0).toUpperCase() + nearestNoTaxSlug.slice(1).replace(/-/g, ' ')}`
                  : `Compare ${stateName} vs ${nearestNoTaxSlug.charAt(0).toUpperCase() + nearestNoTaxSlug.slice(1).replace(/-/g, ' ')}`
                } &rarr;
              </Link>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900 text-sm mb-2">{t.alreadyNoTax.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {t.alreadyNoTax.body(stateName)}
              </p>
              <Link href={blogPath} className="text-xs text-blue-600 font-medium hover:underline">
                {t.alreadyNoTax.cta} &rarr;
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
