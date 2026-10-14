import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProductStickyBottomBarProps {
  productName: string;
  productImage?: string;
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
  productImage,
  price,
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-2.5 md:hidden transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Thumbnail & Product Info matching screenshot */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-10 h-10 object-contain rounded-lg border border-neutral-200 shrink-0 bg-white p-0.5"
            />
          )}
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-bold text-neutral-900 truncate leading-tight">
              {productName}
            </p>
            {selectedFlavor && (
              <span className="text-[11px] text-neutral-500 truncate leading-tight mt-0.5">
                {selectedFlavor}
              </span>
            )}
          </div>
        </div>

        {/* Center/Right: Price */}
        <div className="text-right shrink-0 pr-1">
          <span className="text-sm font-bold text-neutral-950">
            Rs{price.toLocaleString('en-US')}.00
          </span>
        </div>

        {/* Right: Black square cart button matching screenshot */}
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isSoldOut}
          aria-label="Add to cart"
          className={`w-11 h-11 rounded-xl shrink-0 transition-all flex items-center justify-center cursor-pointer ${
            isSoldOut
              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              : 'bg-black hover:bg-neutral-900 active:scale-95 text-white shadow-xs'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
