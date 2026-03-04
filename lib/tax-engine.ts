import { calculateFederalTax } from './federal-taxes';
import { calculateStateTax } from './state-taxes';

export type { FilingStatus } from './federal-taxes';

export interface TaxInput {
  amount: number;
  period: 'hourly' | 'annual';
  hoursPerWeek?: number;
  weeksPerYear?: number;
  stateCode: string;
  filingStatus: 'single' | 'married';
}

export interface PayBreakdown {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  annual: number;
}

export interface TaxResult {
  gross: PayBreakdown;
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateIncomeTax: number;
  totalTax: number;
  takeHome: PayBreakdown;
  effectiveRate: number;
  marginalRate: number;
  stateName: string;
  hasStateTax: boolean;
}

export function calculateTakeHome(input: TaxInput): TaxResult {
  const hoursPerWeek = input.hoursPerWeek ?? 40;
  const weeksPerYear = input.weeksPerYear ?? 52;

  const grossAnnual = input.period === 'hourly'
    ? input.amount * hoursPerWeek * weeksPerYear
    : input.amount;

  const federal = calculateFederalTax(grossAnnual, input.filingStatus);
  const state = calculateStateTax(grossAnnual, input.stateCode, input.filingStatus);

  const totalTax = round(federal.totalFederalTax + state.stateIncomeTax);
  const netAnnual = round(grossAnnual - totalTax);

  const gross = buildPayBreakdown(grossAnnual, hoursPerWeek);
  const takeHome = buildPayBreakdown(netAnnual, hoursPerWeek);

  return {
    gross,
    federalIncomeTax: federal.federalIncomeTax,
    socialSecurityTax: federal.socialSecurityTax,
    medicareTax: federal.medicareTax,
    stateIncomeTax: state.stateIncomeTax,
    totalTax,
    takeHome,
    effectiveRate: grossAnnual > 0 ? totalTax / grossAnnual : 0,
    marginalRate: federal.marginalFederalRate,
    stateName: state.stateName,
    hasStateTax: state.hasIncomeTax,
  };
}

function buildPayBreakdown(annual: number, hoursPerWeek: number): PayBreakdown {
  return {
    annual: round(annual),
    monthly: round(annual / 12),
    biweekly: round(annual / 26),
    weekly: round(annual / 52),
    daily: round(annual / 260),
    hourly: round(annual / (hoursPerWeek * 52)),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
