import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllSpanishSlugs, parseSpanishSlug, buildSpanishSlug, spanishToEnglishSlug } from '@/lib/spanish-slugs';
import { calculateTakeHome } from '@/lib/tax-engine';
import { breadcrumbSchema, webAppSchema } from '@/lib/structured-data';
import { stateNamesEs } from '@/lib/i18n/es';
import SalaryPageClient from '@/components/SalaryPageClient';
import SEOContentEs from '@/components/SEOContentEs';
import Breadcrumb from '@/components/Breadcrumb';
import MonetizationBlock from '@/components/MonetizationBlock';

const BASE_URL = 'https://salaryhog.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSpanishSlugs().map(slug => ({ slug }));
}

function getEsStateName(stateSlug: string): string {
  return stateNamesEs[stateSlug] || stateSlug;
}

function buildTitle(
  amount: number,
  period: 'hourly' | 'annual',
  stateSlug: string,
  stateCode: string,
  takeHome: number,
  grossAnnual: number,
): string {
  const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const esName = stateSlug ? getEsStateName(stateSlug) : '';

  if (period === 'hourly') {
    if (!stateSlug) {
      return `$${amount}/hora = ${usd(grossAnnual)}/ano — Sueldo Neto 2025 | SalaryHog`;
    }
    const full = `$${amount}/hora en ${esName}: ${usd(takeHome)} Neto (2025)`;
    if (full.length <= 60) return full;
    return `$${amount}/hora en ${stateCode}: ${usd(takeHome)} Neto (2025)`;
  } else {
    const amountK = `$${(amount / 1000).toFixed(0)}K`;
    if (!stateSlug) {
      return `${amountK} al Ano Despues de Impuestos — Calculadora 2025 | SalaryHog`;
    }
    const full = `${amountK} en ${esName}: ${usd(takeHome)} Neto (2025)`;
    if (full.length <= 60) return full;
    return `${amountK} en ${stateCode}: ${usd(takeHome)} Neto (2025)`;
  }
}

function buildDescription(
  amount: number,
  period: 'hourly' | 'annual',
  stateSlug: string,
  takeHome: number,
  takeHomeMonthly: number,
  grossAnnual: number,
): string {
  const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const esName = stateSlug ? getEsStateName(stateSlug) : '';

  if (period === 'hourly') {
    const loc = esName ? ` en ${esName}` : '';
    return `$${amount}/hora = ${usd(grossAnnual)}/ano. Sueldo neto ${usd(takeHome)} despues de impuestos${loc} (${usd(takeHomeMonthly)}/mes). Calculadora gratuita 2025.`;
  } else {
    const loc = esName ? ` en ${esName}` : '';
    return `Salario de $${amount.toLocaleString()}${loc} → ${usd(takeHome)} neto. ${usd(takeHomeMonthly)}/mes despues de impuestos. Calculadora gratuita.`;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSpanishSlug(slug);
  if (!parsed) return {};

  const stateCode = parsed.stateCode || 'WY';
  const result = calculateTakeHome({ amount: parsed.amount, period: parsed.period, stateCode, filingStatus: 'single' });

  const title = buildTitle(parsed.amount, parsed.period, parsed.stateSlug, stateCode, result.takeHome.annual, result.gross.annual);
  const description = buildDescription(parsed.amount, parsed.period, parsed.stateSlug, result.takeHome.annual, result.takeHome.monthly, result.gross.annual);
  const canonical = `${BASE_URL}/es/salario/${slug}`;
  const englishSlug = spanishToEnglishSlug(slug);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'en': `${BASE_URL}/salary/${englishSlug}`,
        'es': canonical,
        'x-default': `${BASE_URL}/salary/${englishSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
    },
  };
}

export default async function SpanishSalaryPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseSpanishSlug(slug);
  if (!parsed) notFound();

  const stateCode = parsed.stateCode || 'WY';
  const normalizedParsed = { ...parsed, stateCode };

  const initialResult = calculateTakeHome({
    amount: parsed.amount,
    period: parsed.period,
    stateCode,
    filingStatus: 'single',
  });

  const esStateName = parsed.stateSlug ? getEsStateName(parsed.stateSlug) : '';

  const h1 = parsed.period === 'hourly'
    ? `$${parsed.amount} la Hora${esStateName ? ` en ${esStateName}` : ''}`
    : `$${parsed.amount.toLocaleString()} al Ano${esStateName ? ` en ${esStateName}` : ''}`;

  const breadcrumbItems = esStateName
    ? [
        { label: 'Inicio', href: '/es' },
        { label: esStateName, href: `/es/${parsed.stateSlug}` },
        { label: h1 },
      ]
    : [
        { label: 'Inicio', href: '/es' },
        { label: h1 },
      ];

  const crumbSchema = breadcrumbSchema(
    breadcrumbItems
      .filter(b => b.href)
      .map(b => ({ name: b.label, url: `${BASE_URL}${b.href}` }))
      .concat([{ name: h1, url: `${BASE_URL}/es/salario/${slug}` }])
  );

  // FAQ schema
  const faqItems = [];
  if (parsed.period === 'hourly') {
    faqItems.push({
      question: `Cuanto es $${parsed.amount} la hora al ano despues de impuestos${esStateName ? ` en ${esStateName}` : ''}?`,
      answer: `Con un sueldo de $${parsed.amount} la hora${esStateName ? ` en ${esStateName}` : ''}, tu ingreso bruto anual es $${initialResult.gross.annual.toLocaleString()}. Despues de impuestos, tu sueldo neto es aproximadamente $${Math.round(initialResult.takeHome.annual).toLocaleString()} al ano o $${Math.round(initialResult.takeHome.monthly).toLocaleString()} al mes.`,
    });
  } else {
    faqItems.push({
      question: `Cuanto queda de un salario de $${parsed.amount.toLocaleString()} despues de impuestos${esStateName ? ` en ${esStateName}` : ''}?`,
      answer: `Con un salario de $${parsed.amount.toLocaleString()}${esStateName ? ` en ${esStateName}` : ''}, tu sueldo neto despues de impuestos es aproximadamente $${Math.round(initialResult.takeHome.annual).toLocaleString()} al ano o $${Math.round(initialResult.takeHome.monthly).toLocaleString()} al mes.`,
    });
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{h1}</h1>
        <SalaryPageClient initialResult={initialResult} initialParsed={normalizedParsed} lang="es" />
        <MonetizationBlock
          result={initialResult}
          stateCode={stateCode}
          stateName={esStateName || 'Wyoming'}
          stateSlug={parsed.stateSlug || 'wyoming'}
          lang="es"
        />
        <SEOContentEs parsed={normalizedParsed} initialResult={initialResult} />
      </main>
    </>
  );
}
