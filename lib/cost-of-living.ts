import metrosData from '../data/metros.json';
import { calculateTakeHome, TaxResult } from './tax-engine';

export interface Metro {
  slug: string;
  name: string;
  fullName: string;
  state: string;
  stateCode: string;
  rpp: number;
  rppHousing: number;
  averageRent1BR: number;
  averageRent2BR: number;
  medianHomePrice: number;
  population: number;
  lat: number;
  lng: number;
}

export interface RelocationResult {
  currentSalary: number;
  currentTakeHome: TaxResult;
  equivalentSalary: number;
  equivalentTakeHome: TaxResult;
  sameSalaryTakeHome: TaxResult;
  colDifference: number;
  colPercentDifference: number;
  taxDifference: number;
  housingPercentDifference: number;
  movingCost: { low: number; mid: number; high: number };
  fromMetro: Metro;
  toMetro: Metro;
}

export function calculateEquivalentSalary(
  currentSalary: number,
  fromMetro: Metro,
  toMetro: Metro,
  filingStatus: 'single' | 'married' = 'single',
): RelocationResult {
  const colAdjustedSalary = Math.round(currentSalary * (toMetro.rpp / fromMetro.rpp));

  const currentTakeHome = calculateTakeHome({ amount: currentSalary, period: 'annual', stateCode: fromMetro.stateCode, filingStatus });
  const equivalentTakeHome = calculateTakeHome({ amount: colAdjustedSalary, period: 'annual', stateCode: toMetro.stateCode, filingStatus });
  const sameSalaryTakeHome = calculateTakeHome({ amount: currentSalary, period: 'annual', stateCode: toMetro.stateCode, filingStatus });

  return {
    currentSalary,
    currentTakeHome,
    equivalentSalary: colAdjustedSalary,
    equivalentTakeHome,
    sameSalaryTakeHome,
    colDifference: colAdjustedSalary - currentSalary,
    colPercentDifference: ((toMetro.rpp / fromMetro.rpp) - 1) * 100,
    taxDifference: sameSalaryTakeHome.takeHome.annual - currentTakeHome.takeHome.annual,
    housingPercentDifference: ((toMetro.rppHousing / fromMetro.rppHousing) - 1) * 100,
    movingCost: estimateMovingCost(fromMetro, toMetro),
    fromMetro,
    toMetro,
  };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateMovingCost(from: Metro, to: Metro): { low: number; mid: number; high: number } {
  const miles = haversineDistance(from.lat, from.lng, to.lat, to.lng);
  if (miles < 100) return { low: 800, mid: 1650, high: 2500 };
  if (miles < 500) return { low: 2000, mid: 3500, high: 5000 };
  if (miles < 1000) return { low: 3000, mid: 5000, high: 7000 };
  if (miles < 2000) return { low: 4000, mid: 6500, high: 9000 };
  return { low: 5000, mid: 8500, high: 12000 };
}

export function getMetroBySlug(slug: string): Metro | null {
  return (metrosData as Metro[]).find(m => m.slug === slug) ?? null;
}

export function getAllMetros(): Metro[] {
  return metrosData as Metro[];
}

export function getMetrosByState(stateCode: string): Metro[] {
  return (metrosData as Metro[]).filter(m => m.stateCode === stateCode);
}
