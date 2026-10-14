import { useState } from 'react';
import { Check, Flame, Sparkles, Plus, AlertCircle, ShoppingBag, Zap } from 'lucide-react';
import { BundleDeal, BundleConfig, Product } from '../../types';
import { useResolvedMediaUrl } from '../../services/storageService';

function ThumbnailImg({ src, alt }: { src?: string; alt: string }) {
  const resolved = useResolvedMediaUrl(src || '');
  return (
    <img
      src={resolved || src}
      alt={alt}
      className="w-12 h-12 object-contain bg-white border border-neutral-200 shrink-0 p-1"
    />
  );
}

interface BuyMoreSaveMoreProps {
  bundles: BundleDeal[];
  comboBundles?: BundleConfig[];
  selectedBundleId: string;
  onSelectBundle: (bundle: BundleDeal | any) => void;
  availableFlavors?: string[];
  selectedBundleFlavors: string[];
  onBundleFlavorChange: (index: number, flavor: string) => void;
  productStock?: number;
  isSoldOut?: boolean;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  showPurchaseButtons?: boolean;
}

export default function BuyMoreSaveMore({
  bundles = [],
  comboBundles = [],
  selectedBundleId,
  onSelectBundle,
  availableFlavors = ['Lemon Lime', 'Tropical Tango 307g', 'Unflavored (250g)', 'Fruit Punch (250g)'],
  selectedBundleFlavors,
  onBundleFlavorChange,
  productStock = 50,
  isSoldOut = false,
  onAddToCart,
  onBuyNow,
  showPurchaseButtons = false
}: BuyMoreSaveMoreProps) {
  if (bundles.length === 0 && comboBundles.length === 0) return null;

  const currentBundle = bundles.find((b) => b.id === selectedBundleId) || bundles[0];

  // Calculate highest savings percentage across available bundles
  const maxSavingsPercent = Math.max(
    ...bundles.map((b) => b.savingsPercentage || 0),
    ...comboBundles.map((c) => c.savingsPercentage || 0),
    0
  );

  // Check inventory rule: Does selected tier exceed stock?
  const selectedQty = currentBundle?.quantity || 1;
  const isOutOfStockForSelectedBundle =
    isSoldOut || (typeof productStock === 'number' && productStock < selectedQty);

  const selectedSavings =
    currentBundle?.savingsAmount ||
    Math.max(0, (currentBundle?.originalPrice || 0) - (currentBundle?.price || 0));

  return (
    <div className="w-full flex flex-col space-y-3 py-2 my-1">
      {/* Section Header matching reference screenshot: line with BUNDLE & SAVE */}
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-[#86efac]/80 w-full" />
        <span className="bg-white px-3 text-xs font-black uppercase tracking-widest text-neutral-900 shrink-0">
          BUNDLE & SAVE
        </span>
        <div className="border-t border-[#86efac]/80 w-full" />
      </div>

      {/* Stacked Tiers Cards matching screenshot */}
      <div className="flex flex-col space-y-2.5">
        {bundles.map((bundle) => {
          const isSelected = bundle.id === selectedBundleId;
          const savings = bundle.savingsAmount || (bundle.originalPrice - bundle.price);
          const percent =
            bundle.savingsPercentage ||
            (bundle.originalPrice > 0
              ? Math.round((savings / bundle.originalPrice) * 100)
              : 0);

          const isSingle = bundle.quantity === 1 || bundle.title.toLowerCase().includes('single') || bundle.title.toLowerCase().includes('buy 1');
          const isDuo = bundle.quantity === 2 || bundle.title.toLowerCase().includes('duo') || bundle.title.toLowerCase().includes('buy 2');
          const isTrio = bundle.quantity === 3 || bundle.title.toLowerCase().includes('trio') || bundle.title.toLowerCase().includes('buy 3');

          const displayTitle = isSingle ? 'Single' : isDuo ? 'Duo' : isTrio ? 'Trio' : bundle.title;
          const subtitle = isSingle ? 'Standard price' : `You save ${percent}%`;

          return (
            <div
              key={bundle.id}
              onClick={() => onSelectBundle(bundle)}
              className={`rounded-xl p-3 sm:p-4 transition-all cursor-pointer bg-white ${
                isSelected
                  ? 'border-2 border-[#16a34a] shadow-xs'
                  : 'border border-neutral-200/90 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Radio Circle & Titles */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors bg-white ${
                      isSelected ? 'border-[#16a34a]' : 'border-neutral-300'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-neutral-950">
                        {displayTitle}
                      </h4>
                      {isDuo && savings > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fed7aa] text-[#9a3412]">
                          SAVE Rs{savings.toLocaleString()}.00
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 font-normal mt-0.5">
                      {subtitle}
                    </p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-bold text-neutral-950">
                    Rs{bundle.price.toLocaleString()}.00
                  </div>
                  {bundle.originalPrice > bundle.price && (
                    <div className="text-xs text-neutral-400 line-through font-normal">
                      Rs{bundle.originalPrice.toLocaleString()}.00
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-unit variant dropdown selectors matching reference screenshot ref_4 */}
              {isSelected && bundle.quantity > 1 && availableFlavors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-200/80 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select Flavors / Variants For Each Item:</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[...Array(bundle.quantity)].map((_, unitIdx) => {
                      const selectedFlavor =
                        selectedBundleFlavors[unitIdx] || availableFlavors[0] || 'Unflavored';
                      return (
                        <div
                          key={unitIdx}
                          className="flex items-center gap-2 bg-white p-2 border border-neutral-200"
                        >
                          <span className="text-[11px] font-black text-neutral-500 uppercase shrink-0">
                            Unit #{unitIdx + 1}:
                          </span>
                          <select
                            value={selectedFlavor}
                            onChange={(e) => onBundleFlavorChange(unitIdx, e.target.value)}
                            className="w-full text-xs font-semibold bg-transparent text-neutral-900 focus:outline-none cursor-pointer"
                          >
                            {availableFlavors.map((flv) => (
                              <option key={flv} value={flv}>
                                {flv}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Product Combos (Split card layout matching screenshot ref_6) */}
        {comboBundles.map((combo) => {
          const isSelected = combo.id === selectedBundleId;
          const savings = combo.savingsAmount || (combo.originalPrice - combo.sellingPrice);
          const percent = combo.savingsPercentage || 0;

          return (
            <div
              key={combo.id}
              onClick={() => onSelectBundle({
                id: combo.id,
                title: combo.title,
                quantity: combo.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
                price: combo.sellingPrice,
                originalPrice: combo.originalPrice,
                savingsAmount: savings,
                savingsPercentage: percent,
                badgeText: combo.badgeText,
                isPopular: combo.isPopular
              })}
              className={`relative border-2 p-3 sm:p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#16a34a] bg-[#f0fdf4]/50 shadow-xs'
                  : 'border-[#86efac]/40 hover:border-[#86efac] bg-white'
              }`}
            >
              {combo.badgeText && (
                <div className="absolute -top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-[#16a34a] text-white">
                  {combo.badgeText}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'border-[#16a34a] bg-[#16a34a] text-white'
                        : 'border-[#86efac]/60 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-neutral-950">
                      {combo.title}
                    </h4>
                    {savings > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-[#fed7aa] text-[#9a3412]">
                          SAVE Rs {savings.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">
                          ({percent}% OFF)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base sm:text-lg font-black text-neutral-950">
                    Rs {combo.sellingPrice.toLocaleString()}
                  </div>
                  {combo.originalPrice > combo.sellingPrice && (
                    <div className="text-xs text-neutral-400 line-through">
                      Rs {combo.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Combo products split preview with "+" icon */}
              {combo.items && combo.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center gap-2 flex-wrap">
                  {combo.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white border border-neutral-200 p-1">
                        <ThumbnailImg src={item.image} alt={item.productName} />
                        <span className="text-xs font-bold text-neutral-900 truncate max-w-[120px]">
                          {item.productName}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500">x{item.quantity}</span>
                      </div>
                      {idx < combo.items.length - 1 && (
                        <div className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-black">
                          +
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stock warning alert box matching screenshot ref_3 */}
      {isOutOfStockForSelectedBundle && (
        <div className="bg-red-50 border border-red-300 p-3 flex items-start gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              There's not enough items in our stock, please select smaller bundle.
            </p>
          </div>
        </div>
      )}

      {/* Savings Notification Banner matching screenshot */}
      {selectedSavings > 0 && !isOutOfStockForSelectedBundle && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-[13px] text-[#15803d] font-semibold">
          <span className="text-[#16a34a] font-bold text-sm leading-none shrink-0">→</span>
          <span>You're saving Rs{selectedSavings.toLocaleString()}.00 on this order</span>
        </div>
      )}

      {/* Optional purchase buttons if rendered inside BuyMoreSaveMore */}
      {showPurchaseButtons && (
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isOutOfStockForSelectedBundle}
            className={`w-full font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-4 transition-all flex items-center justify-center gap-2 ${
              isOutOfStockForSelectedBundle
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'border-2 border-neutral-950 bg-white hover:bg-neutral-50 text-neutral-950 cursor-pointer'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStockForSelectedBundle ? 'Sold out' : 'Add to cart'}</span>
          </button>

          <button
            type="button"
            onClick={onBuyNow}
            disabled={isOutOfStockForSelectedBundle}
            className={`w-full font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-4 transition-all flex items-center justify-center gap-2 ${
              isOutOfStockForSelectedBundle
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-neutral-950 hover:bg-neutral-800 text-white cursor-pointer shadow-md'
            }`}
          >
            <span>{isOutOfStockForSelectedBundle ? 'Sold out' : 'Buy it now'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
