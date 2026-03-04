import Link from 'next/link';
import { ParsedSlug, HOURLY_AMOUNTS, ANNUAL_AMOUNTS, buildSlug } from '@/lib/slug-generator';
import { TaxResult, calculateTakeHome } from '@/lib/tax-engine';
import statesData from '../data/states.json';

interface Props {
  parsed: ParsedSlug & { stateCode: string };
  initialResult: TaxResult;
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

// States to always include in comparison (if not the current state)
const COMPARISON_STATES = ['TX', 'CA', 'NY', 'FL'];

function getComparisonStates(currentCode: string) {
  return COMPARISON_STATES
    .filter(c => c !== currentCode)
    .slice(0, 3)
    .map(c => statesData.find(s => s.code === c)!)
    .filter(Boolean);
}

function getStateTaxDescription(stateCode: string): string {
  const state = statesData.find(s => s.code === stateCode);
  if (!state || !state.hasIncomeTax) {
    const name = state?.name ?? 'This state';
    return `${name} is one of nine states with no state income tax — your only deductions are federal income tax, Social Security, and Medicare.`;
  }
  if (state.taxType === 'flat' && state.flatRate) {
    return `${state.name} has a flat income tax rate of ${(state.flatRate * 100).toFixed(1)}%, applied equally to all income.`;
  }
  if (state.taxType === 'progressive' && state.brackets) {
    const brackets = state.brackets.single;
    const minRate = (brackets[0].rate * 100).toFixed(1);
    const maxRate = (brackets[brackets.length - 1].rate * 100).toFixed(1);
    return `${state.name} uses progressive tax brackets, with rates ranging from ${minRate}% to ${maxRate}%.`;
  }
  return '';
}

function getNearbyAmounts(amount: number, period: 'hourly' | 'annual'): number[] {
  const list = period === 'hourly' ? HOURLY_AMOUNTS : ANNUAL_AMOUNTS;
  const idx = list.indexOf(amount);
  if (idx === -1) return [];
  const nearby: number[] = [];
  if (idx > 0) nearby.push(list[idx - 1]);
  if (idx > 1) nearby.push(list[idx - 2]);
  if (idx < list.length - 1) nearby.push(list[idx + 1]);
  if (idx < list.length - 2) nearby.push(list[idx + 2]);
  return nearby;
}

export default function SEOContent({ parsed, initialResult }: Props) {
  const { amount, period, stateCode, stateName, stateSlug } = parsed;
  const grossAnnual = initialResult.gross.annual;
  const takeHomeAnnual = initialResult.takeHome.annual;
  const takeHomeMonthly = initialResult.takeHome.monthly;
  const hasState = !!stateName;

  // Comparison calculations
  const comparisonStates = getComparisonStates(stateCode);
  const comparisons = comparisonStates.map(s => ({
    name: s.name,
    slug: s.slug,
    takeHome: calculateTakeHome({ amount, period, stateCode: s.code, filingStatus: 'single' }).takeHome.annual,
  }));

  const nearbyAmounts = getNearbyAmounts(amount, period);
  const popularStates = statesData.filter(s => ['CA', 'TX', 'NY', 'FL', 'IL', 'WA'].includes(s.code) && s.code !== stateCode).slice(0, 4);

  const periodLabel = period === 'hourly' ? `$${amount}/hr` : `$${amount.toLocaleString()}/yr`;
  const stateLabel = hasState ? ` in ${stateName}` : '';

  return (
    <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
      {/* Section 1: Understanding */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Understanding Your {periodLabel} Salary{stateLabel}
        </h2>
        {period === 'hourly' ? (
          <p>
            At ${amount} per hour working 40 hours a week, your gross annual salary is {usd(grossAnnual)}.
            After federal{hasState ? ` and ${stateName}` : ''} taxes, you bring home approximately {usd(takeHomeAnnual)} per year,
            or {usd(takeHomeMonthly)} per month.
          </p>
        ) : (
          <p>
            On a {usd(amount)} annual salary{stateLabel}, your gross monthly earnings come to {usd(grossAnnual / 12)}.
            After federal{hasState ? ` and ${stateName}` : ''} taxes, you take home approximately {usd(takeHomeAnnual)} per year,
            or {usd(takeHomeMonthly)} per month.
          </p>
        )}
      </section>

      {/* Section 2: State tax info */}
      {hasState && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Tax Breakdown for {stateName}
          </h2>
          <p>{getStateTaxDescription(stateCode)}</p>
        </section>
      )}

      {/* Section 3: Compare across states */}
      {comparisons.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Compare Across States</h2>
          <p>
            The same {periodLabel} salary would net you different amounts depending on where you live:
          </p>
          <ul className="mt-2 space-y-1">
            {comparisons.map(c => (
              <li key={c.slug}>
                <Link
                  href={`/salary/${buildSlug(amount, period, c.slug)}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {usd(c.takeHome)} in {c.name}
                </Link>
                {!statesData.find(s => s.name === c.name)?.hasIncomeTax && (
                  <span className="ml-1.5 text-xs text-green-600">(no state tax)</span>
                )}
              </li>
            ))}
            {hasState && (
              <li className="font-medium text-gray-800">
                {usd(takeHomeAnnual)} in {stateName} (your state)
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Section 4: Related calculations */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Related Calculations</h2>

        {nearbyAmounts.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {period === 'hourly' ? 'Nearby hourly rates' : 'Nearby salaries'}{stateLabel}:
            </p>
            <div className="flex flex-wrap gap-2">
              {nearbyAmounts.map(a => {
                const slug = buildSlug(a, period, stateSlug || undefined);
                const label = period === 'hourly' ? `$${a}/hr` : `$${a.toLocaleString()}/yr`;
                return (
                  <Link key={a} href={`/salary/${slug}`} className="text-sm bg-gray-100 hover:bg-blue-50 text-blue-700 px-3 py-1 rounded-full transition-colors">
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {popularStates.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {period === 'hourly' ? `$${amount}/hr` : `$${amount.toLocaleString()}`} in other states:
            </p>
            <div className="flex flex-wrap gap-2">
              {popularStates.map(s => {
                const slug = buildSlug(amount, period, s.slug);
                return (
                  <Link key={s.code} href={`/salary/${slug}`} className="text-sm bg-gray-100 hover:bg-blue-50 text-blue-700 px-3 py-1 rounded-full transition-colors">
                    {s.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasState && (
          <p className="text-sm">
            <Link href={`/${stateSlug}`} className="text-blue-600 hover:underline">
              ← View all {stateName} salary calculations
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
