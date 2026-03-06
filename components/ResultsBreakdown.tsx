import { TaxResult } from '@/lib/tax-engine';
import { en } from '@/lib/i18n/en';
import { es, stateNamesEs } from '@/lib/i18n/es';

const usd = (n: number, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

interface Props {
  result: TaxResult;
  lang?: 'en' | 'es';
}

export default function ResultsBreakdown({ result, lang = 'en' }: Props) {
  const t = lang === 'es' ? es.tax : en.tax;
  const { gross, takeHome, federalIncomeTax, socialSecurityTax, medicareTax, stateIncomeTax, totalTax, effectiveRate, hasStateTax, stateName } = result;

  const displayStateName = lang === 'es'
    ? (Object.entries(stateNamesEs).find(([, v]) => {
        // Find by English name match from result
        return false; // We'll use stateName as-is since state slug isn't in result
      })?.[1] || stateName)
    : stateName;

  const stateLabel = lang === 'es'
    ? `${displayStateName} ${t.stateIncomeTax}`
    : `${stateName} ${t.stateIncomeTax}`;

  const rows = [
    { label: t.grossPay, annual: gross.annual, monthly: gross.monthly, pctOfGross: 1, highlight: false, isTotal: false },
    { label: t.federalIncomeTax, annual: -federalIncomeTax, monthly: -(federalIncomeTax / 12), pctOfGross: federalIncomeTax / gross.annual, highlight: false, isTotal: false },
    { label: t.socialSecurity, annual: -socialSecurityTax, monthly: -(socialSecurityTax / 12), pctOfGross: socialSecurityTax / gross.annual, highlight: false, isTotal: false },
    { label: t.medicare, annual: -medicareTax, monthly: -(medicareTax / 12), pctOfGross: medicareTax / gross.annual, highlight: false, isTotal: false },
    ...(hasStateTax && stateIncomeTax > 0 ? [{ label: stateLabel, annual: -stateIncomeTax, monthly: -(stateIncomeTax / 12), pctOfGross: stateIncomeTax / gross.annual, highlight: false, isTotal: false }] : []),
    { label: t.totalTax, annual: -totalTax, monthly: -(totalTax / 12), pctOfGross: totalTax / gross.annual, highlight: false, isTotal: true },
    { label: t.takeHomePay, annual: takeHome.annual, monthly: takeHome.monthly, pctOfGross: takeHome.annual / gross.annual, highlight: true, isTotal: false },
  ];

  const keepCents = (1 - effectiveRate) * 100;

  return (
    <div className="mb-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200 shadow-sm p-6 mb-4">
        <p className="text-gray-500 text-sm mb-1">{t.youTakeHome}</p>
        <p className="text-5xl font-bold text-green-700 mb-4">
          {usd(takeHome.annual)}<span className="text-xl font-normal text-gray-400 ml-1">/{t.year}</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: usd(takeHome.monthly), label: `/${t.month}` },
            { value: usd(takeHome.biweekly), label: `/${t.paycheck}` },
            { value: usd(takeHome.weekly), label: `/${t.week}` },
            { value: usd(takeHome.hourly, 2), label: `/${t.hour}` },
          ].map(pill => (
            <div key={pill.label} className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-center">
              <p className="text-sm font-semibold text-gray-900">{pill.value}</p>
              <p className="text-xs text-gray-400">{pill.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tax breakdown table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4 overflow-x-auto">
        <h2 className="font-semibold text-gray-900 mb-3">{t.taxBreakdown}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left py-2 px-3 rounded-tl font-medium">{t.category}</th>
              <th className="text-right py-2 px-3 font-medium">{t.annual}</th>
              <th className="text-right py-2 px-3 hidden sm:table-cell font-medium">{t.monthly}</th>
              <th className="text-right py-2 px-3 rounded-tr font-medium">{t.percentOfGross}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isNeg = row.annual < 0;
              const isTakeHome = row.highlight;
              const isTotalTax = row.isTotal;
              const isDivider = isTotalTax;

              return (
                <tr
                  key={row.label}
                  className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isDivider ? 'border-t-2 border-gray-300' : ''}`}
                >
                  <td className={`py-2 px-3 ${isTakeHome ? 'font-semibold text-green-700' : isTotalTax ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {row.label}
                  </td>
                  <td className={`text-right py-2 px-3 tabular-nums ${isNeg ? 'text-red-600' : isTakeHome ? 'font-semibold text-green-700' : isTotalTax ? 'font-semibold' : 'text-gray-800'}`}>
                    {isNeg ? `-${usd(-row.annual)}` : usd(row.annual)}
                  </td>
                  <td className={`text-right py-2 px-3 hidden sm:table-cell tabular-nums ${isNeg ? 'text-red-600' : isTakeHome ? 'text-green-600' : 'text-gray-600'}`}>
                    {isNeg ? `-${usd(-row.monthly)}` : usd(row.monthly)}
                  </td>
                  <td className={`text-right py-2 px-3 tabular-nums text-gray-500 ${isTakeHome || isTotalTax ? 'font-semibold' : ''}`}>
                    {pct(row.pctOfGross)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Insight callout */}
      {!hasStateTax || stateIncomeTax === 0 ? (
        <div className="rounded-xl px-5 py-4 bg-green-50 border border-green-200 flex items-start gap-3">
          <span className="text-green-600 text-lg mt-0.5">&#10003;</span>
          <div className="text-sm text-green-800 leading-relaxed">
            {t.noStateTaxInsight(stateName)}
          </div>
        </div>
      ) : effectiveRate > 0.25 ? (
        <div className="rounded-xl px-5 py-4 bg-amber-50 border border-amber-200 flex items-start gap-3">
          <span className="text-amber-500 text-lg mt-0.5">&#9888;</span>
          <div className="text-sm text-amber-800 leading-relaxed">
            {t.highTaxInsight(pct(effectiveRate))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl px-5 py-4 bg-blue-50 border border-blue-200 flex items-start gap-3">
          <span className="text-blue-500 text-lg mt-0.5">&#8505;</span>
          <div className="text-sm text-blue-800 leading-relaxed">
            {t.normalTaxInsight(pct(effectiveRate), keepCents.toFixed(0))}
          </div>
        </div>
      )}
    </div>
  );
}
