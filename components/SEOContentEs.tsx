import Link from 'next/link';
import { ParsedSlug, HOURLY_AMOUNTS, ANNUAL_AMOUNTS } from '@/lib/slug-generator';
import { TaxResult, calculateTakeHome } from '@/lib/tax-engine';
import { buildSpanishSlug } from '@/lib/spanish-slugs';
import { stateNamesEs } from '@/lib/i18n/es';
import statesData from '../data/states.json';

interface Props {
  parsed: ParsedSlug & { stateCode: string };
  initialResult: TaxResult;
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const COMPARISON_STATES = ['TX', 'CA', 'NY', 'FL'];

function getComparisonStates(currentCode: string) {
  return COMPARISON_STATES
    .filter(c => c !== currentCode)
    .slice(0, 3)
    .map(c => statesData.find(s => s.code === c)!)
    .filter(Boolean);
}

function getStateName(stateSlug: string): string {
  return stateNamesEs[stateSlug] || stateSlug;
}

function getStateTaxDescription(stateCode: string): string {
  const state = statesData.find(s => s.code === stateCode);
  if (!state || !state.hasIncomeTax) {
    const name = state ? getStateName(state.slug) : 'Este estado';
    return `${name} es uno de los nueve estados sin impuesto estatal sobre la renta — tus unicas deducciones son el impuesto federal sobre la renta, Seguro Social y Medicare.`;
  }
  if (state.taxType === 'flat' && state.flatRate) {
    return `${getStateName(state.slug)} tiene una tasa fija de impuesto sobre la renta del ${(state.flatRate * 100).toFixed(1)}%, aplicada por igual a todos los ingresos.`;
  }
  if (state.taxType === 'progressive' && state.brackets) {
    const brackets = state.brackets.single;
    const minRate = (brackets[0].rate * 100).toFixed(1);
    const maxRate = (brackets[brackets.length - 1].rate * 100).toFixed(1);
    return `${getStateName(state.slug)} usa tablas progresivas de impuestos, con tasas que van del ${minRate}% al ${maxRate}%.`;
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

export default function SEOContentEs({ parsed, initialResult }: Props) {
  const { amount, period, stateCode, stateName, stateSlug } = parsed;
  const grossAnnual = initialResult.gross.annual;
  const takeHomeAnnual = initialResult.takeHome.annual;
  const takeHomeMonthly = initialResult.takeHome.monthly;
  const hasState = !!stateName;
  const esStateName = stateSlug ? getStateName(stateSlug) : '';

  const comparisonStates = getComparisonStates(stateCode);
  const comparisons = comparisonStates.map(s => ({
    name: getStateName(s.slug),
    slug: s.slug,
    takeHome: calculateTakeHome({ amount, period, stateCode: s.code, filingStatus: 'single' }).takeHome.annual,
    hasStateTax: s.hasIncomeTax,
  }));

  const nearbyAmounts = getNearbyAmounts(amount, period);
  const popularStates = statesData.filter(s => ['CA', 'TX', 'NY', 'FL', 'IL', 'WA'].includes(s.code) && s.code !== stateCode).slice(0, 4);

  const periodLabel = period === 'hourly' ? `$${amount}/hora` : `$${amount.toLocaleString()}/ano`;
  const stateLabel = hasState ? ` en ${esStateName}` : '';

  return (
    <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
      {/* Section 1: Understanding */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Entendiendo Tu Sueldo de {periodLabel}{stateLabel}
        </h2>
        {period === 'hourly' ? (
          <p>
            A ${amount} por hora trabajando 40 horas a la semana, tu sueldo bruto anual es {usd(grossAnnual)}.
            Despues de impuestos federales{hasState ? ` y de ${esStateName}` : ''}, tu sueldo neto es aproximadamente {usd(takeHomeAnnual)} al ano,
            o {usd(takeHomeMonthly)} al mes.
          </p>
        ) : (
          <p>
            Con un salario de {usd(amount)} al ano{stateLabel}, tu ingreso bruto mensual es {usd(grossAnnual / 12)}.
            Despues de impuestos federales{hasState ? ` y de ${esStateName}` : ''}, tu sueldo neto es aproximadamente {usd(takeHomeAnnual)} al ano,
            o {usd(takeHomeMonthly)} al mes.
          </p>
        )}
      </section>

      {/* Section 2: State tax info */}
      {hasState && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Desglose de Impuestos de {esStateName}
          </h2>
          <p>{getStateTaxDescription(stateCode)}</p>
        </section>
      )}

      {/* Section 3: Compare across states */}
      {comparisons.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Comparar Entre Estados</h2>
          <p>
            El mismo sueldo de {periodLabel} te daria diferentes montos netos dependiendo de donde vivas:
          </p>
          <ul className="mt-2 space-y-1">
            {comparisons.map(c => (
              <li key={c.slug}>
                <Link
                  href={`/es/salario/${buildSpanishSlug(amount, period, c.slug)}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {usd(c.takeHome)} en {c.name}
                </Link>
                {!c.hasStateTax && (
                  <span className="ml-1.5 text-xs text-green-600">(sin impuesto estatal)</span>
                )}
              </li>
            ))}
            {hasState && (
              <li className="font-medium text-gray-800">
                {usd(takeHomeAnnual)} en {esStateName} (tu estado)
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Section 4: Related calculations */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Calculos Relacionados</h2>

        {nearbyAmounts.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {period === 'hourly' ? 'Tarifas por hora similares' : 'Salarios similares'}{stateLabel}:
            </p>
            <div className="flex flex-wrap gap-2">
              {nearbyAmounts.map(a => {
                const slug = buildSpanishSlug(a, period, stateSlug || undefined);
                const label = period === 'hourly' ? `$${a}/hora` : `$${a.toLocaleString()}/ano`;
                return (
                  <Link key={a} href={`/es/salario/${slug}`} className="text-sm bg-gray-100 hover:bg-blue-50 text-blue-700 px-3 py-1 rounded-full transition-colors">
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
              {period === 'hourly' ? `$${amount}/hora` : `$${amount.toLocaleString()}`} en otros estados:
            </p>
            <div className="flex flex-wrap gap-2">
              {popularStates.map(s => {
                const slug = buildSpanishSlug(amount, period, s.slug);
                return (
                  <Link key={s.code} href={`/es/salario/${slug}`} className="text-sm bg-gray-100 hover:bg-blue-50 text-blue-700 px-3 py-1 rounded-full transition-colors">
                    {getStateName(s.slug)}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {hasState && (
          <p className="text-sm">
            <Link href={`/es/${stateSlug}`} className="text-blue-600 hover:underline">
              &larr; Ver todos los calculos de sueldo en {esStateName}
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
