'use client';

import { useState } from 'react';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-gray-900 mb-1">You&apos;re in!</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="max-w-lg mx-auto text-center">
        <p className="text-lg font-semibold text-gray-900 mb-1">Get Your Personalized Tax Breakdown</p>
        <p className="text-sm text-gray-600 mb-4">
          We&apos;ll send you a detailed breakdown of your salary &mdash; plus notify you when 2026 tax brackets are updated.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : 'Send It'}
          </button>
        </form>
        {status === 'error' && (
          <p className="text-xs text-red-600 mt-2">{message}</p>
        )}
        <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}
