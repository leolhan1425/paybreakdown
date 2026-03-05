import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SalaryHog',
  description: 'SalaryHog privacy policy.',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5 text-gray-700 leading-relaxed text-sm">
        <p className="text-gray-500">Last updated: January 2025</p>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Analytics</h2>
          <p>We use Google Analytics to understand how visitors use our site. This helps us improve the calculator and content. Google Analytics uses cookies and may collect anonymized data about your visit.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Advertising</h2>
          <p>We use advertising services that may use cookies to show relevant ads. These services may collect information about your visits to this and other websites.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Personal Information</h2>
          <p>We do not collect or store personal information. No account creation is required to use SalaryHog.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Calculator Data</h2>
          <p>Calculator inputs (salary amounts, state selections) are processed entirely in your browser and are never sent to our servers.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">Contact</h2>
          <p>If you have questions about this privacy policy, please contact us through our website.</p>
        </section>
      </div>
    </main>
  );
}
