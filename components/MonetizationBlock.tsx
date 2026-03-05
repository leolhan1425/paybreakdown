import Link from 'next/link';
import { TaxResult } from '@/lib/tax-engine';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const NO_TAX_STATES = new Set(['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']);
const NEAREST_NO_TAX: Record<string, string> = {
  CA: 'nevada', NY: 'florida', IL: 'florida', NJ: 'florida', PA: 'florida',
  OR: 'washington', CO: 'wyoming', AZ: 'nevada', GA: 'florida', NC: 'tennessee',
  OH: 'tennessee', VA: 'florida', MA: 'new-hampshire', CT: 'florida', MD: 'florida',
};

interface Props {
  result: TaxResult;
  stateCode: string;
  stateName: string;
  stateSlug: string;
}

export default function MonetizationBlock({ result, stateCode, stateName, stateSlug }: Props) {
  const grossAnnual = result.gross.annual;
  const takeHomeAnnual = result.takeHome.annual;
  const savingsInterest = Math.round(takeHomeAnnual * 0.1 * 0.045); // 10% of take-home at 4.5% APY
  const match3 = Math.round(grossAnnual * 0.03);
  const match6 = Math.round(grossAnnual * 0.06);
  const hasStateTax = !NO_TAX_STATES.has(stateCode);
  const nearestNoTaxSlug = NEAREST_NO_TAX[stateCode] || 'texas';

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="font-bold text-gray-900 mb-4">Ways to Keep More of Your Paycheck</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: HYSA */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="font-semibold text-gray-900 text-sm mb-2">Open a High-Yield Savings Account</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            The best high-yield savings accounts pay 4.5%+ APY. Parking just 10% of your take-home ({usd(Math.round(takeHomeAnnual * 0.1))}) earns ~{usd(savingsInterest)}/year in interest.
          </p>
          <span className="text-xs text-blue-600 font-medium">Compare Savings Rates →</span>
        </div>

        {/* Card 2: 401k */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="font-semibold text-gray-900 text-sm mb-2">Max Your 401(k) Match</p>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            If your employer matches 3-6% of your salary, you&apos;re leaving {usd(match3)} to {usd(match6)} in free money on the table every year. Plus, contributions reduce your taxable income.
          </p>
          <span className="text-xs text-blue-600 font-medium">Learn how 401(k) affects take-home →</span>
        </div>

        {/* Card 3: State tax */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {hasStateTax ? (
            <>
              <p className="font-semibold text-gray-900 text-sm mb-2">Consider a No-Income-Tax State</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                You&apos;re paying {usd(result.stateIncomeTax)} in {stateName} income tax this year. In a no-tax state, you&apos;d keep all of it.
              </p>
              <Link href={`/compare/${stateSlug}-vs-${nearestNoTaxSlug}`} className="text-xs text-blue-600 font-medium hover:underline">
                Compare {stateName} vs {nearestNoTaxSlug.charAt(0).toUpperCase() + nearestNoTaxSlug.slice(1).replace(/-/g, ' ')} →
              </Link>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900 text-sm mb-2">You&apos;re in a No-Tax State</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {stateName} has no state income tax — you&apos;re already keeping more than most. The average state tax would cost you an extra $2,000-$5,000/year on this salary.
              </p>
              <Link href="/blog/no-income-tax-states" className="text-xs text-blue-600 font-medium hover:underline">
                Read: 9 States With No Income Tax →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
