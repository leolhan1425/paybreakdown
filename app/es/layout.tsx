import Link from 'next/link';
import HeaderEs from '@/components/HeaderEs';
import { es } from '@/lib/i18n/es';

export const metadata = {
  title: 'SalaryHog — Calculadora Gratuita de Sueldo Neto',
  description: 'Cuanto ganas realmente? Calculadora gratuita de sueldo 2025 con desglose de impuestos para los 50 estados.',
  openGraph: {
    siteName: 'SalaryHog',
    images: [{ url: 'https://salaryhog.com/og-image.svg', width: 1200, height: 630 }],
  },
  other: {
    'Content-Language': 'es',
  },
};

const FOOTER_POPULAR_ES = [
  { label: '$20/hora en Texas', href: '/es/salario/20-la-hora-en-texas' },
  { label: '$15/hora', href: '/es/salario/15-la-hora' },
  { label: '$25/hora en California', href: '/es/salario/25-la-hora-en-california' },
  { label: '$50K/ano en Nueva York', href: '/es/salario/50000-al-ano-en-new-york' },
  { label: '$75K/ano en Texas', href: '/es/salario/75000-al-ano-en-texas' },
  { label: '$100K/ano en California', href: '/es/salario/100000-al-ano-en-california' },
  { label: '$30/hora', href: '/es/salario/30-la-hora' },
  { label: '$150K/ano', href: '/es/salario/150000-al-ano' },
];

const FOOTER_STATES_ES = [
  { label: 'Texas', href: '/es/texas' },
  { label: 'California', href: '/es/california' },
  { label: 'Nueva York', href: '/es/new-york' },
  { label: 'Florida', href: '/es/florida' },
  { label: 'Illinois', href: '/es/illinois' },
  { label: 'Washington', href: '/es/washington' },
  { label: 'Arizona', href: '/es/arizona' },
  { label: 'Colorado', href: '/es/colorado' },
];

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="es">
      <HeaderEs />
      <div className="min-h-screen">{children}</div>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-white font-bold text-lg mb-2">SalaryHog</p>
              <p className="text-sm leading-relaxed">{es.footer.tagline}</p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">{es.footer.popular}</p>
              <ul className="space-y-2">
                {FOOTER_POPULAR_ES.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">{es.footer.states}</p>
              <ul className="space-y-2">
                {FOOTER_STATES_ES.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">{es.footer.resources}</p>
              <ul className="space-y-2">
                <li><Link href="/es/blog/estados-sin-impuesto-sobre-la-renta" className="text-sm hover:text-white transition-colors">Estados Sin Impuesto</Link></li>
                <li><Link href="/es/blog/20-dolares-la-hora" className="text-sm hover:text-white transition-colors">$20 la Hora</Link></li>
                <li><Link href="/es/blog/salario-vs-por-hora" className="text-sm hover:text-white transition-colors">Salario vs Por Hora</Link></li>
                <li><Link href="/" className="text-sm hover:text-white transition-colors">English Version</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
              {es.footer.disclaimer}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
              <span>&copy; {es.footer.copyright}</span>
              <div className="flex gap-4">
                <Link href="/privacy" className="hover:text-white transition-colors">{es.footer.privacyPolicy}</Link>
                <Link href="/terms" className="hover:text-white transition-colors">{es.footer.termsOfService}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
