import { Flame, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
}

export default function ProductCard({ product, onSelectProduct, onAddToCartDirect }: ProductCardProps) {
  const formattedPrice = `${product.pricePrefix || ''}Rs${product.price.toLocaleString('en-US')}.00`;
  const formattedOriginalPrice = `Rs${product.originalPrice.toLocaleString('en-US')}.00`;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.hasOptions || product.isSoldOut) {
      onSelectProduct(product);
    } else {
      onAddToCartDirect(product);
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="bg-white rounded-lg p-2.5 sm:p-4 flex flex-col justify-between border border-neutral-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div>
        {/* Product Image Area */}
        <div className="relative w-full aspect-square bg-[#F8F9FA] rounded-md overflow-hidden flex items-center justify-center p-2 mb-2">
          {/* Top-Left Badge */}
          {product.badgeType === 'sale' && product.discountPercentage && (
            <div className="absolute top-2 left-2 z-10 bg-[#E53935] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Flame className="w-3 h-3 fill-white" />
              <span>SAVE {product.discountPercentage}%</span>
            </div>
          )}

          {product.badgeType === 'soldout' && (
            <div className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full shadow-xs">
              Sold out
            </div>
          )}

          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Title */}
        <h3 className="font-bold text-[13px] sm:text-sm md:text-[15px] text-neutral-900 line-clamp-2 leading-tight min-h-[38px] sm:min-h-[42px] group-hover:text-neutral-700 transition-colors">
          {product.name}
        </h3>

        {/* Rating Stars (shown if rating exists) */}
        {product.rating && (
          <div className="flex items-center gap-0.5 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]"
              />
            ))}
            {product.reviewCount && (
              <span className="text-xs text-neutral-500 font-medium ml-1">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price Row */}
        <div className="flex flex-wrap items-baseline gap-1.5 mt-2">
          <span className="font-bold text-sm sm:text-base text-neutral-950">
            {formattedPrice}
          </span>
          <span className="text-xs text-neutral-400 line-through font-normal">
            {formattedOriginalPrice}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleActionClick}
        className="w-full mt-3 py-2 sm:py-2.5 px-3 bg-white text-neutral-950 text-xs sm:text-sm font-semibold rounded-[6px] border-[1.5px] border-black hover:bg-black hover:text-white transition-colors duration-150 text-center active:scale-[0.98] cursor-pointer"
      >
        {product.hasOptions ? 'Choose options' : 'Add to cart'}
      </button>
    </div>
  );
}
