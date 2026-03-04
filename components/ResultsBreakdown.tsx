import { TaxResult } from '@/lib/tax-engine';

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
}

export default function ResultsBreakdown({ result }: Props) {
  const { gross, takeHome, federalIncomeTax, socialSecurityTax, medicareTax, stateIncomeTax, totalTax, effectiveRate, hasStateTax, stateName } = result;

  const rows = [
    { label: 'Gross Pay', annual: gross.annual, monthly: gross.monthly, pctOfGross: 1, highlight: false, isTotal: false },
    { label: 'Federal Income Tax', annual: -federalIncomeTax, monthly: -(federalIncomeTax / 12), pctOfGross: federalIncomeTax / gross.annual, highlight: false, isTotal: false },
    { label: 'Social Security', annual: -socialSecurityTax, monthly: -(socialSecurityTax / 12), pctOfGross: socialSecurityTax / gross.annual, highlight: false, isTotal: false },
    { label: 'Medicare', annual: -medicareTax, monthly: -(medicareTax / 12), pctOfGross: medicareTax / gross.annual, highlight: false, isTotal: false },
    ...(hasStateTax && stateIncomeTax > 0 ? [{ label: `${stateName} State Tax`, annual: -stateIncomeTax, monthly: -(stateIncomeTax / 12), pctOfGross: stateIncomeTax / gross.annual, highlight: false, isTotal: false }] : []),
    { label: 'Total Tax', annual: -totalTax, monthly: -(totalTax / 12), pctOfGross: totalTax / gross.annual, highlight: false, isTotal: true },
    { label: 'Take-Home Pay', annual: takeHome.annual, monthly: takeHome.monthly, pctOfGross: takeHome.annual / gross.annual, highlight: true, isTotal: false },
  ];

  const keepCents = (1 - effectiveRate) * 100;

  return (
    <div className="mb-6">
      {/* Hero */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <p className="text-gray-500 text-sm mb-1">You take home</p>
        <p className="text-4xl font-bold text-green-700 mb-2">
          {usd(takeHome.annual)}<span className="text-lg font-normal text-gray-500">/year</span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          <span>{usd(takeHome.monthly)}/mo</span>
          <span className="text-gray-300">·</span>
          <span>{usd(takeHome.biweekly)}/paycheck</span>
          <span className="text-gray-300">·</span>
          <span>{usd(takeHome.weekly)}/wk</span>
          <span className="text-gray-300">·</span>
          <span>{usd(takeHome.hourly, 2)}/hr</span>
        </div>
      </div>

      {/* Tax breakdown table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4 overflow-x-auto">
        <h2 className="font-semibold text-gray-900 mb-3">Tax Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left py-2 px-3 rounded-tl font-medium">Category</th>
              <th className="text-right py-2 px-3 font-medium">Annual</th>
              <th className="text-right py-2 px-3 hidden sm:table-cell font-medium">Monthly</th>
              <th className="text-right py-2 px-3 rounded-tr font-medium">% of Gross</th>
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
          ? `💰 ${stateName || 'This state'} has no state income tax — you keep more of every paycheck.`
          : effectiveRate > 0.25
          ? `Your effective tax rate is ${pct(effectiveRate)}. Consider maximizing pre-tax deductions like 401(k) contributions to lower your taxable income.`
          : `Your effective tax rate is ${pct(effectiveRate)}, meaning you keep ${keepCents.toFixed(0)} cents of every dollar earned.`}
      </div>
    </div>
  );
}
