import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import Header from '@/components/Header';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SalaryHog — Free Salary & Take-Home Pay Calculator',
  description: 'How much do you actually take home? Free 2025 salary calculator with tax breakdowns for all 50 states. Hourly to annual conversion.',
  openGraph: {
    siteName: 'SalaryHog',
    images: [{ url: 'https://salaryhog.com/og-image.svg', width: 1200, height: 630 }],
  },
};

import statesData from '../data/states.json';

const FOOTER_HOURLY = [
  { label: '$15/hr', href: '/salary/15-an-hour' },
  { label: '$17/hr', href: '/salary/17-an-hour' },
  { label: '$20/hr', href: '/salary/20-an-hour' },
  { label: '$22/hr', href: '/salary/22-an-hour' },
  { label: '$25/hr', href: '/salary/25-an-hour' },
  { label: '$27/hr', href: '/salary/27-an-hour' },
  { label: '$30/hr', href: '/salary/30-an-hour' },
  { label: '$35/hr', href: '/salary/35-an-hour' },
  { label: '$40/hr', href: '/salary/40-an-hour' },
  { label: '$45/hr', href: '/salary/45-an-hour' },
  { label: '$50/hr', href: '/salary/50-an-hour' },
  { label: '$60/hr', href: '/salary/60-an-hour' },
];

const FOOTER_ANNUAL = [
  { label: '$30K', href: '/salary/30000-a-year' },
  { label: '$40K', href: '/salary/40000-a-year' },
  { label: '$45K', href: '/salary/45000-a-year' },
  { label: '$50K', href: '/salary/50000-a-year' },
  { label: '$55K', href: '/salary/55000-a-year' },
  { label: '$60K', href: '/salary/60000-a-year' },
  { label: '$70K', href: '/salary/70000-a-year' },
  { label: '$75K', href: '/salary/75000-a-year' },
  { label: '$80K', href: '/salary/80000-a-year' },
  { label: '$90K', href: '/salary/90000-a-year' },
  { label: '$100K', href: '/salary/100000-a-year' },
  { label: '$150K', href: '/salary/150000-a-year' },
];

const FOOTER_ALL_STATES = [...statesData].sort((a, b) => a.name.localeCompare(b.name));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-45BWF55DX9" />
      </head>
      <body className={`${geist.className} antialiased bg-gray-50 text-gray-900`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-45BWF55DX9');`,
          }}
        />
        <Header />
        {/* AD SLOT: leaderboard-top */}
        <div className="min-h-screen">{children}</div>

        <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
          <div className="max-w-6xl mx-auto px-4">
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Col 1: Popular Calculations */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">Popular Calculations</p>
                <p className="text-xs text-gray-500 mb-2">Hourly</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                  {FOOTER_HOURLY.map(l => (
                    <Link key={l.href} href={l.href} className="text-xs hover:text-white transition-colors">{l.label}</Link>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-2">Annual</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {FOOTER_ANNUAL.map(l => (
                    <Link key={l.href} href={l.href} className="text-xs hover:text-white transition-colors">{l.label}</Link>
                  ))}
                </div>
              </div>

              {/* Col 2: All States */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">All States</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
                  {FOOTER_ALL_STATES.map(s => (
                    <Link key={s.code} href={`/${s.slug}`} className="text-xs hover:text-white transition-colors truncate">{s.name}</Link>
                  ))}
                </div>
              </div>

              {/* Col 3: Resources */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">Resources</p>
                <ul className="space-y-1.5">
                  <li><Link href="/blog" className="text-xs hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/compare/texas-vs-california" className="text-xs hover:text-white transition-colors">Compare States</Link></li>
                  <li><Link href="/relocate" className="text-xs hover:text-white transition-colors">Relocation Calculator</Link></li>
                  <li><Link href="/afford" className="text-xs hover:text-white transition-colors">Rent Affordability</Link></li>
                  <li><Link href="/freelance" className="text-xs hover:text-white transition-colors">1099 vs W2 Calculator</Link></li>
                  <li><Link href="/about" className="text-xs hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/privacy" className="text-xs hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-xs hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/es" className="text-xs hover:text-white transition-colors">Espanol</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                This calculator provides estimates for informational purposes only. Actual take-home pay may vary based on additional deductions, local taxes, pre-tax contributions, and individual circumstances. This is not tax advice. Consult a tax professional.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <span>&copy; 2025 SalaryHog. Data updated for the 2025 tax year.</span>
                <div className="flex gap-4">
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
