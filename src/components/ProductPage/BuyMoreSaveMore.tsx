import { useState } from 'react';
import { Check, Flame, Sparkles } from 'lucide-react';
import { BundleDeal, ProductOption } from '../../types';

interface BuyMoreSaveMoreProps {
  bundles: BundleDeal[];
  selectedBundleId: string;
  onSelectBundle: (bundle: BundleDeal) => void;
  availableFlavors?: string[];
  selectedBundleFlavors: string[];
  onBundleFlavorChange: (index: number, flavor: string) => void;
}

export default function BuyMoreSaveMore({
  bundles = [],
  selectedBundleId,
  onSelectBundle,
  availableFlavors = ['Lemon Lime', 'Tropical Tango 307g', 'Unflavored (250g)', 'Fruit Punch (250g)'],
  selectedBundleFlavors,
  onBundleFlavorChange
}: BuyMoreSaveMoreProps) {
  if (bundles.length === 0) return null;

  const currentBundle = bundles.find((b) => b.id === selectedBundleId) || bundles[0];

  return (
    <div className="w-full flex flex-col space-y-3 py-3 border-t border-b border-neutral-100 my-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Buy More, Save More</span>
        </h3>
        <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-200">
          Save Up to 37%
        </span>
      </div>

      {/* Bundles Selection Grid / List */}
      <div className="flex flex-col space-y-2.5">
        {bundles.map((bundle) => {
          const isSelected = bundle.id === selectedBundleId;
          const savings = bundle.savingsAmount || (bundle.originalPrice - bundle.price);
          const percent = bundle.savingsPercentage || Math.round((savings / bundle.originalPrice) * 100);

          return (
            <div
              key={bundle.id}
              onClick={() => onSelectBundle(bundle)}
              className={`relative border-2 p-3 sm:p-4 transition-all cursor-pointer rounded-none ${
                isSelected
                  ? 'border-neutral-950 bg-neutral-50/70 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
              }`}
            >
              {/* Badge text (e.g. MOST POPULAR, BEST VALUE) */}
              {bundle.badgeText && (
                <div
                  className={`absolute -top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 shadow-xs ${
                    bundle.isPopular
                      ? 'bg-[#FFCD00] text-black border border-black/10'
                      : 'bg-neutral-900 text-white'
                  }`}
                >
                  {bundle.badgeText}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                {/* Radio Circle & Quantity Title */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-neutral-950">
                      {bundle.title} ({bundle.quantity} {bundle.quantity === 1 ? 'Unit' : 'Units'})
                    </h4>
                    {savings > 0 ? (
                      <p className="text-xs font-semibold text-emerald-700">
                        Save Rs {savings.toLocaleString()} ({percent}% OFF)
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500">Standard single order</p>
                    )}
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-neutral-950">
                    Rs {bundle.price.toLocaleString()}
                  </div>
                  {bundle.originalPrice > bundle.price && (
                    <div className="text-xs text-neutral-400 line-through">
                      Rs {bundle.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-flavor selectors when multiple units selected and requiresMultipleFlavors is true */}
              {isSelected && bundle.quantity > 1 && availableFlavors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200/80 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Select Flavors For Each Unit:</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[...Array(bundle.quantity)].map((_, unitIdx) => {
                      const selectedFlavor =
                        selectedBundleFlavors[unitIdx] || availableFlavors[0] || 'Unflavored';
                      return (
                        <div key={unitIdx} className="flex items-center gap-2 bg-white p-2 border border-neutral-200">
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
      </div>
    </div>
  );
}
