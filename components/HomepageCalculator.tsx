'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TaxResult } from '@/lib/tax-engine';
import { ParsedSlug } from '@/lib/slug-generator';
import Calculator from './Calculator';
import CompareCalculator from './CompareCalculator';
import ResultsBreakdown from './ResultsBreakdown';
import SalaryTable from './SalaryTable';

const DonutChart = dynamic(() => import('./DonutChart'), { ssr: false });

const DEFAULT_VALUES: ParsedSlug & { stateCode: string } = {
  amount: 20,
  period: 'hourly',
  stateCode: 'TX',
  stateName: 'Texas',
  stateSlug: 'texas',
};

interface Props {
  initialResult: TaxResult;
  lang?: 'en' | 'es';
}

export default function HomepageCalculator({ initialResult, lang = 'en' }: Props) {
  const [mode, setMode] = useState<'calculate' | 'compare'>('calculate');
  const [result, setResult] = useState<TaxResult>(initialResult);
  const [period, setPeriod] = useState<'hourly' | 'annual'>('hourly');

  const handleResultChange = useCallback((r: TaxResult, p: 'hourly' | 'annual') => {
    setResult(r);
    setPeriod(p);
  }, []);

  const calcLabel = lang === 'es' ? 'Calcular' : 'Calculate';
  const compareLabel = lang === 'es' ? 'Comparar Estados' : 'Compare States';

  return (
    <>
      {/* Mode toggle */}
      <div className="flex mb-4 rounded-xl overflow-hidden border border-gray-200">
        <button
          onClick={() => setMode('calculate')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
            mode === 'calculate' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M8 6h8M8 10h8M8 14h4M8 18h4M14 14h2M14 18h2" />
          </svg>
          {calcLabel}
        </button>
        <button
          onClick={() => setMode('compare')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
            mode === 'compare' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
          </svg>
          {compareLabel}
        </button>
      </div>

      {mode === 'calculate' ? (
        <>
          <Calculator initialValues={DEFAULT_VALUES} onResultChange={handleResultChange} lang={lang} />
          <ResultsBreakdown result={result} lang={lang} />
          <DonutChart result={result} />
          <div className="mb-6" />
          <SalaryTable result={result} period={period} lang={lang} />
        </>
      ) : (
        <CompareCalculator initialStateA="TX" initialStateB="CA" />
      )}
    </>
  );
}
