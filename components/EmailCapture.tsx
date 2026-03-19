'use client';

import { useState } from 'react';

interface EmailCaptureProps {
  headline?: string;
  subtext?: string;
  source?: string;
  buttonText?: string;
}

export default function EmailCapture({
  headline = "We're building more tools",
  subtext = "Cost-of-living comparisons, relocation calculators, and freelance tax breakdowns are coming. Get notified.",
  source = 'homepage',
  buttonText = 'Notify Me',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setStatus('success');
        setEmail('');
      } else if (res.status === 429) {
        setStatus('error');
        setErrorMsg('Too many requests. Try again later.');
      } else {
        setStatus('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[#f0f0ec] rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-gray-900">You&apos;re in. We&apos;ll email you when it&apos;s ready.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f0ec] rounded-xl p-6">
      <div className="max-w-lg mx-auto text-center">
        <p className="text-lg font-semibold text-gray-900 mb-1">{headline}</p>
        <p className="text-sm text-gray-600 mb-4">{subtext}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:border-[#e76f51] focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 bg-[#e76f51] text-white text-sm font-medium rounded-lg hover:bg-[#d4603f] transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : buttonText}
          </button>
        </form>
        {status === 'error' && (
          <p className="text-xs text-red-600 mt-2">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
