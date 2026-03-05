import metrosData from '../data/metros.json';
import type { Metro } from './cost-of-living';

const metros = metrosData as Metro[];

// Top 50 metros generate all pairwise pages
const TOP_N = 50;

export function getAllRelocationSlugs(): string[] {
  const top = metros.slice(0, TOP_N);
  const slugs: string[] = [];
  for (const from of top) {
    for (const to of top) {
      if (from.slug !== to.slug) {
        slugs.push(`${from.slug}-to-${to.slug}`);
      }
    }
  }
  return slugs;
}

export function parseRelocationSlug(slug: string): { from: Metro; to: Metro } | null {
  // Try every possible split point of "-to-" in the slug
  const marker = '-to-';
  let idx = slug.indexOf(marker);
  while (idx !== -1) {
    const fromSlug = slug.slice(0, idx);
    const toSlug = slug.slice(idx + marker.length);
    const from = metros.find(m => m.slug === fromSlug);
    const to = metros.find(m => m.slug === toSlug);
    if (from && to) return { from, to };
    idx = slug.indexOf(marker, idx + 1);
  }
  return null;
}

export function buildRelocationSlug(from: Metro, to: Metro): string {
  return `${from.slug}-to-${to.slug}`;
}

export function getRelatedRelocations(metroSlug: string, direction: 'from' | 'to', limit = 6): string[] {
  const pattern = direction === 'from' ? `${metroSlug}-to-` : `-to-${metroSlug}`;
  return getAllRelocationSlugs()
    .filter(s => direction === 'from' ? s.startsWith(pattern) : s.endsWith(pattern))
    .slice(0, limit);
}
