import statesData from '../data/states.json';

type FilingStatus = 'single' | 'married';

interface StateBracket {
  min: number;
  max: number | null;
  rate: number;
}

interface StateEntry {
  code: string;
  name: string;
  slug: string;
  hasIncomeTax: boolean;
  taxType?: 'flat' | 'progressive';
  flatRate?: number;
  brackets?: {
    single: StateBracket[];
    married: StateBracket[];
  };
}

export interface StateTaxResult {
  stateName: string;
  stateIncomeTax: number;
  effectiveStateRate: number;
  hasIncomeTax: boolean;
}

function applyStateBrackets(income: number, brackets: StateBracket[]): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    const ceiling = bracket.max ?? Infinity;
    const taxableInBracket = Math.min(income, ceiling) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return Math.round(tax * 100) / 100;
}

export function calculateStateTax(
  grossAnnual: number,
  stateCode: string,
  filingStatus: FilingStatus
): StateTaxResult {
  const state = (statesData as StateEntry[]).find(s => s.code === stateCode);

  if (!state) {
    throw new Error(`Unknown state code: ${stateCode}`);
  }

  if (!state.hasIncomeTax || grossAnnual <= 0) {
    return {
      stateName: state.name,
      stateIncomeTax: 0,
      effectiveStateRate: 0,
      hasIncomeTax: state.hasIncomeTax,
    };
  }

  let stateIncomeTax: number;

  if (state.taxType === 'flat' && state.flatRate !== undefined) {
    stateIncomeTax = Math.round(grossAnnual * state.flatRate * 100) / 100;
  } else if (state.taxType === 'progressive' && state.brackets) {
    const brackets = state.brackets[filingStatus];
    stateIncomeTax = applyStateBrackets(grossAnnual, brackets);
  } else {
    stateIncomeTax = 0;
  }

  return {
    stateName: state.name,
    stateIncomeTax,
    effectiveStateRate: grossAnnual > 0 ? stateIncomeTax / grossAnnual : 0,
    hasIncomeTax: true,
  };
}

export function getStateBySlug(slug: string): StateEntry | undefined {
  return (statesData as StateEntry[]).find(s => s.slug === slug);
}

export function getStateByCode(code: string): StateEntry | undefined {
  return (statesData as StateEntry[]).find(s => s.code === code);
}

export function getAllStates(): StateEntry[] {
  return statesData as StateEntry[];
}
