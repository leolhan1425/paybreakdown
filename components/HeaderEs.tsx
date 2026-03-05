'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HeaderEs() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/es" className="text-xl font-bold text-blue-600 tracking-tight">
          SalaryHog <span className="text-xs font-normal text-gray-400">ES</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/es/salario/20-la-hora" className="hover:text-blue-600 transition-colors">
            Por Hora a Salario
          </Link>
          <Link href="/es/#estados" className="hover:text-blue-600 transition-colors">
            Por Estado
          </Link>
          <Link href="/es/blog" className="hover:text-blue-600 transition-colors">
            Blog
          </Link>
          <Link href="/" className="hover:text-blue-600 transition-colors text-xs border border-gray-200 rounded px-2 py-1">
            EN
          </Link>
        </nav>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen ? (
              <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            ) : (
              <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3">
          <Link href="/es/salario/20-la-hora" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={() => setMenuOpen(false)}>
            Por Hora a Salario
          </Link>
          <Link href="/es/#estados" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={() => setMenuOpen(false)}>
            Por Estado
          </Link>
          <Link href="/es/blog" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={() => setMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={() => setMenuOpen(false)}>
            English (EN)
          </Link>
        </div>
      )}
    </header>
  );
}
