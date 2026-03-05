'use client';

import { useState, useCallback } from 'react';
import { TaxResult } from '@/lib/tax-engine';
import { ParsedSlug } from '@/lib/slug-generator';
import Calculator from './Calculator';
import CompareCalculator from './CompareCalculator';
import ResultsBreakdown from './ResultsBreakdown';
import SalaryTable from './SalaryTable';

const DEFAULT_VALUES: ParsedSlug & { stateCode: string } = {
  amount: 20,
  period: 'hourly',
  stateCode: 'TX',
  stateName: 'Texas',
  stateSlug: 'texas',
};

interface Props {
  initialResult: TaxResult;
}

export default function HomepageCalculator({ initialResult }: Props) {
  const [mode, setMode] = useState<'calculate' | 'compare'>('calculate');
  const [result, setResult] = useState<TaxResult>(initialResult);
  const [period, setPeriod] = useState<'hourly' | 'annual'>('hourly');

  const handleResultChange = useCallback((r: TaxResult, p: 'hourly' | 'annual') => {
    setResult(r);
    setPeriod(p);
  }, []);

  return (
    <>
      {/* Mode toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setMode('calculate')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === 'calculate' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Calculate
          </button>
          <button
            onClick={() => setMode('compare')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === 'compare' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Compare States
          </button>
        </div>
      </div>

      {mode === 'calculate' ? (
        <>
          <Calculator initialValues={DEFAULT_VALUES} onResultChange={handleResultChange} />
          <ResultsBreakdown result={result} />
          <SalaryTable result={result} period={period} />
        </>
      ) : (
        <CompareCalculator initialStateA="TX" initialStateB="CA" />
      )}
    </>
  );
}
