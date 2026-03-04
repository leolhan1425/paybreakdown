'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface Props {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900 text-sm">{item.question}</span>
            <svg
              className={`flex-shrink-0 w-4 h-4 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
              <div className="pt-3">{item.answer}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
