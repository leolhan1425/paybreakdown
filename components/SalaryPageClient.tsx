'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TaxResult } from '@/lib/tax-engine';
import { ParsedSlug } from '@/lib/slug-generator';
import Calculator from './Calculator';
import ResultsBreakdown from './ResultsBreakdown';
import SalaryTable from './SalaryTable';

const DonutChart = dynamic(() => import('./DonutChart'), { ssr: false });
const ComparisonBar = dynamic(() => import('./ComparisonBar'), { ssr: false });

interface Props {
  initialResult: TaxResult;
  initialParsed: ParsedSlug & { stateCode: string };
  lang?: 'en' | 'es';
}

export default function SalaryPageClient({ initialResult, initialParsed, lang = 'en' }: Props) {
  const [result, setResult] = useState<TaxResult>(initialResult);
  const [period, setPeriod] = useState<'hourly' | 'annual'>(initialParsed.period);

  const handleResultChange = useCallback((r: TaxResult, p: 'hourly' | 'annual') => {
    setResult(r);
    setPeriod(p);
  }, []);

  return (
    <>
      <Calculator initialValues={initialParsed} onResultChange={handleResultChange} lang={lang} />

      <ResultsBreakdown result={result} lang={lang} />

      {/* Ad slot 1 */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DonutChart result={result} />
        <ComparisonBar result={result} />
      </div>

      <SalaryTable result={result} period={period} lang={lang} />

      {/* Ad slot 2 */}
    </>
  );
}
