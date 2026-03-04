'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TaxResult } from '@/lib/tax-engine';

interface Props {
  result: TaxResult;
}

const SLICES = [
  { key: 'takeHome', label: 'Take-Home Pay', color: '#22c55e' },
  { key: 'federalIncomeTax', label: 'Federal Income Tax', color: '#3b82f6' },
  { key: 'socialSecurityTax', label: 'Social Security', color: '#a855f7' },
  { key: 'medicareTax', label: 'Medicare', color: '#f59e0b' },
  { key: 'stateIncomeTax', label: 'State Income Tax', color: '#f87171' },
] as const;

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export default function DonutChart({ result }: Props) {
  const data = SLICES
    .map(s => ({
      name: s.label,
      value: s.key === 'takeHome' ? result.takeHome.annual : result[s.key],
      color: s.color,
    }))
    .filter(d => d.value > 0);

  const effectivePct = `${(result.effectiveRate * 100).toFixed(1)}% tax`;

  const CenterLabel = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-sm"
      fill="#374151"
    >
      <tspan x="50%" dy="-0.3em" fontSize={14} fontWeight={600}>
        {effectivePct}
      </tspan>
      <tspan x="50%" dy="1.4em" fontSize={11} fill="#9ca3af">
        effective rate
      </tspan>
    </text>
  );

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-sm">
        <p className="font-medium text-gray-800">{name}</p>
        <p className="text-gray-600">{usd(value)}</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Where Your Money Goes</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fill="#374151">
            <tspan x="50%" dy="-0.3em" fontSize={14} fontWeight={600}>
              {effectivePct}
            </tspan>
            <tspan x="50%" dy="1.4em" fontSize={11} fill="#9ca3af">
              effective rate
            </tspan>
          </text>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
