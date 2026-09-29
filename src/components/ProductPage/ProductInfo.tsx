interface ProductInfoProps {
  title: string;
  tagline?: string;
  brand?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  isSoldOut?: boolean;
}

export default function ProductInfo({
  title,
  tagline,
  price,
  originalPrice,
  discountPercentage,
  isSoldOut = false
}: ProductInfoProps) {
  const calculatedDiscount =
    discountPercentage ||
    (originalPrice && price && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);

  return (
    <div className="w-full flex flex-col space-y-3 py-2">
      {/* Main Product Title */}
      <h1
        className="text-2xl sm:text-3xl lg:text-[34px] font-black text-neutral-950 tracking-tight leading-[1.15]"
        style={{ textWrap: 'balance' }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {tagline && (
        <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
          {tagline}
        </p>
      )}

      {/* Pricing Block: Current Price, Original Crossed-Out Price, SAVE % / Sold Out Badge */}
      {typeof price === 'number' && (
        <div className="flex items-center flex-wrap gap-3 pt-1">
          <span className="text-2xl sm:text-3xl font-black text-neutral-950 tabular-nums">
            Rs {price.toLocaleString('en-US')}
          </span>

          {typeof originalPrice === 'number' && originalPrice > price && (
            <span className="text-base sm:text-lg text-neutral-400 line-through font-medium tabular-nums">
              Rs {originalPrice.toLocaleString('en-US')}
            </span>
          )}

          {isSoldOut ? (
            <span className="bg-neutral-900 text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1">
              Sold Out
            </span>
          ) : (
            calculatedDiscount > 0 && (
              <span className="bg-[#0c1a3b] text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1 tabular-nums">
                SAVE {calculatedDiscount}%
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}
