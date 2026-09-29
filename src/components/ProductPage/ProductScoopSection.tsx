import { ShoppingBag } from 'lucide-react';
import { ScoopEditorialConfig } from '../../types';
import { useResolvedMediaUrl } from '../../services/storageService';

interface ProductScoopSectionProps {
  config?: ScoopEditorialConfig;
  productName: string;
  price: number;
  isSoldOut?: boolean;
  onAddToCart: () => void;
}

function ResolvedEditorialImage({ src, alt }: { src: string; alt: string }) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) return null;
  return (
    <div className="aspect-square bg-[#F9F9F8] border border-neutral-200/80 overflow-hidden flex items-center justify-center p-4">
      <img
        src={resolved}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
      />
    </div>
  );
}

export default function ProductScoopSection({
  config,
  productName,
  price,
  isSoldOut = false,
  onAddToCart
}: ProductScoopSectionProps) {
  if (config && config.enabled === false) return null;

  const heading = config?.heading || 'In Every Scoop of Wellcore Creatine';
  const description =
    config?.description ||
    'Wellcore Creatine complements your training. Taken daily, it supports the Strength and Power you build session after session — the kind of results that show up over weeks, not days. Mix your scoop, then train.';
  const ctaText = config?.ctaText || 'Add to Cart';
  const images = (config?.images || []).filter(Boolean);

  return (
    <section className="w-full py-12 sm:py-16 bg-white border-t border-neutral-200/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Editorial Copy & Prominent Add to Cart CTA */}
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-950 tracking-tight leading-tight"
            style={{ textWrap: 'balance' }}
          >
            {heading}
          </h2>

          <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal max-w-2xl mx-auto">
            {description}
          </p>

          <div className="pt-3 flex justify-center">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isSoldOut}
              className={`px-9 py-4 font-black text-sm sm:text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 whitespace-nowrap ${
                isSoldOut
                  ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                  : 'bg-[#0c1a3b] hover:bg-neutral-900 active:scale-95 text-white shadow-md cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>
                {isSoldOut
                  ? 'Sold Out'
                  : `${ctaText} — Rs ${price.toLocaleString('en-US')}`}
              </span>
            </button>
          </div>
        </div>

        {/* Product / Benefit Visual Gallery Below */}
        {images.length > 0 && (
          <div
            className={`mt-10 sm:mt-12 grid gap-4 sm:gap-6 ${
              images.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : images.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                : 'grid-cols-1 sm:grid-cols-3'
            }`}
          >
            {images.map((imgSrc, idx) => (
              <ResolvedEditorialImage
                key={`${idx}-${imgSrc.slice(-16)}`}
                src={imgSrc}
                alt={`${productName} benefit visual ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
