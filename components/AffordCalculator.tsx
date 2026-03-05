'use client';

import { useState } from 'react';
import { calculateAffordability, getAllMetros, SIZE_LABELS, ApartmentSize, AffordabilityResult } from '@/lib/rent-affordability';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

interface MetroOption {
  slug: string;
  name: string;
  fullName: string;
  stateCode: string;
}

interface Props {
  initialSalary?: number;
  initialMetro?: string;
  metros: MetroOption[];
}

const VERDICT_STYLES: Record<string, { label: string; cls: string }> = {
  'comfortable': { label: 'Comfy', cls: 'text-green-700 bg-green-50' },
  'affordable': { label: 'OK', cls: 'text-green-700 bg-green-50' },
  'tight': { label: 'Tight', cls: 'text-amber-700 bg-amber-50' },
  'stretched': { label: 'Stretch', cls: 'text-red-600 bg-red-50' },
  'not-affordable': { label: 'No', cls: 'text-red-600 bg-red-50' },
};

export default function AffordCalculator({ initialSalary = 60000, initialMetro = 'austin-tx', metros }: Props) {
  const [salary, setSalary] = useState(initialSalary);
  const [metroSlug, setMetroSlug] = useState(initialMetro);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [inputDisplay, setInputDisplay] = useState(initialSalary.toLocaleString());

  const allMetros = getAllMetros();
  const metro = allMetros.find(m => m.slug === metroSlug) || allMetros[0];
  const result = calculateAffordability(salary, metro.stateCode, metro, filingStatus);

  const handleSalaryChange = (value: string) => {
    const raw = value.replace(/[$,]/g, '');
    if (!/^\d*$/.test(raw)) return;
    setInputDisplay(value);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) setSalary(num);
  };

  const sizes: ApartmentSize[] = ['studio', 'oneBed', 'twoBed', 'threeBed'];

  return (
    <div>
      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="mb-5">
          <label className="block text-sm text-gray-500 mb-1">Annual Salary</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={inputDisplay}
              onChange={e => handleSalaryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">City</label>
            <select
              value={metroSlug}
              onChange={e => setMetroSlug(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {metros.map(m => <option key={m.slug} value={m.slug}>{m.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Filing Status</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['single', 'married'] as const).map(fs => (
                <button
                  key={fs}
                  onClick={() => setFilingStatus(fs)}
                  className={`flex-1 py-2.5 text-sm font-medium capitalize ${
                    filingStatus === fs ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {fs}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key result */}
      <div className="rounded-xl p-5 mb-6 text-center bg-green-50 border border-green-200">
        <p className="text-sm text-gray-600 mb-1">Your take-home: {usd(result.takeHomeMonthly)}/month</p>
        <p className="text-2xl font-bold text-gray-900">
          Max affordable rent: {usd(result.maxRent30)}/month
        </p>
        <p className="text-xs text-gray-500 mt-1">Based on 30% of take-home pay (after taxes)</p>
      </div>

      {/* Affordability table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left py-3 px-3 font-medium">Size</th>
              <th className="text-right py-3 px-3 font-medium">Avg Rent</th>
              <th className="text-right py-3 px-3 font-medium">% Income</th>
              <th className="text-center py-3 px-3 font-medium">Verdict</th>
              <th className="text-right py-3 px-3 font-medium hidden sm:table-cell">Left Over</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => {
              const a = result.affordability[size];
              const v = VERDICT_STYLES[a.verdict];
              return (
                <tr key={size} className="border-t border-gray-100">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{SIZE_LABELS[size]}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-800">{usd(a.rent)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-800">{a.percentOfIncome}%</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${v.cls}`}>
                      {v.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-600 hidden sm:table-cell">{usd(a.remaining)}/mo</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* After rent insight */}
      <div className="rounded-lg px-4 py-3 text-sm bg-blue-50 border border-blue-100 text-blue-800">
        After paying rent on a 1-BR ({usd(result.affordability.oneBed.rent)}), you&rsquo;d have {usd(result.affordability.oneBed.remaining)}/month left for everything else.
      </div>
    </div>
  );
}
