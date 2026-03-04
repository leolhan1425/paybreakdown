'use client';

import { useState, useCallback } from 'react';
import { TaxResult } from '@/lib/tax-engine';
import { ParsedSlug } from '@/lib/slug-generator';
import Calculator from './Calculator';
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
  const [result, setResult] = useState<TaxResult>(initialResult);
  const [period, setPeriod] = useState<'hourly' | 'annual'>('hourly');

  const handleResultChange = useCallback((r: TaxResult, p: 'hourly' | 'annual') => {
    setResult(r);
    setPeriod(p);
  }, []);

  return (
    <>
      <Calculator initialValues={DEFAULT_VALUES} onResultChange={handleResultChange} />
      {/* AD SLOT: below-calculator */}
      <ResultsBreakdown result={result} />
      <SalaryTable result={result} period={period} />
    </>
  );
}
