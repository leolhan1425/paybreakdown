import { STANDARD_DEDUCTION, SOCIAL_SECURITY, MEDICARE, FEDERAL_BRACKETS } from './constants';
import { calculateStateTax } from './state-taxes';
import { calculateTakeHome, TaxResult } from './tax-engine';

export interface SelfEmploymentTaxResult {
  grossIncome: number;
  businessExpenses: number;
  netSelfEmploymentIncome: number;

  // SE tax
  seTaxableIncome: number;       // 92.35% of net SE income
  socialSecurityTax: number;     // 12.4% up to SS wage base
  medicareTax: number;           // 2.9% on all
  additionalMedicareTax: number; // 0.9% over threshold
  totalSelfEmploymentTax: number;

  // Deductions
  seTaxDeduction: number;        // half of SE tax
  adjustedGrossIncome: number;

  // Income taxes
  federalIncomeTax: number;
  stateIncomeTax: number;

  // Totals
  totalTax: number;
  takeHomePay: number;
  effectiveRate: number;

  stateName: string;
  hasStateTax: boolean;
}

export interface FreelanceComparison {
  w2: TaxResult;
  freelance: SelfEmploymentTaxResult;
  taxDifference: number;         // positive = freelancer pays more
  takeHomeDifference: number;    // positive = W2 takes home more
  freelanceEquivalent: number;   // gross a freelancer needs to match W2 take-home
  freelanceEquivalentHourly: number;
}

function applyBrackets(taxableIncome: number, brackets: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return Math.round(tax * 100) / 100;
}

export function calculate1099Tax(
  grossIncome: number,
  stateCode: string,
  filingStatus: 'single' | 'married' = 'single',
  businessExpenses: number = 0
): SelfEmploymentTaxResult {
  const netSEIncome = Math.max(0, grossIncome - businessExpenses);

  // IRS Schedule SE: multiply net SE earnings by 92.35%
  const seTaxableIncome = netSEIncome * 0.9235;

  // Social Security: 12.4% on first $176,100
  const socialSecurityTax = Math.round(Math.min(seTaxableIncome, SOCIAL_SECURITY.wageBase) * 0.124 * 100) / 100;

  // Medicare: 2.9% on all SE income
  const medicareTax = Math.round(seTaxableIncome * 0.029 * 100) / 100;

  // Additional Medicare: 0.9% over threshold
  const threshold = MEDICARE.additionalThreshold[filingStatus];
  const additionalMedicareTax = seTaxableIncome > threshold
    ? Math.round((seTaxableIncome - threshold) * 0.009 * 100) / 100
    : 0;

  const totalSETax = Math.round((socialSecurityTax + medicareTax + additionalMedicareTax) * 100) / 100;

  // Deduct half of SE tax from AGI
  const seTaxDeduction = Math.round(totalSETax / 2 * 100) / 100;
  const adjustedGrossIncome = Math.max(0, netSEIncome - seTaxDeduction);

  // Federal income tax on adjusted AGI
  const deduction = STANDARD_DEDUCTION[filingStatus];
  const taxableIncome = Math.max(0, adjustedGrossIncome - deduction);
  const federalIncomeTax = applyBrackets(taxableIncome, FEDERAL_BRACKETS[filingStatus]);

  // State income tax on adjusted AGI
  const stateResult = calculateStateTax(adjustedGrossIncome, stateCode, filingStatus);

  const totalTax = Math.round((totalSETax + federalIncomeTax + stateResult.stateIncomeTax) * 100) / 100;
  const takeHomePay = Math.round((grossIncome - businessExpenses - totalTax) * 100) / 100;

  return {
    grossIncome,
    businessExpenses,
    netSelfEmploymentIncome: netSEIncome,
    seTaxableIncome: Math.round(seTaxableIncome * 100) / 100,
    socialSecurityTax,
    medicareTax,
    additionalMedicareTax,
    totalSelfEmploymentTax: totalSETax,
    seTaxDeduction,
    adjustedGrossIncome: Math.round(adjustedGrossIncome * 100) / 100,
    federalIncomeTax,
    stateIncomeTax: stateResult.stateIncomeTax,
    totalTax,
    takeHomePay,
    effectiveRate: grossIncome > 0 ? totalTax / grossIncome : 0,
    stateName: stateResult.stateName,
    hasStateTax: stateResult.hasIncomeTax,
  };
}

// What gross does a freelancer need to match a given W2 take-home?
function calculateFreelanceEquivalent(
  targetTakeHome: number,
  stateCode: string,
  filingStatus: 'single' | 'married'
): number {
  // Binary search for efficiency
  let lo = targetTakeHome;
  let hi = targetTakeHome * 2;
  for (let i = 0; i < 30; i++) {
    const mid = Math.round((lo + hi) / 2);
    const result = calculate1099Tax(mid, stateCode, filingStatus);
    if (result.takeHomePay >= targetTakeHome) {
      hi = mid;
    } else {
      lo = mid;
    }
    if (hi - lo <= 500) break;
  }
  // Round to nearest $500
  return Math.ceil(hi / 500) * 500;
}

export function compare1099vsW2(
  income: number,
  stateCode: string,
  filingStatus: 'single' | 'married' = 'single',
  businessExpenses: number = 0
): FreelanceComparison {
  const w2 = calculateTakeHome({ amount: income, period: 'annual', stateCode, filingStatus });
  const freelance = calculate1099Tax(income, stateCode, filingStatus, businessExpenses);

  const equiv = calculateFreelanceEquivalent(w2.takeHome.annual, stateCode, filingStatus);

  return {
    w2,
    freelance,
    taxDifference: Math.round((freelance.totalTax - w2.totalTax) * 100) / 100,
    takeHomeDifference: Math.round((w2.takeHome.annual - freelance.takeHomePay) * 100) / 100,
    freelanceEquivalent: equiv,
    freelanceEquivalentHourly: Math.round(equiv / 2080 * 100) / 100,
  };
}
