import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllSlugs, parseSlug, buildSlug } from '@/lib/slug-generator';
import { calculateTakeHome } from '@/lib/tax-engine';
import { breadcrumbSchema, webAppSchema } from '@/lib/structured-data';
import SalaryPageClient from '@/components/SalaryPageClient';
import SEOContent from '@/components/SEOContent';
import Breadcrumb from '@/components/Breadcrumb';

const BASE_URL = 'https://paybreakdown.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

function buildTitle(
  amount: number,
  period: 'hourly' | 'annual',
  stateName: string,
  stateCode: string,
  takeHome: number,
  grossAnnual: number,
): string {
  const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const amountK = `$${(amount / 1000).toFixed(0)}K`;

  if (period === 'hourly') {
    if (!stateName) {
      return `$${amount}/hr is ${usd(grossAnnual)}/yr — Take-Home Calculator (2025)`;
    }
    const full = `$${amount}/hr in ${stateName}: ${usd(takeHome)} Take-Home (2025)`;
    if (full.length <= 60) return full;
    return `$${amount}/hr in ${stateCode}: ${usd(takeHome)} Take-Home (2025)`;
  } else {
    if (!stateName) {
      return `${amountK} Salary After Taxes — Calculator (2025)`;
    }
    const full = `${amountK} in ${stateName}: ${usd(takeHome)} Take-Home (2025)`;
    if (full.length <= 60) return full;
    return `${amountK} in ${stateCode}: ${usd(takeHome)} Take-Home (2025)`;
  }
}

function buildDescription(
  amount: number,
  period: 'hourly' | 'annual',
  stateName: string,
  stateCode: string,
  takeHome: number,
  takeHomeMonthly: number,
  grossAnnual: number,
): string {
  const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;
  if (period === 'hourly') {
    const loc = stateName ? ` in ${stateName}` : '';
    return `$${amount}/hr = ${usd(grossAnnual)}/yr. Take home ${usd(takeHome)} after taxes${loc} (${usd(takeHomeMonthly)}/mo). Free 2025 salary calculator.`;
  } else {
    const loc = stateName ? ` in ${stateCode}` : '';
    return `$${amount.toLocaleString()} salary${loc} → ${usd(takeHome)} take-home. ${usd(takeHomeMonthly)}/mo after federal & state taxes. Free calculator.`;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const stateCode = parsed.stateCode || 'WY';
  const result = calculateTakeHome({ amount: parsed.amount, period: parsed.period, stateCode, filingStatus: 'single' });

  const title = buildTitle(parsed.amount, parsed.period, parsed.stateName, stateCode, result.takeHome.annual, result.gross.annual);
  const description = buildDescription(parsed.amount, parsed.period, parsed.stateName, stateCode, result.takeHome.annual, result.takeHome.monthly, result.gross.annual);
  const canonical = `${BASE_URL}/salary/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: `${BASE_URL}/og-image.svg`, width: 1200, height: 630 }],
    },
  };
}

export default async function SalaryPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const stateCode = parsed.stateCode || 'WY';
  const normalizedParsed = { ...parsed, stateCode };

  const initialResult = calculateTakeHome({
    amount: parsed.amount,
    period: parsed.period,
    stateCode,
    filingStatus: 'single',
  });

  const h1 = parsed.period === 'hourly'
    ? `$${parsed.amount} an Hour${parsed.stateName ? ` in ${parsed.stateName}` : ''}`
    : `$${parsed.amount.toLocaleString()} a Year${parsed.stateName ? ` in ${parsed.stateName}` : ''}`;

  // Breadcrumb items
  const breadcrumbItems = parsed.stateName
    ? [
        { label: 'Home', href: '/' },
        { label: parsed.stateName, href: `/${parsed.stateSlug}` },
        { label: h1 },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: h1 },
      ];

  const crumbSchema = breadcrumbSchema(
    breadcrumbItems
      .filter(b => b.href)
      .map(b => ({ name: b.label, url: `${BASE_URL}${b.href}` }))
      .concat([{ name: h1, url: `${BASE_URL}/salary/${slug}` }])
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema()) }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{h1}</h1>
        <SalaryPageClient initialResult={initialResult} initialParsed={normalizedParsed} />
        <SEOContent parsed={normalizedParsed} initialResult={initialResult} />
      </main>
    </>
  );
}
