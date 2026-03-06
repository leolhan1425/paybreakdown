'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface Props {
  items: FAQItem[];
  defaultOpen?: number;
}

export default function FAQAccordion({ items, defaultOpen = 2 }: Props) {
  const [openSet, setOpenSet] = useState<Set<number>>(
    () => new Set(Array.from({ length: Math.min(defaultOpen, items.length) }, (_, i) => i))
  );

  const toggle = (i: number) => {
    setOpenSet(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openSet.has(i);
        return (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm">{item.question}</span>
              <svg
                className={`flex-shrink-0 w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {/* Always in DOM for SEO, toggle visibility */}
            <div
              className={`px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 ${isOpen ? '' : 'hidden'}`}
            >
              <div className="pt-3">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
