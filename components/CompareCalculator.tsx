'use client';

import { useState } from 'react';
import Link from 'next/link';
import statesData from '../data/states.json';
import { calculateTakeHome, TaxResult } from '@/lib/tax-engine';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

interface Props {
  initialStateA: string;
  initialStateB: string;
  initialAmount?: number;
  initialPeriod?: 'hourly' | 'annual';
}

export default function CompareCalculator({ initialStateA, initialStateB, initialAmount = 75000, initialPeriod = 'annual' }: Props) {
  const [stateCodeA, setStateCodeA] = useState(initialStateA);
  const [stateCodeB, setStateCodeB] = useState(initialStateB);
  const [amount, setAmount] = useState(initialAmount);
  const [period, setPeriod] = useState<'hourly' | 'annual'>(initialPeriod);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [inputDisplay, setInputDisplay] = useState(
    initialPeriod === 'annual' ? initialAmount.toLocaleString() : String(initialAmount)
  );

  const resultA = calculateTakeHome({ amount, period, stateCode: stateCodeA, filingStatus });
  const resultB = calculateTakeHome({ amount, period, stateCode: stateCodeB, filingStatus });
  const diff = resultA.takeHome.annual - resultB.takeHome.annual;
  const stateNameA = statesData.find(s => s.code === stateCodeA)?.name || stateCodeA;
  const stateNameB = statesData.find(s => s.code === stateCodeB)?.name || stateCodeB;

  const handleAmountChange = (value: string) => {
    const raw = value.replace(/[$,]/g, '');
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setInputDisplay(value);
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) setAmount(num);
  };

  const sorted = [...statesData].sort((a, b) => a.name.localeCompare(b.name));

  function TaxRow({ label, valA, valB, isNeg = false, bold = false }: { label: string; valA: number; valB: number; isNeg?: boolean; bold?: boolean }) {
    const cls = bold ? 'font-semibold' : '';
    const colorA = isNeg ? 'text-red-600' : bold ? 'text-green-700' : 'text-gray-800';
    const colorB = isNeg ? 'text-red-600' : bold ? 'text-green-700' : 'text-gray-800';
    return (
      <tr className="border-t border-gray-100">
        <td className={`py-2 px-3 text-sm ${cls} text-gray-700`}>{label}</td>
        <td className={`py-2 px-3 text-sm text-right tabular-nums ${cls} ${colorA}`}>
          {isNeg ? `-${usd(-valA)}` : usd(valA)}
        </td>
        <td className={`py-2 px-3 text-sm text-right tabular-nums ${cls} ${colorB}`}>
          {isNeg ? `-${usd(-valB)}` : usd(valB)}
        </td>
      </tr>
    );
  }

  return (
    <div>
      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex justify-center mb-5">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            {(['hourly', 'annual'] as const).map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setInputDisplay(p === 'annual' ? amount.toLocaleString() : String(amount)); }}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p === 'hourly' ? 'Hourly' : 'Annual'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-gray-500 mb-1">{period === 'hourly' ? 'Hourly Rate' : 'Annual Salary'}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={inputDisplay}
              onChange={e => handleAmountChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">State A</label>
            <select value={stateCodeA} onChange={e => setStateCodeA(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
              {sorted.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">State B</label>
            <select value={stateCodeB} onChange={e => setStateCodeB(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
              {sorted.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
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

      {/* Difference callout */}
      {diff !== 0 && (
        <div className={`rounded-xl p-5 mb-6 text-center ${diff > 0 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            You keep {usd(Math.abs(diff))} more in {diff > 0 ? stateNameA : stateNameB}
          </p>
          <p className="text-sm text-gray-600">
            That&apos;s {usd(Math.round(Math.abs(diff) / 12))}/month or {usd(Math.round(Math.abs(diff) / 52))}/week
          </p>
        </div>
      )}

      {/* Comparison table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left py-3 px-3 font-medium">Category</th>
              <th className="text-right py-3 px-3 font-medium">{stateNameA}</th>
              <th className="text-right py-3 px-3 font-medium">{stateNameB}</th>
            </tr>
          </thead>
          <tbody>
            <TaxRow label="Gross Pay" valA={resultA.gross.annual} valB={resultB.gross.annual} />
            <TaxRow label="Federal Income Tax" valA={-resultA.federalIncomeTax} valB={-resultB.federalIncomeTax} isNeg />
            <TaxRow label="Social Security" valA={-resultA.socialSecurityTax} valB={-resultB.socialSecurityTax} isNeg />
            <TaxRow label="Medicare" valA={-resultA.medicareTax} valB={-resultB.medicareTax} isNeg />
            <TaxRow label={`State Tax`} valA={-resultA.stateIncomeTax} valB={-resultB.stateIncomeTax} isNeg />
            <tr className="border-t-2 border-gray-300">
              <td className="py-2 px-3 text-sm font-semibold text-gray-900">Total Tax</td>
              <td className="py-2 px-3 text-sm text-right tabular-nums font-semibold text-red-600">-{usd(resultA.totalTax)}</td>
              <td className="py-2 px-3 text-sm text-right tabular-nums font-semibold text-red-600">-{usd(resultB.totalTax)}</td>
            </tr>
            <TaxRow label="Take-Home Pay" valA={resultA.takeHome.annual} valB={resultB.takeHome.annual} bold />
            <tr className="border-t border-gray-100">
              <td className="py-2 px-3 text-sm text-gray-500">Effective Rate</td>
              <td className="py-2 px-3 text-sm text-right tabular-nums text-gray-500">{pct(resultA.effectiveRate)}</td>
              <td className="py-2 px-3 text-sm text-right tabular-nums text-gray-500">{pct(resultB.effectiveRate)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
