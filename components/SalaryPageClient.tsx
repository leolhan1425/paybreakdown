'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TaxResult } from '@/lib/tax-engine';
import { ParsedSlug } from '@/lib/slug-generator';
import Calculator from './Calculator';
import ResultsBreakdown from './ResultsBreakdown';
import SalaryTable from './SalaryTable';

// Lazy-load charts — Recharts is large and these are below the fold
const DonutChart = dynamic(() => import('./DonutChart'), { ssr: false });
const ComparisonBar = dynamic(() => import('./ComparisonBar'), { ssr: false });

interface Props {
  initialResult: TaxResult;
  initialParsed: ParsedSlug & { stateCode: string };
}

export default function SalaryPageClient({ initialResult, initialParsed }: Props) {
  const [result, setResult] = useState<TaxResult>(initialResult);
  const [period, setPeriod] = useState<'hourly' | 'annual'>(initialParsed.period);

  const handleResultChange = useCallback((r: TaxResult, p: 'hourly' | 'annual') => {
    setResult(r);
    setPeriod(p);
  }, []);

  return (
    <>
      <Calculator initialValues={initialParsed} onResultChange={handleResultChange} />

      <ResultsBreakdown result={result} />

      {/* Ad slot 1 */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DonutChart result={result} />
        <ComparisonBar result={result} />
      </div>

      <SalaryTable result={result} period={period} />

      {/* Ad slot 2 */}
    </>
  );
}
