import { TaxResult } from '@/lib/tax-engine';

interface Props {
  result: TaxResult;
  period: 'hourly' | 'annual';
}

const usd = (n: number, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const rows = [
  { label: 'Hourly', grossKey: 'hourly', period: 'hourly', decimals: 2 },
  { label: 'Daily', grossKey: 'daily', period: null, decimals: 2 },
  { label: 'Weekly', grossKey: 'weekly', period: null, decimals: 2 },
  { label: 'Bi-weekly', grossKey: 'biweekly', period: null, decimals: 2 },
  { label: 'Monthly', grossKey: 'monthly', period: null, decimals: 0 },
  { label: 'Annual', grossKey: 'annual', period: 'annual', decimals: 0 },
] as const;

export default function SalaryTable({ result, period }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 overflow-x-auto">
      <h2 className="font-semibold text-gray-900 mb-3">Salary Breakdown by Period</h2>
      <table className="w-full text-sm min-w-[360px]">
        <thead>
          <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wide">
            <th className="text-left py-2 px-3 rounded-tl font-medium">Period</th>
            <th className="text-right py-2 px-3 font-medium">Gross</th>
            <th className="text-right py-2 px-3 font-medium">Taxes</th>
            <th className="text-right py-2 px-3 rounded-tr font-medium">Take-Home</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const gross = result.gross[row.grossKey];
            const takeHome = result.takeHome[row.grossKey];
            const taxes = gross - takeHome;
            const isHighlighted = row.period === period;
            return (
              <tr
                key={row.label}
                className={`border-t border-gray-100 ${isHighlighted ? 'bg-blue-50' : ''}`}
              >
                <td className={`py-2.5 px-3 ${isHighlighted ? 'font-semibold text-blue-800' : 'text-gray-700'}`}>
                  {row.label}
                  {isHighlighted && <span className="ml-1.5 text-xs text-blue-500">← your input</span>}
                </td>
                <td className="text-right py-2.5 px-3 tabular-nums text-gray-700">{usd(gross, row.decimals)}</td>
                <td className="text-right py-2.5 px-3 tabular-nums text-red-600">-{usd(taxes, row.decimals)}</td>
                <td className={`text-right py-2.5 px-3 tabular-nums font-medium ${isHighlighted ? 'text-green-700' : 'text-green-600'}`}>
                  {usd(takeHome, row.decimals)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
