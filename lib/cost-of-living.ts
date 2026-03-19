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
  const currentTakeHome = calculateTakeHome({ amount: currentSalary, period: 'annual', stateCode: fromMetro.stateCode, filingStatus });
  const targetPurchasingPower = currentTakeHome.takeHome.annual / (fromMetro.rpp / 100);

  // Binary search: find gross salary in City B where purchasing power matches
  const equivalentSalary = findEquivalentGross(targetPurchasingPower, toMetro.stateCode, toMetro.rpp, filingStatus);

  const equivalentTakeHome = calculateTakeHome({ amount: equivalentSalary, period: 'annual', stateCode: toMetro.stateCode, filingStatus });
  const sameSalaryTakeHome = calculateTakeHome({ amount: currentSalary, period: 'annual', stateCode: toMetro.stateCode, filingStatus });

  return {
    currentSalary,
    currentTakeHome,
    equivalentSalary,
    equivalentTakeHome,
    sameSalaryTakeHome,
    colDifference: equivalentSalary - currentSalary,
    colPercentDifference: ((toMetro.rpp / fromMetro.rpp) - 1) * 100,
    taxDifference: sameSalaryTakeHome.takeHome.annual - currentTakeHome.takeHome.annual,
    housingPercentDifference: ((toMetro.rppHousing / fromMetro.rppHousing) - 1) * 100,
    movingCost: estimateMovingCost(fromMetro, toMetro),
    fromMetro,
    toMetro,
  };
}

export function findEquivalentGross(
  targetPurchasingPower: number,
  stateCode: string,
  rpp: number,
  filingStatus: 'single' | 'married',
): number {
  let low = 10000;
  let high = 500000;
  for (let i = 0; i < 50; i++) {
    const mid = Math.round((low + high) / 2);
    const takeHome = calculateTakeHome({ amount: mid, period: 'annual', stateCode, filingStatus });
    const pp = takeHome.takeHome.annual / (rpp / 100);
    if (pp < targetPurchasingPower) {
      low = mid;
    } else {
      high = mid;
    }
    if (high - low <= 100) break;
  }
  return Math.round((low + high) / 2);
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
