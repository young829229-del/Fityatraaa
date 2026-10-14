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

  // Default nutritional stats matching the reference screenshot
  const isProtein =
    product?.category?.toLowerCase().includes('protein') ||
    product?.name?.toLowerCase().includes('whey') ||
    product?.id?.includes('whey');

  const stats = [
    {
      icon: isProtein ? '💪' : '💪',
      value: isProtein ? '24g' : '3g',
      label: isProtein ? 'Protein per scoop' : 'Creapure® per scoop'
    },
    {
      icon: isProtein ? '🧬' : '⚡',
      value: isProtein ? '5.5g' : '100%',
      label: isProtein ? 'BCAAs' : 'Micronized'
    },
    {
      icon: isProtein ? '🔥' : '🔥',
      value: isProtein ? '120' : '0',
      label: isProtein ? 'Calories per scoop' : 'Zero Calories'
    },
    {
      icon: isProtein ? '🥄' : '🥄',
      value: isProtein ? '30' : (product?.servings ? product.servings.split(' ')[0] : '83'),
      label: isProtein ? 'Servings per tub' : 'Servings per tub'
    }
  ];

  return (
    <div className="space-y-1.5 pb-1">
      {/* Main Product Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 leading-tight">
        {resolvedTitle}
      </h1>

      {/* Product Tagline */}
      {displayTagline && (
        <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
          {displayTagline}
        </p>
      )}
    </div>
  );
}
