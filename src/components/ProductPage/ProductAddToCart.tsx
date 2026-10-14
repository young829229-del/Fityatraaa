import { useState } from 'react';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Check, Loader2, Clock, Banknote } from 'lucide-react';
import { DeliveryInfoConfig } from '../../types';

interface ProductAddToCartProps {
  onAddToCart: () => void;
  onBuyNow?: () => void;
  price: number;
  originalPrice?: number;
  savingsPercentage?: number;
  bundleQuantity?: number;
  isSoldOut?: boolean;
  deliveryInfo?: DeliveryInfoConfig;
  showDeliveryInfo?: boolean;
}

export default function ProductAddToCart({
  onAddToCart,
  onBuyNow,
  price,
  isSoldOut = false,
  deliveryInfo,
  showDeliveryInfo = true
}: ProductAddToCartProps) {
  const [buttonState, setButtonState] = useState<'idle' | 'adding' | 'added'>('idle');

  const handleClick = () => {
    if (isSoldOut || buttonState === 'adding') return;
    setButtonState('adding');
    setTimeout(() => {
      onAddToCart();
      setButtonState('added');
      setTimeout(() => {
        setButtonState('idle');
      }, 1500);
    }, 180);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    onAddToCart();
    if (onBuyNow) {
      onBuyNow();
    }
  };

  // Compute dynamic delivery date range (e.g. Tomorrow - 2 days from now)
  const tomorrow = new Date(Date.now() + 86400000);
  const twoDaysOut = new Date(Date.now() + 2 * 86400000);
  const formatShortDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="w-full flex flex-col space-y-2 py-1">
      {/* Primary Add to Cart / Sold Out Button matching screenshot: dark teal with bag icon */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isSoldOut || buttonState === 'adding'}
        className={`w-full font-bold text-sm sm:text-base py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-xs ${
          isSoldOut
            ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
            : buttonState === 'added'
            ? 'bg-emerald-700 text-white cursor-pointer'
            : 'bg-[#07363c] hover:bg-[#05282d] active:scale-[0.99] text-white cursor-pointer group'
        }`}
      >
        {isSoldOut ? (
          <span>Sold out</span>
        ) : buttonState === 'adding' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Adding to cart...</span>
          </>
        ) : buttonState === 'added' ? (
          <>
            <Check className="w-4 h-4" />
            <span>Added to cart</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-105" />
            <span>Add to cart</span>
          </>
        )}
      </button>

      {/* Buy It Now Button matching screenshot: solid black */}
      {!isSoldOut && (
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full font-bold text-sm sm:text-base py-3.5 px-4 rounded-xl transition-all flex items-center justify-center bg-black hover:bg-neutral-900 active:scale-[0.99] text-white cursor-pointer"
        >
          <span>Buy it now</span>
        </button>
      )}

      {/* Delivery-Estimation & Trust Area */}
      {showDeliveryInfo && (
        <ProductDeliveryInfo deliveryInfo={deliveryInfo} />
      )}
    </div>
  );
}

export function ProductDeliveryInfo({ deliveryInfo }: { deliveryInfo?: DeliveryInfoConfig }) {
  const tomorrow = new Date(Date.now() + 86400000);
  const twoDaysOut = new Date(Date.now() + 2 * 86400000);
  const formatShortDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="w-full flex flex-col space-y-2.5 pt-1">
      {deliveryInfo?.enabled !== false && (
        <div className="w-full bg-[#F9F9F8] border border-neutral-200/90 p-4 space-y-2.5 text-xs sm:text-sm text-neutral-800">
          <div className="flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-[#0c1a3b] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-950">
                {deliveryInfo?.freeDeliveryText || 'FREE Delivery on Wellcore Creatine'}
              </span>
              <p className="text-xs text-neutral-600 mt-0.5">
                Estimated arrival:{' '}
                <strong className="text-neutral-900">
                  {formatShortDate(tomorrow)} – {formatShortDate(twoDaysOut)}
                </strong>{' '}
                ({deliveryInfo?.estimatedWindow || '24–36 Hours in KTM Valley • 2–3 Days Nationwide'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2 border-t border-neutral-200/70">
            <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-medium text-neutral-700">
              {deliveryInfo?.codAvailableText || 'Cash on Delivery (COD) & eSewa Available'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 pt-2 border-t border-neutral-200/70">
            <ShieldCheck className="w-4 h-4 text-[#0c1a3b] shrink-0" />
            <span className="text-xs font-medium text-neutral-700">
              {deliveryInfo?.returnPolicyText || '100% Verified Authentic • Hassle-Free Returns'}
            </span>
          </div>
        </div>
      )}

      {/* Trust Row */}
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-neutral-600">
        <div className="flex flex-col items-center p-2 bg-neutral-50 border border-neutral-200/60">
          <Clock className="w-4 h-4 text-neutral-900 mb-1" />
          <span>24h Dispatch</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-neutral-50 border border-neutral-200/60">
          <ShieldCheck className="w-4 h-4 text-neutral-900 mb-1" />
          <span>100% Genuine</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-neutral-50 border border-neutral-200/60">
          <RefreshCw className="w-4 h-4 text-neutral-900 mb-1" />
          <span>Easy Returns</span>
        </div>
      </div>
    </div>
  );
}
