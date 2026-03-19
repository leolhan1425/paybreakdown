import Link from 'next/link';
import products from '@/data/products.json';

interface ProductCTAProps {
  productId?: string;
}

export default function ProductCTA({ productId = 'budget-planner' }: ProductCTAProps) {
  const product = products.find(p => p.id === productId) ?? products[0];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">{product.description.slice(0, 100)}...</p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          {product.price} &mdash; View Details
        </Link>
      </div>
    </div>
  );
}
