'use client';

import { useState } from 'react';
import statesData from '../data/states.json';
import { compare1099vsW2, FreelanceComparison } from '@/lib/self-employment-tax';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

interface Props {
  initialIncome?: number;
  initialState?: string;
}

export default function FreelanceCalculator({ initialIncome = 75000, initialState = 'TX' }: Props) {
  const [income, setIncome] = useState(initialIncome);
  const [stateCode, setStateCode] = useState(initialState);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [expenses, setExpenses] = useState(0);
  const [inputDisplay, setInputDisplay] = useState(initialIncome.toLocaleString());
  const [expenseDisplay, setExpenseDisplay] = useState('0');

  const comparison = compare1099vsW2(income, stateCode, filingStatus, expenses);
  const { w2, freelance } = comparison;

  const sorted = [...statesData].sort((a, b) => a.name.localeCompare(b.name));

  const handleIncomeChange = (value: string) => {
    const raw = value.replace(/[$,]/g, '');
    if (!/^\d*$/.test(raw)) return;
    setInputDisplay(value);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) setIncome(num);
  };

  const handleExpenseChange = (value: string) => {
    const raw = value.replace(/[$,]/g, '');
    if (!/^\d*$/.test(raw)) return;
    setExpenseDisplay(value);
    const num = parseInt(raw, 10);
    setExpenses(isNaN(num) ? 0 : num);
  };

  return (
    <div>
      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="mb-5">
          <label className="block text-sm text-gray-500 mb-1">Annual Income</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={inputDisplay}
              onChange={e => handleIncomeChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">State</label>
            <select
              value={stateCode}
              onChange={e => setStateCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {sorted.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
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

        <div>
          <label className="block text-sm text-gray-500 mb-1">Business Expenses (optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={expenseDisplay}
              onChange={e => handleExpenseChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-lg font-semibold text-gray-900 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Deductible expenses reduce your taxable income</p>
        </div>
      </div>

      {/* Key difference callout */}
      <div className="rounded-xl p-5 mb-6 text-center bg-amber-50 border border-amber-200">
        <p className="text-2xl font-bold text-gray-900 mb-1">
          Freelancers pay {usd(comparison.taxDifference)} more in taxes
        </p>
        <p className="text-sm text-gray-600">
          That&rsquo;s {usd(Math.round(comparison.taxDifference / 12))}/month less in your pocket
        </p>
      </div>

      {/* Side-by-side comparison */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left py-3 px-3 font-medium">Category</th>
              <th className="text-right py-3 px-3 font-medium">W2 Employee</th>
              <th className="text-right py-3 px-3 font-medium">1099 Freelancer</th>
              <th className="text-right py-3 px-3 font-medium hidden sm:table-cell">Difference</th>
            </tr>
          </thead>
          <tbody>
            <CompareRow label="Gross Income" w2={w2.gross.annual} f={freelance.grossIncome} />
            {expenses > 0 && <CompareRow label="Business Expenses" w2={0} f={-freelance.businessExpenses} isNeg />}
            <CompareRow label="Social Security" w2={-w2.socialSecurityTax} f={-freelance.socialSecurityTax} isNeg />
            <CompareRow label="Medicare" w2={-w2.medicareTax} f={-freelance.medicareTax - freelance.additionalMedicareTax} isNeg />
            <CompareRow label="Federal Income Tax" w2={-w2.federalIncomeTax} f={-freelance.federalIncomeTax} isNeg />
            {(w2.stateIncomeTax > 0 || freelance.stateIncomeTax > 0) && (
              <CompareRow label={`${freelance.stateName} Tax`} w2={-w2.stateIncomeTax} f={-freelance.stateIncomeTax} isNeg />
            )}
            <tr className="border-t-2 border-gray-300">
              <td className="py-2 px-3 font-semibold text-gray-900">Total Tax</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-red-600">-{usd(w2.totalTax)}</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-red-600">-{usd(freelance.totalTax)}</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-red-600 hidden sm:table-cell">
                -{usd(comparison.taxDifference)}
              </td>
            </tr>
            <tr className="border-t border-gray-100 bg-green-50">
              <td className="py-2 px-3 font-semibold text-green-700">Take-Home Pay</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-green-700">{usd(w2.takeHome.annual)}</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-green-700">{usd(freelance.takeHomePay)}</td>
              <td className="py-2 px-3 text-right tabular-nums font-semibold text-red-600 hidden sm:table-cell">
                -{usd(comparison.takeHomeDifference)}
              </td>
            </tr>
            <tr className="border-t border-gray-100">
              <td className="py-2 px-3 text-gray-500">Effective Rate</td>
              <td className="py-2 px-3 text-right tabular-nums text-gray-500">{pct(w2.effectiveRate)}</td>
              <td className="py-2 px-3 text-right tabular-nums text-gray-500">{pct(freelance.effectiveRate)}</td>
              <td className="py-2 px-3 text-right tabular-nums text-gray-500 hidden sm:table-cell">
                +{((freelance.effectiveRate - w2.effectiveRate) * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Freelance equivalent */}
      <div className="rounded-xl p-5 mb-6 bg-blue-50 border border-blue-200">
        <p className="text-sm text-gray-600 mb-1">To match your W2 take-home of {usd(w2.takeHome.annual)}</p>
        <p className="text-xl font-bold text-gray-900">
          You&rsquo;d need to charge {usd(comparison.freelanceEquivalent)}/year as a freelancer
        </p>
        <p className="text-sm text-gray-500 mt-1">
          That&rsquo;s about {usd(comparison.freelanceEquivalentHourly)}/hour (40 hrs/week)
        </p>
      </div>
    </div>
  );
}

function CompareRow({ label, w2, f, isNeg = false }: { label: string; w2: number; f: number; isNeg?: boolean }) {
  const diff = f - w2;
  const color = isNeg ? 'text-red-600' : 'text-gray-800';
  const fmt = (v: number) => isNeg ? `-${usd(-v)}` : usd(v);
  const fmtDiff = (d: number) => {
    if (Math.abs(d) < 1) return '$0';
    return d < 0 ? `-${usd(-d)}` : `+${usd(d)}`;
  };

  return (
    <tr className="border-t border-gray-100">
      <td className="py-2 px-3 text-gray-700">{label}</td>
      <td className={`py-2 px-3 text-right tabular-nums ${color}`}>{fmt(w2)}</td>
      <td className={`py-2 px-3 text-right tabular-nums ${color}`}>{fmt(f)}</td>
      <td className={`py-2 px-3 text-right tabular-nums text-gray-500 hidden sm:table-cell`}>{fmtDiff(diff)}</td>
    </tr>
  );
}
