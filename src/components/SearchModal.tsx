import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types';
import { useResolvedMediaUrl } from '../services/storageService';

function SearchResultThumb({ src, alt }: { src: string; alt: string }) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) {
    return (
      <div className="w-12 h-12 bg-[#F8F9FA] rounded-md p-1 border border-neutral-100 shrink-0" />
    );
  }
  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      className="w-12 h-12 object-contain bg-[#F8F9FA] rounded-md p-1 border border-neutral-100 shrink-0"
    />
  );
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  products,
  onSelectProduct
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3 sm:p-4 border-b border-neutral-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creatine, whey, fish oil, multivitamins..."
            className="w-full text-sm font-medium focus:outline-none placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <p className="text-xs text-neutral-400 p-4 text-center">
              Type keywords to search verified supplements...
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-neutral-500 p-4 text-center">
              No products found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                <SearchResultThumb
                  src={product.image}
                  alt={product.name}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Rs. {product.price.toLocaleString('en-US')}.00
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
