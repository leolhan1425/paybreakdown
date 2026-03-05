import { getAllMetros, getMetroBySlug, Metro } from './rent-affordability';

const SALARY_LEVELS = [25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 100000, 125000, 150000];
const TOP_N_METROS = 50;

export { SALARY_LEVELS };

export interface ParsedAffordSlug {
  type: 'salary-city' | 'city-only';
  salary?: number;
  metro: Metro;
}

export function getAllAffordSlugs(): string[] {
  const metros = getAllMetros().slice(0, TOP_N_METROS);
  const slugs: string[] = [];

  for (const salary of SALARY_LEVELS) {
    for (const metro of metros) {
      slugs.push(`${salary}-in-${metro.slug}`);
    }
  }

  for (const metro of metros) {
    slugs.push(metro.slug);
  }

  return slugs;
}

export function parseAffordSlug(slug: string): ParsedAffordSlug | null {
  // Try salary-city: "50000-in-austin-tx"
  const salaryMatch = /^(\d+)-in-(.+)$/.exec(slug);
  if (salaryMatch) {
    const salary = parseInt(salaryMatch[1], 10);
    const metro = getMetroBySlug(salaryMatch[2]);
    if (metro && SALARY_LEVELS.includes(salary)) {
      return { type: 'salary-city', salary, metro };
    }
    return null;
  }

  // Try city-only: "austin-tx"
  const metro = getMetroBySlug(slug);
  if (metro) {
    return { type: 'city-only', metro };
  }

  return null;
}
