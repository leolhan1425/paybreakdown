'use client';

import { useState, useCallback } from 'react';
import { TaxResult } from '@/lib/tax-engine';
import { ParsedSlug } from '@/lib/slug-generator';
import Calculator from './Calculator';
import ResultsBreakdown from './ResultsBreakdown';

interface Props {
  stateCode: string;
  stateName: string;
  stateSlug: string;
  initialResult: TaxResult;
}

export default function StatePageClient({ stateCode, stateName, stateSlug, initialResult }: Props) {
  const [result, setResult] = useState<TaxResult>(initialResult);

  const initialValues: ParsedSlug & { stateCode: string } = {
    amount: 20,
    period: 'hourly',
    stateCode,
    stateName,
    stateSlug,
  };

  const handleResultChange = useCallback((r: TaxResult) => {
    setResult(r);
  }, []);

  return (
    <>
      <Calculator initialValues={initialValues} onResultChange={handleResultChange} />
      <ResultsBreakdown result={result} />
    </>
  );
}
