import statesData from '../data/states.json';

const POPULAR_STATES = ['TX', 'CA', 'NY', 'FL', 'IL', 'WA', 'CO', 'AZ', 'GA', 'NC', 'OH', 'PA', 'NJ', 'VA', 'OR'];

export interface ComparisonPair {
  stateA: string; // slug
  stateB: string; // slug
}

export function getAllComparisonSlugs(): string[] {
  const slugs: string[] = [];
  const popularSlugs = POPULAR_STATES
    .map(code => statesData.find(s => s.code === code))
    .filter((s): s is typeof statesData[0] => !!s);

  for (let i = 0; i < popularSlugs.length; i++) {
    for (let j = 0; j < popularSlugs.length; j++) {
      if (i !== j) {
        slugs.push(`${popularSlugs[i].slug}-vs-${popularSlugs[j].slug}`);
      }
    }
  }
  return slugs;
}

export function parseComparisonSlug(slug: string): { stateA: typeof statesData[0]; stateB: typeof statesData[0] } | null {
  const match = /^(.+)-vs-(.+)$/.exec(slug);
  if (!match) return null;

  const stateA = statesData.find(s => s.slug === match[1]);
  const stateB = statesData.find(s => s.slug === match[2]);
  if (!stateA || !stateB) return null;

  return { stateA, stateB };
}

export function getRelatedComparisons(stateSlug: string, limit = 6): string[] {
  return getAllComparisonSlugs()
    .filter(s => s.startsWith(`${stateSlug}-vs-`))
    .slice(0, limit);
}

export { POPULAR_STATES };
