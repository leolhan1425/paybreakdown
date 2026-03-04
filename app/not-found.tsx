import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-5xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-600 mb-8">
        The page you&apos;re looking for doesn&apos;t exist. It may have moved or the URL might be incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/salary/20-an-hour"
          className="bg-white text-blue-600 border border-blue-200 font-medium px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Try the Salary Calculator
        </Link>
      </div>
    </main>
  );
}
