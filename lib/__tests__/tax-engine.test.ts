import { calculateTakeHome } from '../tax-engine';
import { calculateFederalTax } from '../federal-taxes';
import { calculateStateTax, getAllStates } from '../state-taxes';

function assertClose(actual: number, expected: number, tolerance: number, label: string) {
  const diff = Math.abs(actual - expected);
  const pct = expected !== 0 ? (diff / expected) * 100 : diff;
  const pass = pct <= tolerance * 100;
  const status = pass ? 'PASS' : 'FAIL';
  console.log(`  ${status}: ${label} = $${actual.toFixed(2)} (expected ~$${expected.toFixed(2)}, diff ${pct.toFixed(1)}%)`);
  if (!pass) {
    process.exitCode = 1;
  }
}

function assertExact(actual: number, expected: number, label: string) {
  const pass = actual === expected;
  const status = pass ? 'PASS' : 'FAIL';
  console.log(`  ${status}: ${label} = ${actual} (expected ${expected})`);
  if (!pass) {
    process.exitCode = 1;
  }
}

console.log('\n=== Tax Engine Tests ===\n');

// Test 1: $20/hr in Texas (no state tax, single)
console.log('Test 1: $20/hr in Texas, single');
const t1 = calculateTakeHome({ amount: 20, period: 'hourly', stateCode: 'TX', filingStatus: 'single' });
assertExact(t1.gross.annual, 41600, 'Gross annual');
assertExact(t1.stateIncomeTax, 0, 'State tax');
assertClose(t1.federalIncomeTax, 3100, 0.15, 'Federal income tax');
assertClose(t1.takeHome.annual, 34500, 0.05, 'Take-home annual');
console.log();

// Test 2: $75,000/yr in California, single
console.log('Test 2: $75,000/yr in California, single');
const t2 = calculateTakeHome({ amount: 75000, period: 'annual', stateCode: 'CA', filingStatus: 'single' });
assertClose(t2.stateIncomeTax, 3000, 0.30, 'CA state tax');
assertClose(t2.takeHome.annual, 56000, 0.05, 'Take-home annual');
console.log();

// Test 3: $150,000/yr in New York, single
console.log('Test 3: $150,000/yr in New York, single');
const t3 = calculateTakeHome({ amount: 150000, period: 'annual', stateCode: 'NY', filingStatus: 'single' });
assertClose(t3.federalIncomeTax, 24000, 0.10, 'Federal income tax');
assertClose(t3.stateIncomeTax, 7500, 0.15, 'NY state tax');
assertClose(t3.takeHome.annual, 103000, 0.05, 'Take-home annual');
console.log();

// Test 4: $250,000/yr in Florida, single
console.log('Test 4: $250,000/yr in Florida, single');
const t4 = calculateTakeHome({ amount: 250000, period: 'annual', stateCode: 'FL', filingStatus: 'single' });
assertExact(t4.stateIncomeTax, 0, 'State tax');
// SS should cap at wage base ($176,100 * 6.2% = $10,918.20)
assertClose(t4.socialSecurityTax, 10918.20, 0.01, 'Social Security (capped)');
// Medicare: 1.45% on $250k + 0.9% on $50k above $200k threshold
const expectedMedicare = 250000 * 0.0145 + 50000 * 0.009;
assertClose(t4.medicareTax, expectedMedicare, 0.01, 'Medicare (with additional)');
console.log();

// Test 5: $0 income
console.log('Test 5: $0 income');
const t5 = calculateTakeHome({ amount: 0, period: 'annual', stateCode: 'CA', filingStatus: 'single' });
assertExact(t5.totalTax, 0, 'Total tax');
assertExact(t5.takeHome.annual, 0, 'Take-home');
assertExact(t5.federalIncomeTax, 0, 'Federal tax');
assertExact(t5.stateIncomeTax, 0, 'State tax');
console.log();

// Test 6: $500,000/yr in California, single (top brackets)
console.log('Test 6: $500,000/yr in California, single');
const t6 = calculateTakeHome({ amount: 500000, period: 'annual', stateCode: 'CA', filingStatus: 'single' });
assertClose(t6.stateIncomeTax, 45108, 0.05, 'CA state tax (high income)');
assertClose(t6.takeHome.annual, 294727, 0.05, 'Take-home annual');
console.log();

// Test 7: Verify all 51 states load without errors
console.log('Test 7: All states load');
const states = getAllStates();
assertExact(states.length, 51, 'State count (50 + DC)');

let stateErrors = 0;
for (const state of states) {
  try {
    calculateStateTax(75000, state.code, 'single');
    calculateStateTax(75000, state.code, 'married');
  } catch (e) {
    console.log(`  FAIL: ${state.code} - ${state.name}: ${e}`);
    stateErrors++;
  }
}
if (stateErrors === 0) {
  console.log('  PASS: All states calculate without errors');
} else {
  process.exitCode = 1;
}
console.log();

// Test 8: Married filing jointly
console.log('Test 8: $100,000/yr in California, married');
const t8 = calculateTakeHome({ amount: 100000, period: 'annual', stateCode: 'CA', filingStatus: 'married' });
// Married gets larger standard deduction, wider brackets
assertClose(t8.federalIncomeTax, 7923, 0.02, 'Federal tax (married)');
console.log();

console.log('=== Tests Complete ===\n');
