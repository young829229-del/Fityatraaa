import { useState } from 'react';
import { X, Star, Flame, ShieldCheck, Truck, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedVariant?: string) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart
}: ProductDetailModalProps) {
  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariant);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  const formattedPrice = `Rs${product.price.toLocaleString('en-US')}.00`;
  const formattedOriginalPrice = `Rs${product.originalPrice.toLocaleString('en-US')}.00`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Close */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {product.brand}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Image & Price Header */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
            <div className="relative w-44 sm:w-48 aspect-square bg-[#F8F9FA] rounded-lg p-3 flex items-center justify-center shrink-0 border border-neutral-100">
              {product.badgeType === 'sale' && product.discountPercentage && (
                <div className="absolute top-2 left-2 z-10 bg-[#E53935] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Flame className="w-3 h-3 fill-white" />
                  <span>SAVE {product.discountPercentage}%</span>
                </div>
              )}
              {product.badgeType === 'soldout' && (
                <div className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-xs">
                  Sold out
                </div>
              )}
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                {product.name}
              </h2>

              {product.rating && (
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                  {product.reviewCount && (
                    <span className="text-xs text-neutral-500 font-medium ml-1">
                      ({product.reviewCount} customer reviews)
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-2">
                <span className="text-xl sm:text-2xl font-black text-neutral-950">
                  {formattedPrice}
                </span>
                <span className="text-sm text-neutral-400 line-through">
                  {formattedOriginalPrice}
                </span>
              </div>

              {product.servings && (
                <p className="text-xs text-neutral-500 mt-1">
                  Package size: <span className="font-semibold text-neutral-800">{product.servings}</span>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed bg-[#F8F9FA] p-3.5 rounded-lg border border-neutral-100">
            {product.description}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2">
                Select Option / Flavor:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border text-left flex items-center justify-between transition-colors ${
                      selectedVariant === v
                        ? 'border-black bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <span>{v}</span>
                    {selectedVariant === v && <Check className="w-3.5 h-3.5 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Quantity:
            </span>
            <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-100"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-sm text-neutral-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-1">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free KTM shipping over Rs. 3,000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>100% Genuine Barcode Verified</span>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <button
            type="button"
            disabled={product.isSoldOut}
            onClick={handleAdd}
            className={`w-full py-3 px-4 font-bold text-sm uppercase tracking-wider rounded-md transition-all shadow-md ${
              product.isSoldOut
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-black text-white hover:bg-neutral-900 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {product.isSoldOut
              ? 'Currently Sold Out'
              : addedAnimation
              ? 'Added to Bag!'
              : `Add to cart — Rs${(product.price * quantity).toLocaleString('en-US')}.00`}
          </button>
        </div>
      </div>
    </div>
  );
}
