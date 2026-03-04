'use client';

export default function ScrollToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="inline-block bg-blue-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
    >
      Calculate Now
    </button>
  );
}
