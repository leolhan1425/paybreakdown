'use client';

import { useState, useMemo } from 'react';
import { calculateMarriedFiling, MarriedFilingResult } from '@/lib/married-tax';
import statesData from '@/data/states.json';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

interface MarriedCalculatorProps {
  initialSalary1?: number;
  initialSalary2?: number;
  initialState?: string;
}

export default function MarriedCalculator({
  initialSalary1 = 75000,
  initialSalary2 = 50000,
  initialState = 'TX',
}: MarriedCalculatorProps) {
  const [salary1, setSalary1] = useState(initialSalary1.toString());
  const [salary2, setSalary2] = useState(initialSalary2.toString());
  const [stateCode, setStateCode] = useState(initialState);

  const sortedStates = useMemo(
    () => [...statesData].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const result: MarriedFilingResult | null = useMemo(() => {
    const s1 = parseInt(salary1) || 0;
    const s2 = parseInt(salary2) || 0;
    if (s1 <= 0 && s2 <= 0) return null;
    return calculateMarriedFiling(s1, s2, stateCode);
  }, [salary1, salary2, stateCode]);

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Spouse 1 Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={salary1}
                onChange={e => setSalary1(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                placeholder="75000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Spouse 2 Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={salary2}
                onChange={e => setSalary2(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                placeholder="50000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
            <select
              value={stateCode}
              onChange={e => setStateCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none bg-white"
            >
              {sortedStates.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary card */}
          <div className={`rounded-xl border-2 p-5 text-center ${
            result.betterOption === 'joint'
              ? 'border-green-300 bg-green-50'
              : result.betterOption === 'separate'
              ? 'border-amber-300 bg-amber-50'
              : 'border-gray-200 bg-gray-50'
          }`}>
            {result.betterOption === 'joint' ? (
              <>
                <p className="text-lg font-bold text-green-800">Filing Jointly saves you {usd(result.savings)}/year</p>
                <p className="text-sm text-green-700 mt-1">Combined take-home: {usd(result.joint.takeHome)} joint vs {usd(result.separate.combinedTakeHome)} separate</p>
              </>
            ) : result.betterOption === 'separate' ? (
              <>
                <p className="text-lg font-bold text-amber-800">Filing Separately saves you {usd(Math.abs(result.savings))}/year</p>
                <p className="text-sm text-amber-700 mt-1">Combined take-home: {usd(result.separate.combinedTakeHome)} separate vs {usd(result.joint.takeHome)} joint</p>
              </>
            ) : (
              <p className="text-lg font-bold text-gray-800">Both options result in the same take-home pay</p>
            )}
          </div>

          {/* Comparison table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Joint */}
            <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${result.betterOption === 'joint' ? 'border-green-300' : 'border-gray-200'}`}>
              <div className={`px-4 py-3 border-b ${result.betterOption === 'joint' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                <h3 className="font-semibold text-gray-900">Married Filing Jointly</h3>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Combined Gross</span>
                  <span className="font-medium tabular-nums">{usd(result.joint.combinedGross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Federal Income Tax</span>
                  <span className="tabular-nums text-red-600">-{usd(result.joint.federalIncomeTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Social Security (both)</span>
                  <span className="tabular-nums text-red-600">-{usd(result.joint.person1FICA.ss + result.joint.person2FICA.ss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medicare (both)</span>
                  <span className="tabular-nums text-red-600">-{usd(result.joint.person1FICA.medicare + result.joint.person2FICA.medicare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">State Income Tax</span>
                  <span className="tabular-nums text-red-600">-{usd(result.joint.stateIncomeTax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                  <span className="text-gray-900">Take-Home Pay</span>
                  <span className="text-green-700 tabular-nums">{usd(result.joint.takeHome)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Effective Rate</span>
                  <span className="tabular-nums">{pct(result.joint.effectiveRate)}</span>
                </div>
              </div>
            </div>

            {/* Separate */}
            <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${result.betterOption === 'separate' ? 'border-amber-300' : 'border-gray-200'}`}>
              <div className={`px-4 py-3 border-b ${result.betterOption === 'separate' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                <h3 className="font-semibold text-gray-900">Married Filing Separately</h3>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Combined Gross</span>
                  <span className="font-medium tabular-nums">{usd(result.separate.combinedGross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Federal Tax (Spouse 1)</span>
                  <span className="tabular-nums text-red-600">-{usd(result.separate.person1.federalIncomeTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Federal Tax (Spouse 2)</span>
                  <span className="tabular-nums text-red-600">-{usd(result.separate.person2.federalIncomeTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FICA (both)</span>
                  <span className="tabular-nums text-red-600">-{usd(
                    result.separate.person1.socialSecurity + result.separate.person1.medicare +
                    result.separate.person2.socialSecurity + result.separate.person2.medicare
                  )}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">State Tax (both)</span>
                  <span className="tabular-nums text-red-600">-{usd(
                    result.separate.person1.stateIncomeTax + result.separate.person2.stateIncomeTax
                  )}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                  <span className="text-gray-900">Take-Home Pay</span>
                  <span className="text-green-700 tabular-nums">{usd(result.separate.combinedTakeHome)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Effective Rate</span>
                  <span className="tabular-nums">{pct(result.separate.combinedEffectiveRate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Per-person breakdown for separate filing */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Individual Breakdown (Filing Separately)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-medium"></th>
                    <th className="text-right py-2 px-2 font-medium">Spouse 1</th>
                    <th className="text-right py-2 pl-2 font-medium">Spouse 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-50">
                    <td className="py-1.5 pr-4 text-gray-600">Gross Salary</td>
                    <td className="text-right py-1.5 px-2 tabular-nums">{usd(result.separate.person1.grossAnnual)}</td>
                    <td className="text-right py-1.5 pl-2 tabular-nums">{usd(result.separate.person2.grossAnnual)}</td>
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-1.5 pr-4 text-gray-600">Federal Tax</td>
                    <td className="text-right py-1.5 px-2 tabular-nums text-red-600">-{usd(result.separate.person1.federalIncomeTax)}</td>
                    <td className="text-right py-1.5 pl-2 tabular-nums text-red-600">-{usd(result.separate.person2.federalIncomeTax)}</td>
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-1.5 pr-4 text-gray-600">Social Security</td>
                    <td className="text-right py-1.5 px-2 tabular-nums text-red-600">-{usd(result.separate.person1.socialSecurity)}</td>
                    <td className="text-right py-1.5 pl-2 tabular-nums text-red-600">-{usd(result.separate.person2.socialSecurity)}</td>
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-1.5 pr-4 text-gray-600">Medicare</td>
                    <td className="text-right py-1.5 px-2 tabular-nums text-red-600">-{usd(result.separate.person1.medicare)}</td>
                    <td className="text-right py-1.5 pl-2 tabular-nums text-red-600">-{usd(result.separate.person2.medicare)}</td>
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-1.5 pr-4 text-gray-600">State Tax</td>
                    <td className="text-right py-1.5 px-2 tabular-nums text-red-600">-{usd(result.separate.person1.stateIncomeTax)}</td>
                    <td className="text-right py-1.5 pl-2 tabular-nums text-red-600">-{usd(result.separate.person2.stateIncomeTax)}</td>
                  </tr>
                  <tr className="border-t border-gray-100 font-semibold">
                    <td className="py-1.5 pr-4 text-gray-900">Take-Home</td>
                    <td className="text-right py-1.5 px-2 tabular-nums text-green-700">{usd(result.separate.person1.takeHome)}</td>
                    <td className="text-right py-1.5 pl-2 tabular-nums text-green-700">{usd(result.separate.person2.takeHome)}</td>
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-1.5 pr-4 text-gray-500 text-xs">Effective Rate</td>
                    <td className="text-right py-1.5 px-2 tabular-nums text-gray-500 text-xs">{pct(result.separate.person1.effectiveRate)}</td>
                    <td className="text-right py-1.5 pl-2 tabular-nums text-gray-500 text-xs">{pct(result.separate.person2.effectiveRate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
