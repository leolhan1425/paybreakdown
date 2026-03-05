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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <p className="text-gray-500 text-sm mb-1">{t.youTakeHome}</p>
        <p className="text-4xl font-bold text-green-700 mb-2">
          {usd(takeHome.annual)}<span className="text-lg font-normal text-gray-500">/{t.year}</span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          <span>{usd(takeHome.monthly)}/{t.month}</span>
          <span className="text-gray-300">&middot;</span>
          <span>{usd(takeHome.biweekly)}/{t.paycheck}</span>
          <span className="text-gray-300">&middot;</span>
          <span>{usd(takeHome.weekly)}/{t.week}</span>
          <span className="text-gray-300">&middot;</span>
          <span>{usd(takeHome.hourly, 2)}/{t.hour}</span>
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
      <div className="rounded-lg px-4 py-3 text-sm bg-blue-50 border border-blue-100 text-blue-800">
        {!hasStateTax || stateIncomeTax === 0
          ? t.noStateTaxInsight(stateName)
          : effectiveRate > 0.25
          ? t.highTaxInsight(pct(effectiveRate))
          : t.normalTaxInsight(pct(effectiveRate), keepCents.toFixed(0))}
      </div>
    </div>
  );
}
