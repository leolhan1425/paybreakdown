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

const MAX_STATES = 5;

export default function CompareCalculator({ initialStateA, initialStateB, initialAmount = 75000, initialPeriod = 'annual' }: Props) {
  const [stateCodes, setStateCodes] = useState<string[]>([initialStateA, initialStateB]);
  const [amount, setAmount] = useState(initialAmount);
  const [period, setPeriod] = useState<'hourly' | 'annual'>(initialPeriod);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [inputDisplay, setInputDisplay] = useState(
    initialPeriod === 'annual' ? initialAmount.toLocaleString() : String(initialAmount)
  );

  const results = stateCodes.map(sc => calculateTakeHome({ amount, period, stateCode: sc, filingStatus }));
  const stateNames = stateCodes.map(sc => statesData.find(s => s.code === sc)?.name || sc);

  // Find the best take-home
  const bestIdx = results.reduce((best, r, i) => r.takeHome.annual > results[best].takeHome.annual ? i : best, 0);

  const handleAmountChange = (value: string) => {
    const raw = value.replace(/[$,]/g, '');
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setInputDisplay(value);
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) setAmount(num);
  };

  const sorted = [...statesData].sort((a, b) => a.name.localeCompare(b.name));

  const addState = () => {
    if (stateCodes.length >= MAX_STATES) return;
    // Pick a state not already selected
    const unused = sorted.find(s => !stateCodes.includes(s.code));
    if (unused) setStateCodes([...stateCodes, unused.code]);
  };

  const removeState = (idx: number) => {
    if (stateCodes.length <= 2) return;
    setStateCodes(stateCodes.filter((_, i) => i !== idx));
  };

  const updateState = (idx: number, code: string) => {
    const next = [...stateCodes];
    next[idx] = code;
    setStateCodes(next);
  };

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

        {/* State selectors */}
        <div className="space-y-3 mb-4">
          <label className="block text-sm text-gray-500">States to compare</label>
          {stateCodes.map((sc, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={sc}
                onChange={e => updateState(idx, e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
              >
                {sorted.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
              {stateCodes.length > 2 && (
                <button
                  onClick={() => removeState(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${stateNames[idx]}`}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {stateCodes.length < MAX_STATES && (
            <button
              onClick={addState}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add state ({stateCodes.length}/{MAX_STATES})
            </button>
          )}
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

      {/* Winner callout */}
      {stateCodes.length >= 2 && (
        <div className="rounded-xl p-5 mb-6 text-center bg-green-50 border border-green-200">
          <p className="text-2xl font-bold text-gray-900 mb-1">
            You keep the most in {stateNames[bestIdx]}
          </p>
          <p className="text-sm text-gray-600">
            Take-home: {usd(results[bestIdx].takeHome.annual)}/year
            {results.length > 1 && (
              <> &mdash; {usd(results[bestIdx].takeHome.annual - Math.min(...results.map(r => r.takeHome.annual)))}/year more than the lowest</>
            )}
          </p>
        </div>
      )}

      {/* Comparison table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left py-3 px-3 font-medium">Category</th>
              {stateNames.map((name, i) => (
                <th key={i} className="text-right py-3 px-3 font-medium">
                  {name}
                  {i === bestIdx && <span className="ml-1 text-green-600">&#9733;</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Gross Pay" values={results.map(r => r.gross.annual)} />
            <Row label="Federal Income Tax" values={results.map(r => -r.federalIncomeTax)} isNeg />
            <Row label="Social Security" values={results.map(r => -r.socialSecurityTax)} isNeg />
            <Row label="Medicare" values={results.map(r => -r.medicareTax)} isNeg />
            <Row label="State Tax" values={results.map(r => -r.stateIncomeTax)} isNeg />
            <tr className="border-t-2 border-gray-300">
              <td className="py-2 px-3 text-sm font-semibold text-gray-900">Total Tax</td>
              {results.map((r, i) => (
                <td key={i} className="py-2 px-3 text-sm text-right tabular-nums font-semibold text-red-600">-{usd(r.totalTax)}</td>
              ))}
            </tr>
            <Row label="Take-Home Pay" values={results.map(r => r.takeHome.annual)} bold bestIdx={bestIdx} />
            <tr className="border-t border-gray-100">
              <td className="py-2 px-3 text-sm text-gray-500">Effective Rate</td>
              {results.map((r, i) => (
                <td key={i} className="py-2 px-3 text-sm text-right tabular-nums text-gray-500">{pct(r.effectiveRate)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, values, isNeg = false, bold = false, bestIdx }: { label: string; values: number[]; isNeg?: boolean; bold?: boolean; bestIdx?: number }) {
  const cls = bold ? 'font-semibold' : '';
  return (
    <tr className="border-t border-gray-100">
      <td className={`py-2 px-3 text-sm ${cls} text-gray-700`}>{label}</td>
      {values.map((val, i) => {
        const isBest = bold && bestIdx === i;
        const color = isNeg ? 'text-red-600' : isBest ? 'text-green-700' : bold ? 'text-green-700' : 'text-gray-800';
        return (
          <td key={i} className={`py-2 px-3 text-sm text-right tabular-nums ${cls} ${color}`}>
            {isNeg ? `-${usd(-val)}` : usd(val)}
          </td>
        );
      })}
    </tr>
  );
}
