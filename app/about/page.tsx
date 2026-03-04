import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About PayBreakdown',
  description: 'Learn about PayBreakdown, the free salary take-home pay calculator for all 50 states.',
};

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About PayBreakdown</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 text-gray-700 leading-relaxed">
        <p>
          PayBreakdown is a free salary calculator that shows your actual take-home pay after federal and state taxes. We cover all 50 states plus Washington D.C. with 2025 tax bracket data.
        </p>
        <p>
          Whether you&apos;re evaluating a job offer, negotiating a raise, or just curious how much of your paycheck you actually keep, PayBreakdown gives you a clear, accurate breakdown in seconds — no account required.
        </p>
        <p>
          Our calculations include federal income tax (using IRS 2025 brackets and the standard deduction), Social Security tax (6.2%), Medicare tax (1.45%), and state income tax where applicable.
        </p>
        <p>
          Data is updated annually when new federal and state tax brackets are released. The current data reflects the 2025 tax year.
        </p>
        <p className="text-sm text-gray-500 border-t border-gray-100 pt-4">
          This calculator provides estimates for informational purposes only. Consult a qualified tax professional for advice specific to your situation.
        </p>
      </div>
    </main>
  );
}
