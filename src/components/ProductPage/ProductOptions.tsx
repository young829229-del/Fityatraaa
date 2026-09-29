import { Minus, Plus } from 'lucide-react';
import { ProductOption } from '../../types';

interface ProductOptionsProps {
  options?: ProductOption[];
  variants?: string[];
  selectedOptionValues: Record<string, string>;
  onOptionChange: (optionName: string, value: string) => void;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  maxStock?: number;
  isSoldOut?: boolean;
}

export default function ProductOptions({
  options,
  variants,
  selectedOptionValues,
  onOptionChange,
  quantity,
  onQuantityChange,
  maxStock = 50,
  isSoldOut = false
}: ProductOptionsProps) {
  // Normalize options: ensure both Flavor and Variant selectors render cleanly when available
  const resolvedOptions: ProductOption[] =
    options && options.length > 0
      ? options
      : variants && variants.length > 0
      ? [{ name: 'Flavor', values: variants }]
      : [];

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    const limit = maxStock > 0 ? maxStock : 99;
    if (quantity < limit) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-5 py-3">
      {/* Option Selectors (Flavor selector, Product variant selector) */}
      {resolvedOptions.map((opt) => {
        const currentValue = selectedOptionValues[opt.name] || opt.values[0] || '';
        return (
          <div key={opt.name} className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-neutral-800">
                {opt.name}:{' '}
                <span className="text-neutral-950 font-extrabold">{currentValue}</span>
              </label>
            </div>

            {/* Interactive Option Buttons */}
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const isSelected = currentValue === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onOptionChange(opt.name, val)}
                    className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#0c1a3b] text-white border-[#0c1a3b] shadow-xs'
                        : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Quantity Selector: Minus button, Quantity number, Plus button */}
      <div className="flex flex-col space-y-2">
        <label className="text-xs sm:text-sm font-bold text-neutral-800">
          Quantity
        </label>
        <div className="inline-flex items-center border border-neutral-300 bg-white w-fit">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isSoldOut || quantity <= 1}
            aria-label="Decrease quantity"
            className="w-11 h-11 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span
            className="w-12 text-center text-sm sm:text-base font-bold text-neutral-950 tabular-nums select-none"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isSoldOut || (maxStock > 0 && quantity >= maxStock)}
            aria-label="Increase quantity"
            className="w-11 h-11 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
