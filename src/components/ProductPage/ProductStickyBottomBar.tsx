import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProductStickyBottomBarProps {
  productName: string;
  price: number;
  originalPrice: number;
  savingsPercentage: number;
  selectedFlavor?: string;
  onAddToCart: () => void;
  isSoldOut?: boolean;
  hide?: boolean;
}

export default function ProductStickyBottomBar({
  productName,
  price,
  originalPrice,
  savingsPercentage,
  selectedFlavor,
  onAddToCart,
  isSoldOut = false,
  hide = false
}: ProductStickyBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (hide || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-3 md:hidden transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Product Info & Pricing */}
        <div className="flex flex-col min-w-0 pr-1">
          <p className="text-xs font-bold text-neutral-900 truncate">{productName}</p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-black text-neutral-950 tabular-nums">
              Rs {price.toLocaleString('en-US')}
            </span>
            {originalPrice > price && (
              <span className="text-[11px] text-neutral-400 line-through tabular-nums">
                Rs {originalPrice.toLocaleString('en-US')}
              </span>
            )}
            {isSoldOut ? (
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-neutral-900 px-1.5 py-0.5">
                Sold Out
              </span>
            ) : (
              savingsPercentage > 0 && (
                <span className="text-[9px] font-black uppercase tracking-wider text-white bg-[#0c1a3b] px-1.5 py-0.5 tabular-nums">
                  SAVE {savingsPercentage}%
                </span>
              )
            )}
          </div>
          {selectedFlavor && (
            <span className="text-[10px] text-neutral-500 truncate">{selectedFlavor}</span>
          )}
        </div>

        {/* Right: Add to cart / Sold Out Button */}
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isSoldOut}
          className={`shrink-0 font-black text-xs uppercase tracking-wider px-5 py-3 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            isSoldOut
              ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
              : 'bg-[#0c1a3b] hover:bg-neutral-900 active:scale-95 text-white shadow-sm cursor-pointer'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isSoldOut ? 'Sold Out' : 'Add to cart'}</span>
        </button>
      </div>
    </div>
  );
}
