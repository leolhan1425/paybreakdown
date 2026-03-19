'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const TOOLS = [
  { label: 'Relocate', href: '/relocate' },
  { label: 'Afford', href: '/afford' },
  { label: '1099 vs W2', href: '/freelance' },
  { label: 'Married', href: '/married' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToolsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setToolsOpen(false), 150);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
      <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-gradient">
          SalaryHog
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-500">
          {/* Tools dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
              onClick={() => setToolsOpen(v => !v)}
            >
              Tools
              <svg className={`w-3 h-3 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl py-1.5 z-50">
                {TOOLS.map(tool => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setToolsOpen(false)}
                  >
                    {tool.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/#states" className="hover:text-blue-600 transition-colors">
            By State
          </Link>
          <Link href="/learn" className="hover:text-blue-600 transition-colors">
            Learn
          </Link>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">
            Blog
          </Link>
          <Link href="/shop" className="hover:text-blue-600 transition-colors">
            Shop
          </Link>
          <Link href="/es" className="hover:text-blue-600 transition-colors text-xs border border-gray-300 rounded-full px-2.5 py-1 font-medium">
            ES
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
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {/* Tools section */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-1 pb-1">Tools</p>
          {TOOLS.map(tool => (
            <Link key={tool.href} href={tool.href} className="block text-sm text-gray-600 hover:text-blue-600 py-1.5 pl-3" onClick={() => setMenuOpen(false)}>
              {tool.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 my-2" />
          <Link href="/#states" className="block text-sm text-gray-600 hover:text-blue-600 py-1.5" onClick={() => setMenuOpen(false)}>
            By State
          </Link>
          <Link href="/learn" className="block text-sm text-gray-600 hover:text-blue-600 py-1.5" onClick={() => setMenuOpen(false)}>
            Learn
          </Link>
          <Link href="/blog" className="block text-sm text-gray-600 hover:text-blue-600 py-1.5" onClick={() => setMenuOpen(false)}>
            Blog
          </Link>
          <Link href="/shop" className="block text-sm text-gray-600 hover:text-blue-600 py-1.5" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <div className="border-t border-gray-100 my-2" />
          <Link href="/es" className="block text-sm text-gray-600 hover:text-blue-600 py-1.5" onClick={() => setMenuOpen(false)}>
            Espanol (ES)
          </Link>
        </div>
      )}
    </header>
  );
}
