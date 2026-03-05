import { TaxResult } from '@/lib/tax-engine';
import { en } from '@/lib/i18n/en';
import { es } from '@/lib/i18n/es';

interface Props {
  result: TaxResult;
  period: 'hourly' | 'annual';
  lang?: 'en' | 'es';
}

const usd = (n: number, decimals = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

export default function SalaryTable({ result, period, lang = 'en' }: Props) {
  const t = lang === 'es' ? es.salary : en.salary;

  const rows = [
    { label: t.hourly, grossKey: 'hourly' as const, period: 'hourly' as const, decimals: 2 },
    { label: t.daily, grossKey: 'daily' as const, period: null, decimals: 2 },
    { label: t.weekly, grossKey: 'weekly' as const, period: null, decimals: 2 },
    { label: t.biweekly, grossKey: 'biweekly' as const, period: null, decimals: 2 },
    { label: t.monthly, grossKey: 'monthly' as const, period: null, decimals: 0 },
    { label: t.annually, grossKey: 'annual' as const, period: 'annual' as const, decimals: 0 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 overflow-x-auto">
      <h2 className="font-semibold text-gray-900 mb-3">{t.title}</h2>
      <table className="w-full text-sm min-w-[360px]">
        <thead>
          <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wide">
            <th className="text-left py-2 px-3 rounded-tl font-medium">{t.period}</th>
            <th className="text-right py-2 px-3 font-medium">{t.gross}</th>
            <th className="text-right py-2 px-3 font-medium">{t.taxes}</th>
            <th className="text-right py-2 px-3 rounded-tr font-medium">{t.takeHome}</th>
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
                  {isHighlighted && <span className="ml-1.5 text-xs text-blue-500">&larr; {t.yourInput}</span>}
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
