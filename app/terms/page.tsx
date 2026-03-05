import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — SalaryHog',
  description: 'SalaryHog terms of service.',
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5 text-gray-700 leading-relaxed text-sm">
        <p className="text-gray-500">Last updated: January 2025</p>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Estimates Only</h2>
          <p>This calculator provides estimates for informational purposes only and is not tax advice. Actual take-home pay may vary based on pre-tax deductions, local taxes, tax credits, and your specific financial situation.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Not Tax Advice</h2>
          <p>The information provided by SalaryHog does not constitute tax, legal, or financial advice. Consult a qualified tax professional for advice specific to your situation.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Accuracy</h2>
          <p>We make no guarantees about the accuracy of calculations. While we strive to keep tax data current, tax laws change and we may not reflect every change immediately.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Use of Service</h2>
          <p>SalaryHog is provided free of charge for personal, non-commercial use. You may not scrape, copy, or redistribute the site&apos;s content or data without permission.</p>
        </section>
      </div>
    </main>
  );
}
