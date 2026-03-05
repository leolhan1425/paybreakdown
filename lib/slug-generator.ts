import statesData from '../data/states.json';

// Hourly amounts people actually search for
const HOURLY_AMOUNTS = [
  7.25, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 35, 37, 40,
  42, 45, 48, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
];

// Annual salary amounts people search for
const ANNUAL_AMOUNTS = [
  25000, 30000, 35000, 40000, 45000, 50000, 52000, 55000, 56000, 60000,
  65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000,
  110000, 120000, 130000, 140000, 150000, 175000, 200000, 250000
];

export interface ParsedSlug {
  amount: number;
  period: 'hourly' | 'annual';
  stateCode: string;
  stateName: string;
  stateSlug: string;
}

/**
 * Generate all valid slugs for static page generation.
 * Format: "20-an-hour-in-texas" or "75000-a-year-in-california"
 * Also generates stateless versions: "20-an-hour", "75000-a-year"
 */
export function getAllSlugs(): string[] {
  const slugs: string[] = [];

  for (const state of statesData) {
    for (const amount of HOURLY_AMOUNTS) {
      slugs.push(buildSlug(amount, 'hourly', state.slug));
    }
    for (const amount of ANNUAL_AMOUNTS) {
      slugs.push(buildSlug(amount, 'annual', state.slug));
    }
  }

  // Stateless versions (default to no state tax for general comparison)
  for (const amount of HOURLY_AMOUNTS) {
    slugs.push(buildSlug(amount, 'hourly'));
  }
  for (const amount of ANNUAL_AMOUNTS) {
    slugs.push(buildSlug(amount, 'annual'));
  }

  return slugs;
}

/**
 * Build a URL slug from components.
 * Examples: "20-an-hour-in-texas", "75000-a-year-in-california", "20-an-hour"
 */
export function buildSlug(amount: number, period: 'hourly' | 'annual', stateSlug?: string): string {
  const amountStr = period === 'hourly'
    ? String(amount).replace('.', '-')
    : String(amount);

  const periodStr = period === 'hourly' ? 'an-hour' : 'a-year';

  const base = `${amountStr}-${periodStr}`;
  return stateSlug ? `${base}-in-${stateSlug}` : base;
}

/**
 * Parse a slug back into its components.
 * Returns null if the slug doesn't match any valid pattern.
 */
export function parseSlug(slug: string): ParsedSlug | null {
  // Try hourly with state: "{amount}-an-hour-in-{state}"
  // Try hourly without state: "{amount}-an-hour"
  // Try annual with state: "{amount}-a-year-in-{state}"
  // Try annual without state: "{amount}-a-year"

  const hourlyWithState = /^(.+)-an-hour-in-(.+)$/.exec(slug);
  if (hourlyWithState) {
    const amount = parseAmount(hourlyWithState[1], 'hourly');
    if (amount === null) return null;
    const state = getStateBySlug(hourlyWithState[2]);
    if (!state) return null;
    return { amount, period: 'hourly', stateCode: state.code, stateName: state.name, stateSlug: state.slug };
  }

  const hourlyNoState = /^(.+)-an-hour$/.exec(slug);
  if (hourlyNoState) {
    const amount = parseAmount(hourlyNoState[1], 'hourly');
    if (amount === null) return null;
    // Stateless: use Wyoming (no income tax) as the base, but mark it stateless
    return { amount, period: 'hourly', stateCode: '', stateName: '', stateSlug: '' };
  }

  const annualWithState = /^(\d+)-a-year-in-(.+)$/.exec(slug);
  if (annualWithState) {
    const amount = parseAmount(annualWithState[1], 'annual');
    if (amount === null) return null;
    const state = getStateBySlug(annualWithState[2]);
    if (!state) return null;
    return { amount, period: 'annual', stateCode: state.code, stateName: state.name, stateSlug: state.slug };
  }

  const annualNoState = /^(\d+)-a-year$/.exec(slug);
  if (annualNoState) {
    const amount = parseAmount(annualNoState[1], 'annual');
    if (amount === null) return null;
    return { amount, period: 'annual', stateCode: '', stateName: '', stateSlug: '' };
  }

  return null;
}

function parseAmount(str: string, period: 'hourly' | 'annual'): number | null {
  if (period === 'hourly') {
    // Could be "7-25" (for 7.25) or "20" (for 20)
    const withDecimal = /^(\d+)-(\d+)$/.exec(str);
    if (withDecimal) {
      const num = parseFloat(`${withDecimal[1]}.${withDecimal[2]}`);
      return HOURLY_AMOUNTS.includes(num) ? num : null;
    }
    const plain = /^\d+$/.exec(str);
    if (plain) {
      const num = parseInt(str, 10);
      return HOURLY_AMOUNTS.includes(num) ? num : null;
    }
    return null;
  } else {
    const num = parseInt(str, 10);
    return ANNUAL_AMOUNTS.includes(num) ? num : null;
  }
}

/**
 * Get all state slugs for state hub page generation.
 */
export function getAllStateSlugs(): string[] {
  return statesData.map(s => s.slug);
}

/**
 * Look up a state by its URL slug.
 */
export function getStateBySlug(slug: string) {
  return statesData.find(s => s.slug === slug) ?? null;
}

// Also export the amount arrays so other components can use them
export { HOURLY_AMOUNTS, ANNUAL_AMOUNTS };
