import statesData from '../data/states.json';
import { HOURLY_AMOUNTS, ANNUAL_AMOUNTS, ParsedSlug } from './slug-generator';

/**
 * Build a Spanish URL slug.
 * "20-la-hora-en-texas", "75000-al-ano-en-california", "20-la-hora"
 */
export function buildSpanishSlug(amount: number, period: 'hourly' | 'annual', stateSlug?: string): string {
  const amountStr = period === 'hourly'
    ? String(amount).replace('.', '-')
    : String(amount);

  const periodStr = period === 'hourly' ? 'la-hora' : 'al-ano';
  const base = `${amountStr}-${periodStr}`;
  return stateSlug ? `${base}-en-${stateSlug}` : base;
}

/**
 * Parse a Spanish slug back into components.
 */
export function parseSpanishSlug(slug: string): ParsedSlug | null {
  // Hourly with state: "{amount}-la-hora-en-{state}"
  const hourlyWithState = /^(.+)-la-hora-en-(.+)$/.exec(slug);
  if (hourlyWithState) {
    const amount = parseAmount(hourlyWithState[1], 'hourly');
    if (amount === null) return null;
    const state = getStateBySlug(hourlyWithState[2]);
    if (!state) return null;
    return { amount, period: 'hourly', stateCode: state.code, stateName: state.name, stateSlug: state.slug };
  }

  // Hourly without state: "{amount}-la-hora"
  const hourlyNoState = /^(.+)-la-hora$/.exec(slug);
  if (hourlyNoState) {
    const amount = parseAmount(hourlyNoState[1], 'hourly');
    if (amount === null) return null;
    return { amount, period: 'hourly', stateCode: '', stateName: '', stateSlug: '' };
  }

  // Annual with state: "{amount}-al-ano-en-{state}"
  const annualWithState = /^(\d+)-al-ano-en-(.+)$/.exec(slug);
  if (annualWithState) {
    const amount = parseAmount(annualWithState[1], 'annual');
    if (amount === null) return null;
    const state = getStateBySlug(annualWithState[2]);
    if (!state) return null;
    return { amount, period: 'annual', stateCode: state.code, stateName: state.name, stateSlug: state.slug };
  }

  // Annual without state: "{amount}-al-ano"
  const annualNoState = /^(\d+)-al-ano$/.exec(slug);
  if (annualNoState) {
    const amount = parseAmount(annualNoState[1], 'annual');
    if (amount === null) return null;
    return { amount, period: 'annual', stateCode: '', stateName: '', stateSlug: '' };
  }

  return null;
}

function parseAmount(str: string, period: 'hourly' | 'annual'): number | null {
  if (period === 'hourly') {
    // "7-25" → 7.25, "20" → 20
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

function getStateBySlug(slug: string) {
  return statesData.find(s => s.slug === slug) ?? null;
}

/**
 * Generate all Spanish salary slugs (~3,400).
 */
export function getAllSpanishSlugs(): string[] {
  const slugs: string[] = [];

  for (const state of statesData) {
    for (const amount of HOURLY_AMOUNTS) {
      slugs.push(buildSpanishSlug(amount, 'hourly', state.slug));
    }
    for (const amount of ANNUAL_AMOUNTS) {
      slugs.push(buildSpanishSlug(amount, 'annual', state.slug));
    }
  }

  // Stateless versions
  for (const amount of HOURLY_AMOUNTS) {
    slugs.push(buildSpanishSlug(amount, 'hourly'));
  }
  for (const amount of ANNUAL_AMOUNTS) {
    slugs.push(buildSpanishSlug(amount, 'annual'));
  }

  return slugs;
}

/**
 * Convert an English slug to its Spanish equivalent.
 */
export function englishToSpanishSlug(englishSlug: string): string {
  // "20-an-hour-in-texas" → "20-la-hora-en-texas"
  return englishSlug
    .replace(/-an-hour-in-/, '-la-hora-en-')
    .replace(/-an-hour$/, '-la-hora')
    .replace(/-a-year-in-/, '-al-ano-en-')
    .replace(/-a-year$/, '-al-ano');
}

/**
 * Convert a Spanish slug to its English equivalent.
 */
export function spanishToEnglishSlug(spanishSlug: string): string {
  return spanishSlug
    .replace(/-la-hora-en-/, '-an-hour-in-')
    .replace(/-la-hora$/, '-an-hour')
    .replace(/-al-ano-en-/, '-a-year-in-')
    .replace(/-al-ano$/, '-a-year');
}
