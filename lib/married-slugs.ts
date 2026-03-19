import { getAllStates } from './state-taxes';

// 20 salary pairs covering common dual-income scenarios
const SALARY_PAIRS: [number, number][] = [
  [30000, 30000],
  [40000, 30000],
  [40000, 40000],
  [50000, 30000],
  [50000, 40000],
  [50000, 50000],
  [60000, 40000],
  [60000, 50000],
  [60000, 60000],
  [75000, 50000],
  [75000, 60000],
  [75000, 75000],
  [80000, 50000],
  [80000, 60000],
  [90000, 60000],
  [100000, 50000],
  [100000, 75000],
  [100000, 100000],
  [120000, 80000],
  [150000, 100000],
];

function formatSalary(amount: number): string {
  return `${amount / 1000}k`;
}

export function buildMarriedSlug(salary1: number, salary2: number, stateSlug: string): string {
  return `${formatSalary(salary1)}-and-${formatSalary(salary2)}-in-${stateSlug}`;
}

export interface ParsedMarriedSlug {
  salary1: number;
  salary2: number;
  stateSlug: string;
}

export function parseMarriedSlug(slug: string): ParsedMarriedSlug | null {
  const match = slug.match(/^(\d+)k-and-(\d+)k-in-(.+)$/);
  if (!match) return null;
  return {
    salary1: parseInt(match[1]) * 1000,
    salary2: parseInt(match[2]) * 1000,
    stateSlug: match[3],
  };
}

export function getAllMarriedSlugs(): string[] {
  const states = getAllStates();
  const slugs: string[] = [];

  for (const pair of SALARY_PAIRS) {
    for (const state of states) {
      slugs.push(buildMarriedSlug(pair[0], pair[1], state.slug));
    }
  }

  return slugs;
}

export function getSalaryPairs(): [number, number][] {
  return SALARY_PAIRS;
}
