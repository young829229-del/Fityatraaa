import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Product, BundleDeal } from '../../types';
import { useResolvedMediaUrl } from '../../services/storageService';

interface ProductRelatedSectionProps {
  currentProductId: string;
  allProducts: Product[];
  heading?: string;
  subheading?: string;
  relatedProductIds?: string[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariant?: string,
    bundle?: BundleDeal,
    selectedFlavors?: string[]
  ) => void;
}

function RelatedProductCard({
  product,
  onSelectProduct,
  onAddToCart
}: {
  product: Product;
  onSelectProduct?: (product: Product) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariant?: string
  ) => void;
}) {
  const resolvedImage = useResolvedMediaUrl(product.image);
  const isOut =
    product.isSoldOut || (typeof product.stock === 'number' && product.stock <= 0);
  const discount =
    product.discountPercentage ||
    (product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOut) return;
    if (product.hasOptions && onSelectProduct) {
      onSelectProduct(product);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const defaultVariant =
      product.options?.[0]?.values?.[0] || product.variants?.[0] || undefined;
    onAddToCart(product, 1, defaultVariant);
  };

  return (
    <div
      onClick={handleCardClick}
      className="snap-start shrink-0 w-[250px] sm:w-[270px] md:w-full bg-white border border-neutral-200/90 hover:border-neutral-900 transition-all duration-150 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Product Image & Discount Badge */}
        <div className="relative aspect-square w-full bg-[#F9F9F8] overflow-hidden flex items-center justify-center p-4 border-b border-neutral-100">
          {resolvedImage && (
            <img
              src={resolvedImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
          )}

          {isOut ? (
            <span className="absolute top-3 left-3 bg-neutral-900 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1">
              Sold Out
            </span>
          ) : (
            discount > 0 && (
              <span className="absolute top-3 left-3 bg-[#0c1a3b] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 tabular-nums">
                {discount}% OFF
              </span>
            )
          )}
        </div>

        {/* Product Name & Pricing */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-neutral-950 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:underline underline-offset-2">
            {product.name}
          </h3>

          <div className="flex items-baseline flex-wrap gap-2 pt-0.5">
            <span className="text-base font-black text-neutral-950 tabular-nums">
              {product.pricePrefix || ''}Rs {product.price.toLocaleString('en-US')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through font-medium tabular-nums">
                Rs {product.originalPrice.toLocaleString('en-US')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart / Choose Options CTA */}
      <div className="px-4 pb-4 pt-1">
        <button
          type="button"
          onClick={handleActionClick}
          disabled={isOut}
          className={`w-full py-2.5 px-3 text-xs font-extrabold uppercase tracking-wider border transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            isOut
              ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
              : 'bg-white text-neutral-950 border-neutral-900 hover:bg-[#0c1a3b] hover:text-white hover:border-[#0c1a3b] cursor-pointer'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>
            {isOut ? 'Sold Out' : product.hasOptions ? 'Choose options' : 'Add to cart'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function ProductRelatedSection({
  currentProductId,
  allProducts = [],
  heading = 'You May Also Like',
  subheading = 'Complete Your Gains.',
  relatedProductIds,
  onSelectProduct,
  onAddToCart
}: ProductRelatedSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeProducts = allProducts.filter((p) => p.isActive !== false);

  let relatedList: Product[] = [];
  if (relatedProductIds && relatedProductIds.length > 0) {
    relatedList = relatedProductIds
      .map((id) => activeProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }

  if (relatedList.length === 0) {
    // Include other products from the database (plus current product if needed to match reference 4-card showcase)
    const others = activeProducts.filter((p) => p.id !== currentProductId);
    const currentProd = activeProducts.find((p) => p.id === currentProductId);
    relatedList = currentProd ? [currentProd, ...others].slice(0, 4) : others.slice(0, 4);
  }

  if (relatedList.length === 0) return null;

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = dir === 'left' ? -280 : 280;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section
      id="related-products"
      className="w-full py-14 sm:py-18 bg-white border-t border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Carousel Arrows */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
              {heading}
            </h2>
            {subheading && (
              <p className="text-sm sm:text-base text-neutral-600 font-medium mt-1">
                {subheading}
              </p>
            )}
          </div>

          {/* Mobile / Tablet Scroll Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll related products left"
              className="w-9 h-9 border border-neutral-300 flex items-center justify-center text-neutral-800 hover:border-black cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Scroll related products right"
              className="w-9 h-9 border border-neutral-300 flex items-center justify-center text-neutral-800 hover:border-black cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable Carousel on Mobile / 4-Column Grid on Desktop */}
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar"
        >
          {relatedList.map((rel) => (
            <RelatedProductCard
              key={rel.id}
              product={rel}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
