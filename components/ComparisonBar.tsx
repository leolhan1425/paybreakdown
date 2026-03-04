'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TaxResult } from '@/lib/tax-engine';

interface Props {
  result: TaxResult;
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const COLORS = {
  takeHome: '#22c55e',
  federal: '#3b82f6',
  ss: '#a855f7',
  medicare: '#f59e0b',
  state: '#f87171',
};

export default function ComparisonBar({ result }: Props) {
  const segments = [
    { key: 'takeHome', name: 'Take-Home', value: result.takeHome.annual, color: COLORS.takeHome },
    { key: 'federal', name: 'Federal Tax', value: result.federalIncomeTax, color: COLORS.federal },
    { key: 'ss', name: 'Social Security', value: result.socialSecurityTax, color: COLORS.ss },
    { key: 'medicare', name: 'Medicare', value: result.medicareTax, color: COLORS.medicare },
    ...(result.stateIncomeTax > 0 ? [{ key: 'state', name: 'State Tax', value: result.stateIncomeTax, color: COLORS.state }] : []),
  ];

  // recharts stacked bar needs one data row with all keys
  const data = [
    segments.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, number>),
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }> }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-sm space-y-1">
        {payload.map(p => (
          <div key={p.name} className="flex justify-between gap-4">
            <span className="text-gray-600">{p.name}</span>
            <span className="font-medium">{usd(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Income Breakdown</h2>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
          <YAxis type="category" hide />
          <XAxis type="number" hide domain={[0, result.gross.annual]} />
          <Tooltip content={<CustomTooltip />} />
          {segments.map(s => (
            <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} name={s.name} barSize={56} radius={s.key === 'takeHome' ? [4, 0, 0, 4] : s.key === segments[segments.length - 1].key ? [0, 4, 4, 0] : [0, 0, 0, 0]}>
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-sm mt-1 text-gray-500">
        <span>Gross: {usd(result.gross.annual)}</span>
        <span className="text-green-700 font-medium">Take-home: {usd(result.takeHome.annual)}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {segments.map(s => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}
