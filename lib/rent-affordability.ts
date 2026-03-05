import { calculateTakeHome } from './tax-engine';
import metrosData from '../data/metros.json';

export interface Metro {
  slug: string;
  name: string;
  fullName: string;
  state: string;
  stateCode: string;
  rent: {
    studio: number;
    oneBed: number;
    twoBed: number;
    threeBed: number;
    fourBed: number;
  };
}

export type ApartmentSize = 'studio' | 'oneBed' | 'twoBed' | 'threeBed' | 'fourBed';

const SIZE_LABELS: Record<ApartmentSize, string> = {
  studio: 'Studio',
  oneBed: '1-Bedroom',
  twoBed: '2-Bedroom',
  threeBed: '3-Bedroom',
  fourBed: '4-Bedroom',
};

export { SIZE_LABELS };

export interface SizeAffordability {
  rent: number;
  affordable: boolean;     // under 30%
  percentOfIncome: number; // e.g. 28.5
  remaining: number;       // monthly take-home minus rent
  verdict: 'comfortable' | 'affordable' | 'tight' | 'stretched' | 'not-affordable';
}

export interface AffordabilityResult {
  salary: number;
  stateCode: string;
  metro: Metro;
  filingStatus: string;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  maxRent30: number;
  maxRent25: number;
  affordability: Record<ApartmentSize, SizeAffordability>;
  salaryNeeded: Record<Exclude<ApartmentSize, 'fourBed'>, number>;
}

function getVerdict(pct: number): SizeAffordability['verdict'] {
  if (pct <= 25) return 'comfortable';
  if (pct <= 30) return 'affordable';
  if (pct <= 35) return 'tight';
  if (pct <= 45) return 'stretched';
  return 'not-affordable';
}

export function calculateAffordability(
  salary: number,
  stateCode: string,
  metro: Metro,
  filingStatus: 'single' | 'married' = 'single'
): AffordabilityResult {
  const taxResult = calculateTakeHome({ amount: salary, period: 'annual', stateCode, filingStatus });
  const takeHomeMonthly = taxResult.takeHome.monthly;

  const maxRent30 = Math.round(takeHomeMonthly * 0.30);
  const maxRent25 = Math.round(takeHomeMonthly * 0.25);

  const checkSize = (rent: number): SizeAffordability => {
    const pct = takeHomeMonthly > 0 ? (rent / takeHomeMonthly) * 100 : 100;
    return {
      rent,
      affordable: pct <= 30,
      percentOfIncome: Math.round(pct * 10) / 10,
      remaining: Math.round(takeHomeMonthly - rent),
      verdict: getVerdict(pct),
    };
  };

  const affordability: Record<ApartmentSize, SizeAffordability> = {
    studio: checkSize(metro.rent.studio),
    oneBed: checkSize(metro.rent.oneBed),
    twoBed: checkSize(metro.rent.twoBed),
    threeBed: checkSize(metro.rent.threeBed),
    fourBed: checkSize(metro.rent.fourBed),
  };

  // Reverse-calc: what salary needed for each size at 30%?
  const calcSalaryNeeded = (rent: number): number => {
    for (let test = 20000; test <= 500000; test += 1000) {
      const r = calculateTakeHome({ amount: test, period: 'annual', stateCode, filingStatus });
      if (r.takeHome.monthly * 0.30 >= rent) return test;
    }
    return 500000;
  };

  return {
    salary,
    stateCode,
    metro,
    filingStatus,
    takeHomeAnnual: taxResult.takeHome.annual,
    takeHomeMonthly: Math.round(takeHomeMonthly),
    maxRent30,
    maxRent25,
    affordability,
    salaryNeeded: {
      studio: calcSalaryNeeded(metro.rent.studio),
      oneBed: calcSalaryNeeded(metro.rent.oneBed),
      twoBed: calcSalaryNeeded(metro.rent.twoBed),
      threeBed: calcSalaryNeeded(metro.rent.threeBed),
    },
  };
}

export function getMetroBySlug(slug: string): Metro | null {
  const m = metrosData.find(m => m.slug === slug);
  if (!m) return null;
  return m as unknown as Metro;
}

export function getAllMetros(): Metro[] {
  return metrosData as unknown as Metro[];
}

export function getTopMetrosByPopulation(n: number): Metro[] {
  return getAllMetros().slice(0, n); // already sorted by population in JSON
}
