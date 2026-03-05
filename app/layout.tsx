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

const FOOTER_POPULAR = [
  { label: '$20/hr in Texas', href: '/salary/20-an-hour-in-texas' },
  { label: '$15/hr', href: '/salary/15-an-hour' },
  { label: '$25/hr in California', href: '/salary/25-an-hour-in-california' },
  { label: '$50K/yr in New York', href: '/salary/50000-a-year-in-new-york' },
  { label: '$75K/yr in Texas', href: '/salary/75000-a-year-in-texas' },
  { label: '$100K/yr in California', href: '/salary/100000-a-year-in-california' },
  { label: '$30/hr', href: '/salary/30-an-hour' },
  { label: '$150K/yr', href: '/salary/150000-a-year' },
];

const FOOTER_STATES = [
  { label: 'Texas', href: '/texas' },
  { label: 'California', href: '/california' },
  { label: 'New York', href: '/new-york' },
  { label: 'Florida', href: '/florida' },
  { label: 'Illinois', href: '/illinois' },
  { label: 'Washington', href: '/washington' },
  { label: 'Arizona', href: '/arizona' },
  { label: 'Colorado', href: '/colorado' },
];

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
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {/* Col 1 */}
              <div>
                <p className="text-white font-bold text-lg mb-2">SalaryHog</p>
                <p className="text-sm leading-relaxed">Free salary & take-home pay calculator for all 50 states.</p>
              </div>
              {/* Col 2 */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">Popular</p>
                <ul className="space-y-2">
                  {FOOTER_POPULAR.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Col 3 */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">States</p>
                <ul className="space-y-2">
                  {FOOTER_STATES.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Col 4 */}
              <div>
                <p className="text-white font-semibold text-sm mb-3">Resources</p>
                <ul className="space-y-2">
                  <li><Link href="/blog/no-income-tax-states" className="text-sm hover:text-white transition-colors">No Income Tax States</Link></li>
                  <li><Link href="/blog/20-an-hour" className="text-sm hover:text-white transition-colors">$20/hr — Can You Live on It?</Link></li>
                  <li><Link href="/blog/salary-vs-hourly" className="text-sm hover:text-white transition-colors">Salary vs Hourly</Link></li>
                  <li><Link href="/compare/texas-vs-california" className="text-sm hover:text-white transition-colors">Texas vs California</Link></li>
                  <li><Link href="/compare/new-york-vs-florida" className="text-sm hover:text-white transition-colors">New York vs Florida</Link></li>
                  <li><Link href="/blog" className="text-sm hover:text-white transition-colors">All Blog Posts</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                This calculator provides estimates for informational purposes only. Actual take-home pay may vary based on additional deductions, local taxes, pre-tax contributions, and individual circumstances. This is not tax advice. Consult a tax professional.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <span>© 2025 SalaryHog. Data updated for the 2025 tax year.</span>
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
