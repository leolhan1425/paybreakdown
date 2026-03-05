import statesData from '../data/states.json';

const INCOME_LEVELS = [25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 90000, 100000, 110000, 120000, 150000, 175000, 200000, 250000];

export { INCOME_LEVELS };

export interface ParsedFreelanceSlug {
  type: 'income-state' | 'state-only';
  income?: number;
  state: typeof statesData[0];
}

export function getAllFreelanceSlugs(): string[] {
  const slugs: string[] = [];

  for (const income of INCOME_LEVELS) {
    for (const state of statesData) {
      slugs.push(`${income}-in-${state.slug}`);
    }
  }

  for (const state of statesData) {
    slugs.push(state.slug);
  }

  return slugs;
}

export function parseFreelanceSlug(slug: string): ParsedFreelanceSlug | null {
  // Try income-state format: "75000-in-texas"
  const incomeMatch = /^(\d+)-in-(.+)$/.exec(slug);
  if (incomeMatch) {
    const income = parseInt(incomeMatch[1], 10);
    const state = statesData.find(s => s.slug === incomeMatch[2]);
    if (state && INCOME_LEVELS.includes(income)) {
      return { type: 'income-state', income, state };
    }
    return null;
  }

  // Try state-only format: "texas"
  const state = statesData.find(s => s.slug === slug);
  if (state) {
    return { type: 'state-only', state };
  }

  return null;
}
