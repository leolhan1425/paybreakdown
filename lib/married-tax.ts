import { STANDARD_DEDUCTION, SOCIAL_SECURITY, MEDICARE, FEDERAL_BRACKETS } from './constants';
import { calculateStateTax } from './state-taxes';

interface Bracket {
  min: number;
  max: number;
  rate: number;
}

function applyBrackets(taxableIncome: number, brackets: Bracket[]): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return round(tax);
}

function calcFICA(gross: number, filingStatus: 'single' | 'married') {
  const ssWages = Math.min(gross, SOCIAL_SECURITY.wageBase);
  const ss = round(ssWages * SOCIAL_SECURITY.rate);
  const threshold = MEDICARE.additionalThreshold[filingStatus];
  let medicare = gross * MEDICARE.rate;
  if (gross > threshold) {
    medicare += (gross - threshold) * MEDICARE.additionalRate;
  }
  return { ss: round(ss), medicare: round(medicare) };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface IndividualBreakdown {
  grossAnnual: number;
  federalIncomeTax: number;
  socialSecurity: number;
  medicare: number;
  stateIncomeTax: number;
  totalTax: number;
  takeHome: number;
  effectiveRate: number;
}

export interface MarriedFilingResult {
  joint: {
    combinedGross: number;
    federalIncomeTax: number;
    person1FICA: { ss: number; medicare: number };
    person2FICA: { ss: number; medicare: number };
    stateIncomeTax: number;
    totalTax: number;
    takeHome: number;
    effectiveRate: number;
  };
  separate: {
    person1: IndividualBreakdown;
    person2: IndividualBreakdown;
    combinedGross: number;
    combinedTax: number;
    combinedTakeHome: number;
    combinedEffectiveRate: number;
  };
  savings: number; // positive = joint is better, negative = separate is better
  betterOption: 'joint' | 'separate' | 'same';
}

export function calculateMarriedFiling(
  salary1: number,
  salary2: number,
  stateCode: string
): MarriedFilingResult {
  const combinedGross = salary1 + salary2;

  // --- JOINT FILING ---
  const jointTaxableIncome = Math.max(0, combinedGross - STANDARD_DEDUCTION.married);
  const jointFederalTax = applyBrackets(jointTaxableIncome, FEDERAL_BRACKETS.married);

  // FICA is always per-individual
  const person1FICAJoint = calcFICA(salary1, 'married');
  const person2FICAJoint = calcFICA(salary2, 'married');
  const totalFICAJoint = round(
    person1FICAJoint.ss + person1FICAJoint.medicare +
    person2FICAJoint.ss + person2FICAJoint.medicare
  );

  // State tax on combined income as married filing jointly
  const jointState = calculateStateTax(combinedGross, stateCode, 'married');
  const jointStateTax = jointState.stateIncomeTax;

  const jointTotalTax = round(jointFederalTax + totalFICAJoint + jointStateTax);
  const jointTakeHome = round(combinedGross - jointTotalTax);

  // --- SEPARATE FILING (MFS) ---
  // Federal: use MFS brackets, each person files individually
  const mfsBrackets = FEDERAL_BRACKETS.marriedFilingSeparately;
  // MFS standard deduction = half of married ($15,000)
  const mfsDeduction = STANDARD_DEDUCTION.married / 2;

  const p1TaxableIncome = Math.max(0, salary1 - mfsDeduction);
  const p1FederalTax = applyBrackets(p1TaxableIncome, mfsBrackets);
  const p1FICA = calcFICA(salary1, 'married');
  // For state MFS, use single brackets as approximation (most states don't have MFS-specific brackets)
  const p1State = calculateStateTax(salary1, stateCode, 'single');

  const p2TaxableIncome = Math.max(0, salary2 - mfsDeduction);
  const p2FederalTax = applyBrackets(p2TaxableIncome, mfsBrackets);
  const p2FICA = calcFICA(salary2, 'married');
  const p2State = calculateStateTax(salary2, stateCode, 'single');

  const p1TotalTax = round(p1FederalTax + p1FICA.ss + p1FICA.medicare + p1State.stateIncomeTax);
  const p2TotalTax = round(p2FederalTax + p2FICA.ss + p2FICA.medicare + p2State.stateIncomeTax);
  const separateTotalTax = round(p1TotalTax + p2TotalTax);
  const separateTakeHome = round(combinedGross - separateTotalTax);

  const savings = round(separateTotalTax - jointTotalTax);

  return {
    joint: {
      combinedGross,
      federalIncomeTax: jointFederalTax,
      person1FICA: person1FICAJoint,
      person2FICA: person2FICAJoint,
      stateIncomeTax: jointStateTax,
      totalTax: jointTotalTax,
      takeHome: jointTakeHome,
      effectiveRate: combinedGross > 0 ? jointTotalTax / combinedGross : 0,
    },
    separate: {
      person1: {
        grossAnnual: salary1,
        federalIncomeTax: p1FederalTax,
        socialSecurity: p1FICA.ss,
        medicare: p1FICA.medicare,
        stateIncomeTax: p1State.stateIncomeTax,
        totalTax: p1TotalTax,
        takeHome: round(salary1 - p1TotalTax),
        effectiveRate: salary1 > 0 ? p1TotalTax / salary1 : 0,
      },
      person2: {
        grossAnnual: salary2,
        federalIncomeTax: p2FederalTax,
        socialSecurity: p2FICA.ss,
        medicare: p2FICA.medicare,
        stateIncomeTax: p2State.stateIncomeTax,
        totalTax: p2TotalTax,
        takeHome: round(salary2 - p2TotalTax),
        effectiveRate: salary2 > 0 ? p2TotalTax / salary2 : 0,
      },
      combinedGross,
      combinedTax: separateTotalTax,
      combinedTakeHome: separateTakeHome,
      combinedEffectiveRate: combinedGross > 0 ? separateTotalTax / combinedGross : 0,
    },
    savings,
    betterOption: savings > 0 ? 'joint' : savings < 0 ? 'separate' : 'same',
  };
}
