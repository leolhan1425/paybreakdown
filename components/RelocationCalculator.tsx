'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculateTakeHome, TaxResult } from '@/lib/tax-engine';

interface MetroOption {
  slug: string;
  name: string;
  fullName: string;
  stateCode: string;
  rpp: number;
  rppHousing: number;
  averageRent1BR: number;
  medianHomePrice: number;
  lat: number;
  lng: number;
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function movingCostRange(miles: number) {
  if (miles < 100) return { low: 800, mid: 1650, high: 2500 };
  if (miles < 500) return { low: 2000, mid: 3500, high: 5000 };
  if (miles < 1000) return { low: 3000, mid: 5000, high: 7000 };
  if (miles < 2000) return { low: 4000, mid: 6500, high: 9000 };
  return { low: 5000, mid: 8500, high: 12000 };
}

interface Props {
  metros: MetroOption[];
  initialFrom?: string;
  initialTo?: string;
  initialSalary?: number;
}

export default function RelocationCalculator({ metros, initialFrom, initialTo, initialSalary = 75000 }: Props) {
  const [fromSlug, setFromSlug] = useState(initialFrom || metros[0]?.slug || '');
  const [toSlug, setToSlug] = useState(initialTo || metros[1]?.slug || '');
  const [salary, setSalary] = useState(initialSalary);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [inputDisplay, setInputDisplay] = useState(initialSalary.toLocaleString());

  const fromMetro = metros.find(m => m.slug === fromSlug);
  const toMetro = metros.find(m => m.slug === toSlug);

  const result = useMemo(() => {
    if (!fromMetro || !toMetro || salary <= 0) return null;

    const equivalentSalary = Math.round(salary * (toMetro.rpp / fromMetro.rpp));
    const currentTakeHome = calculateTakeHome({ amount: salary, period: 'annual', stateCode: fromMetro.stateCode, filingStatus });
    const equivalentTakeHome = calculateTakeHome({ amount: equivalentSalary, period: 'annual', stateCode: toMetro.stateCode, filingStatus });
    const sameSalaryTakeHome = calculateTakeHome({ amount: salary, period: 'annual', stateCode: toMetro.stateCode, filingStatus });

    const colPctDiff = ((toMetro.rpp / fromMetro.rpp) - 1) * 100;
    const housingPctDiff = ((toMetro.rppHousing / fromMetro.rppHousing) - 1) * 100;
    const taxDiff = sameSalaryTakeHome.takeHome.annual - currentTakeHome.takeHome.annual;
    const miles = haversineDistance(fromMetro.lat, fromMetro.lng, toMetro.lat, toMetro.lng);
    const moving = movingCostRange(miles);

    return { equivalentSalary, currentTakeHome, equivalentTakeHome, sameSalaryTakeHome, colPctDiff, housingPctDiff, taxDiff, miles, moving };
  }, [fromMetro, toMetro, salary, filingStatus]);

  const handleAmountChange = (value: string) => {
    const raw = value.replace(/[$,]/g, '');
    if (!/^\d*$/.test(raw)) return;
    setInputDisplay(value);
    const num = parseInt(raw);
    if (!isNaN(num) && num > 0) setSalary(num);
  };

  const sorted = [...metros].sort((a, b) => a.fullName.localeCompare(b.fullName));

  function TaxRow({ label, valA, valB, isNeg = false, bold = false }: { label: string; valA: number; valB: number; isNeg?: boolean; bold?: boolean }) {
    const cls = bold ? 'font-semibold' : '';
    return (
      <tr className="border-t border-gray-100">
        <td className={`py-2 px-3 text-sm ${cls} text-gray-700`}>{label}</td>
        <td className={`py-2 px-3 text-sm text-right tabular-nums ${cls} ${isNeg ? 'text-red-600' : bold ? 'text-green-700' : 'text-gray-800'}`}>
          {isNeg ? `-${usd(-valA)}` : usd(valA)}
        </td>
        <td className={`py-2 px-3 text-sm text-right tabular-nums ${cls} ${isNeg ? 'text-red-600' : bold ? 'text-green-700' : 'text-gray-800'}`}>
          {isNeg ? `-${usd(-valB)}` : usd(valB)}
        </td>
      </tr>
    );
  }

  return (
    <div>
      {/* Input form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="mb-5">
          <label className="block text-sm text-gray-500 mb-1">Your Current Salary</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={inputDisplay}
              onChange={e => handleAmountChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">I currently live in</label>
            <select value={fromSlug} onChange={e => setFromSlug(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
              {sorted.map(m => <option key={m.slug} value={m.slug}>{m.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">I&apos;m thinking about</label>
            <select value={toSlug} onChange={e => setToSlug(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
              {sorted.map(m => <option key={m.slug} value={m.slug}>{m.fullName}</option>)}
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

      {/* Results */}
      {result && fromMetro && toMetro && (
        <>
          {/* Headline */}
          <div className={`rounded-xl p-5 mb-6 text-center ${result.colPctDiff > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <p className="text-sm text-gray-600 mb-1">
              To maintain your {fromMetro.name} lifestyle in {toMetro.name}, you&apos;d need to earn:
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {usd(result.equivalentSalary)}/year
            </p>
            <p className={`text-sm font-medium ${result.equivalentSalary > salary ? 'text-red-600' : 'text-green-600'}`}>
              {result.equivalentSalary > salary ? '\u25B2' : '\u25BC'} {usd(Math.abs(result.equivalentSalary - salary))} {result.equivalentSalary > salary ? 'more' : 'less'} than you make now
            </p>
          </div>

          {/* Side-by-side table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left py-3 px-3 font-medium">Category</th>
                  <th className="text-right py-3 px-3 font-medium">{fromMetro.name}</th>
                  <th className="text-right py-3 px-3 font-medium">{toMetro.name}</th>
                </tr>
              </thead>
              <tbody>
                <TaxRow label="Salary" valA={salary} valB={result.equivalentSalary} />
                <TaxRow label="Federal Income Tax" valA={-result.currentTakeHome.federalIncomeTax} valB={-result.equivalentTakeHome.federalIncomeTax} isNeg />
                <TaxRow label="Social Security" valA={-result.currentTakeHome.socialSecurityTax} valB={-result.equivalentTakeHome.socialSecurityTax} isNeg />
                <TaxRow label="Medicare" valA={-result.currentTakeHome.medicareTax} valB={-result.equivalentTakeHome.medicareTax} isNeg />
                <TaxRow label="State Tax" valA={-result.currentTakeHome.stateIncomeTax} valB={-result.equivalentTakeHome.stateIncomeTax} isNeg />
                <tr className="border-t-2 border-gray-300">
                  <td className="py-2 px-3 text-sm font-semibold text-gray-900">Take-Home Pay</td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums font-semibold text-green-700">{usd(result.currentTakeHome.takeHome.annual)}</td>
                  <td className="py-2 px-3 text-sm text-right tabular-nums font-semibold text-green-700">{usd(result.equivalentTakeHome.takeHome.annual)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Why the difference */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Why the difference</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                Cost of living is <span className={`font-medium ${result.colPctDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pct(result.colPctDiff)}
                </span> in {toMetro.name}
              </li>
              <li>
                Housing is <span className={`font-medium ${result.housingPctDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pct(result.housingPctDiff)}
                </span> in {toMetro.name}
              </li>
              {result.taxDiff !== 0 && (
                <li>
                  At the same {usd(salary)} salary, you&apos;d {result.taxDiff > 0 ? 'save' : 'pay'}{' '}
                  <span className={`font-medium ${result.taxDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {usd(Math.abs(result.taxDiff))}/year
                  </span> in taxes in {toMetro.name}
                </li>
              )}
            </ul>
          </div>

          {/* Moving cost estimate */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Estimated Moving Costs</h3>
            <p className="text-sm text-gray-600 mb-3">Distance: ~{Math.round(result.miles).toLocaleString()} miles</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">DIY Truck</p>
                <p className="font-semibold text-sm text-gray-900">{usd(result.moving.low)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Container</p>
                <p className="font-semibold text-sm text-gray-900">{usd(result.moving.mid)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Full-Service</p>
                <p className="font-semibold text-sm text-gray-900">{usd(result.moving.high)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
