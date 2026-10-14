import { useState, useMemo } from 'react';
import { Check, ShoppingBag, Plus } from 'lucide-react';
import { Product, BundleConfig } from '../../types';
import { useResolvedMediaUrl } from '../../services/storageService';

function ProductImg({ src, alt }: { src?: string; alt: string }) {
  const resolved = useResolvedMediaUrl(src || '');
  return (
    <img
      src={resolved || src}
      alt={alt}
      className="w-14 h-14 sm:w-16 sm:h-16 object-contain bg-white border border-neutral-200 shrink-0 p-1"
    />
  );
}

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  bundleConfig?: BundleConfig;
  allProducts: Product[];
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariant?: string,
    bundle?: any,
    selectedFlavors?: string[]
  ) => void;
}

export default function FrequentlyBoughtTogether({
  currentProduct,
  bundleConfig,
  allProducts,
  onAddToCart
}: FrequentlyBoughtTogetherProps) {
  // Determine complementary items strictly from bundleConfig configured by admin
  const complementaryItems = useMemo(() => {
    if (bundleConfig && bundleConfig.items && bundleConfig.items.length > 0) {
      const itemsList = bundleConfig.items.filter((it) => it.productId !== currentProduct.id);
      const effectiveList = itemsList.length > 0 ? itemsList : bundleConfig.items;

      const mapped = effectiveList
        .map((it) => {
          const prod = allProducts.find((p) => p.id === it.productId);
          return prod ? { ...it, fullProduct: prod } : null;
        })
        .filter(Boolean) as (typeof bundleConfig.items[0] & { fullProduct: Product })[];

      if (mapped.length > 0) return mapped;
    }

    // Intelligent default fallback: pick another product as frequently bought together item
    const fallbackProd = allProducts.find((p) => p.id !== currentProduct.id);
    if (fallbackProd) {
      return [{
        productId: fallbackProd.id,
        productName: fallbackProd.name,
        price: fallbackProd.price,
        originalPrice: fallbackProd.originalPrice || fallbackProd.price,
        quantity: 1,
        fullProduct: fallbackProd
      }];
    }
    return [];
  }, [bundleConfig, allProducts, currentProduct.id]);

  if (complementaryItems.length === 0) {
    return null;
  }

  // Selected state for each item (current item is always index -1 / currentProduct and checked)
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = { [currentProduct.id]: true };
    complementaryItems.forEach((it) => {
      initial[it.productId] = true;
    });
    return initial;
  });

  // Selected variants for items
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    complementaryItems.forEach((it) => {
      const vars = it.fullProduct.variants || it.fullProduct.options?.[0]?.values || [];
      if (vars.length > 0) {
        initial[it.productId] = vars[0];
      }
    });
    return initial;
  });

  const toggleCheck = (id: string) => {
    if (id === currentProduct.id) return; // Primary item is locked
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVariantChange = (productId: string, variant: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  // Pricing calculations
  const discountPercent = bundleConfig?.frequentlyBoughtDiscountPercentage || 5;

  const currentProductPrice = currentProduct.price;
  const currentProductOrig = currentProduct.originalPrice || currentProduct.price;

  const activeItems = complementaryItems.filter((it) => checkedIds[it.productId]);
  const totalItemsCount = 1 + activeItems.length;

  const rawTotalPrice =
    currentProductPrice +
    activeItems.reduce((acc, it) => acc + it.price * (it.quantity || 1), 0);

  const rawTotalOrigPrice =
    currentProductOrig +
    activeItems.reduce((acc, it) => acc + (it.originalPrice || it.price) * (it.quantity || 1), 0);

  // Bundle discount applies if 2 or more items are selected
  const bundleDiscountAmount =
    totalItemsCount >= 2 ? Math.round(rawTotalPrice * (discountPercent / 100)) : 0;

  const finalTotalPrice = rawTotalPrice - bundleDiscountAmount;
  const totalSavings = (rawTotalOrigPrice - rawTotalPrice) + bundleDiscountAmount;

  const [isAdding, setIsAdding] = useState(false);

  const handleAddSelectedToCart = () => {
    if (isAdding) return;
    setIsAdding(true);

    // 1. Add current product with discount proportion if bundle discount active
    const ratio = rawTotalPrice > 0 ? finalTotalPrice / rawTotalPrice : 1;
    const currentAdjustedPrice = Math.round(currentProduct.price * ratio);

    onAddToCart(currentProduct, 1, undefined, {
      id: `fbt-primary-${currentProduct.id}`,
      title: `${currentProduct.name} (Bundle Deal)`,
      quantity: 1,
      price: currentAdjustedPrice,
      originalPrice: currentProductOrig,
      savingsAmount: currentProductOrig - currentAdjustedPrice,
      savingsPercentage: Math.round(((currentProductOrig - currentAdjustedPrice) / currentProductOrig) * 100)
    });

    // 2. Add each checked complementary item
    activeItems.forEach((it) => {
      const adjustedPrice = Math.round(it.price * ratio);
      const chosenVar = selectedVariants[it.productId];
      onAddToCart(it.fullProduct, it.quantity || 1, chosenVar, {
        id: `fbt-${it.productId}`,
        title: `${it.productName} (Bundle Deal)`,
        quantity: it.quantity || 1,
        price: adjustedPrice * (it.quantity || 1),
        originalPrice: (it.originalPrice || it.price) * (it.quantity || 1),
        savingsAmount: ((it.originalPrice || it.price) - adjustedPrice) * (it.quantity || 1),
        savingsPercentage: Math.round((((it.originalPrice || it.price) - adjustedPrice) / (it.originalPrice || it.price)) * 100)
      });
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  return (
    <div className="w-full my-6">
      <div className="mb-3">
        <h3 className="text-base sm:text-lg font-bold text-neutral-950">
          Frequently bought together
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Customers often add these items to their order.
        </p>
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Item 1: This item */}
        <div className="flex items-start gap-3 pb-3 border-b border-neutral-100">
          <div className="pt-1">
            <div className="w-4 h-4 bg-neutral-200 text-neutral-700 rounded flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <ProductImg src={currentProduct.image} alt={currentProduct.name} />

          <div className="flex-1 min-w-0">
            <span className="bg-[#1b7a4b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1">
              This item
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
              {currentProduct.name}
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentProduct.variants?.[0] || 'Chocolate'}
            </p>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs sm:text-sm font-bold text-neutral-950">
                Rs{currentProduct.price.toLocaleString()}.00
              </span>
              {currentProduct.originalPrice > currentProduct.price && (
                <span className="text-[11px] text-neutral-400 line-through">
                  Rs{currentProduct.originalPrice.toLocaleString()}.00
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Complementary Items Checklist */}
        {complementaryItems.map((it) => {
          const isChecked = Boolean(checkedIds[it.productId]);
          const variants = it.fullProduct.variants || it.fullProduct.options?.[0]?.values || [];
          const activeVariant = selectedVariants[it.productId] || variants[0];

          return (
            <div
              key={it.productId}
              className={`flex items-start gap-3 pb-3 border-b border-neutral-100 transition-opacity ${
                isChecked ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(it.productId)}
                  className="w-4 h-4 accent-black rounded cursor-pointer"
                />
              </div>

              <ProductImg src={it.image || it.fullProduct.image} alt={it.productName} />

              <div className="flex-1 min-w-0">
                <h4
                  onClick={() => toggleCheck(it.productId)}
                  className="text-xs sm:text-sm font-bold text-neutral-900 cursor-pointer hover:underline leading-snug"
                >
                  {it.productName}
                </h4>

                {/* Variant dropdown if product has variants */}
                {variants.length > 0 && isChecked && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <select
                      value={activeVariant}
                      onChange={(e) => handleVariantChange(it.productId, e.target.value)}
                      className="text-xs border border-neutral-200 rounded-lg py-1 px-2.5 bg-white font-medium cursor-pointer"
                    >
                      {variants.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xs sm:text-sm font-bold text-neutral-950">
                    Rs{it.price.toLocaleString()}.00
                  </span>
                  {it.originalPrice > it.price && (
                    <span className="text-[11px] text-neutral-400 line-through">
                      Rs{it.originalPrice.toLocaleString()}.00
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Total Price and Action Summary */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-baseline justify-between text-xs sm:text-sm">
            <span className="text-neutral-600 font-bold">Total price:</span>
            <div className="flex items-baseline gap-2">
              {rawTotalOrigPrice > finalTotalPrice && (
                <span className="text-xs text-neutral-400 line-through font-normal">
                  Rs {Math.round(rawTotalOrigPrice).toLocaleString()}
                </span>
              )}
              <span className="text-sm sm:text-base font-black text-neutral-950">
                Rs {Math.round(finalTotalPrice).toLocaleString()}
              </span>
            </div>
          </div>

          {bundleDiscountAmount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">Bundle discount ({discountPercent}%):</span>
              <span className="text-red-500 font-semibold">-Rs {Math.round(bundleDiscountAmount).toLocaleString()}</span>
            </div>
          )}

          {totalSavings > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#16a34a] font-bold">You save:</span>
              <span className="text-[#16a34a] font-bold">Rs {Math.round(totalSavings).toLocaleString()}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddSelectedToCart}
            disabled={isAdding}
            className="w-full mt-3 py-3.5 px-4 bg-black hover:bg-neutral-900 text-white font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-xs text-center"
          >
            {isAdding ? 'Adding items...' : `Add selected to cart (${totalItemsCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
