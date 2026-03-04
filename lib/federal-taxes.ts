import { STANDARD_DEDUCTION, SOCIAL_SECURITY, MEDICARE, FEDERAL_BRACKETS } from './constants';

export type FilingStatus = 'single' | 'married';

export interface FederalTaxResult {
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalFederalTax: number;
  effectiveFederalRate: number;
  marginalFederalRate: number;
}

function applyBrackets(taxableIncome: number, brackets: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return tax;
}

function getMarginalRate(taxableIncome: number, brackets: { min: number; max: number; rate: number }[]): number {
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) {
      return brackets[i].rate;
    }
  }
  return brackets[0].rate;
}

export function calculateFederalTax(
  grossAnnual: number,
  filingStatus: FilingStatus
): FederalTaxResult {
  if (grossAnnual <= 0) {
    return {
      federalIncomeTax: 0,
      socialSecurityTax: 0,
      medicareTax: 0,
      totalFederalTax: 0,
      effectiveFederalRate: 0,
      marginalFederalRate: 0.10,
    };
  }

  const deduction = STANDARD_DEDUCTION[filingStatus];
  const taxableIncome = Math.max(0, grossAnnual - deduction);
  const brackets = FEDERAL_BRACKETS[filingStatus];

  // Federal income tax via progressive brackets
  const federalIncomeTax = round(applyBrackets(taxableIncome, brackets));

  // Social Security: 6.2% up to wage base
  const ssWages = Math.min(grossAnnual, SOCIAL_SECURITY.wageBase);
  const socialSecurityTax = round(ssWages * SOCIAL_SECURITY.rate);

  // Medicare: 1.45% on all wages, +0.9% above threshold
  const threshold = MEDICARE.additionalThreshold[filingStatus];
  let medicareTax = grossAnnual * MEDICARE.rate;
  if (grossAnnual > threshold) {
    medicareTax += (grossAnnual - threshold) * MEDICARE.additionalRate;
  }
  medicareTax = round(medicareTax);

  const totalFederalTax = round(federalIncomeTax + socialSecurityTax + medicareTax);
  const effectiveFederalRate = totalFederalTax / grossAnnual;
  const marginalFederalRate = getMarginalRate(taxableIncome, brackets);

  return {
    federalIncomeTax,
    socialSecurityTax,
    medicareTax,
    totalFederalTax,
    effectiveFederalRate,
    marginalFederalRate,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
