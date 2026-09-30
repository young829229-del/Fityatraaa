import { Product } from '../../types';

interface ProductInfoProps {
  product?: Product;
  title?: string;
  tagline?: string;
  brand?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  isSoldOut?: boolean;
}

export default function ProductInfo({
  product,
  title,
  tagline,
  price,
  originalPrice,
  isSoldOut
}: ProductInfoProps) {
  const resolvedTitle = title ?? product?.name ?? '';
  const resolvedPrice = price ?? product?.price ?? 0;
  const resolvedOriginalPrice = originalPrice ?? product?.originalPrice ?? resolvedPrice;
  const resolvedSoldOut =
    isSoldOut ??
    (Boolean(product?.isSoldOut) || (typeof product?.stock === 'number' && product.stock <= 0));

  const displayTagline =
    tagline ||
    product?.tagline ||
    product?.shortDescription ||
    '100% Authentic Supplement | Lab Tested in Nepal';

  return (
    <div className="space-y-2 pb-1">
      {/* Main Product Title */}
      <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] text-[#121212] leading-[1.18]">
        {resolvedTitle}
      </h1>

      {/* Subtitle / Tagline */}
      <p className="text-[14px] text-[#121212]/75 font-normal leading-relaxed">
        {displayTagline}
      </p>

      {/* Price & Status Row */}
      <div className="pt-1 flex flex-wrap items-center gap-3">
        {resolvedOriginalPrice > resolvedPrice && (
          <span className="text-[15px] text-[#121212]/55 line-through font-normal">
            Rs. {resolvedOriginalPrice.toLocaleString('en-US')}.00 NPR
          </span>
        )}
        <span className="text-[18px] font-bold text-[#121212] tracking-tight">
          Rs. {resolvedPrice.toLocaleString('en-US')}.00 NPR
        </span>

        {resolvedSoldOut ? (
          <span className="bg-[#242833] text-white text-[11px] font-medium px-3 py-0.5 rounded-full tracking-wide">
            Sold out
          </span>
        ) : (
          <span className="bg-[#121212] text-white text-[11px] font-medium px-3 py-0.5 rounded-full tracking-wide">
            Sale
          </span>
        )}
      </div>
    </div>
  );
}
