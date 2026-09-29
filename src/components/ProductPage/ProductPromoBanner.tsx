import { PromotionalBannerConfig } from '../../types';
import { useResolvedMediaUrl } from '../../services/storageService';
import { Truck } from 'lucide-react';

interface ProductPromoBannerProps {
  config?: PromotionalBannerConfig;
  onShopNow?: () => void;
}

export default function ProductPromoBanner({ config, onShopNow }: ProductPromoBannerProps) {
  const resolvedImage = useResolvedMediaUrl(config?.image);

  if (!config || !config.enabled) return null;

  const eyebrow = config.eyebrow || 'Limited Time';
  const heading = config.heading || 'FREE DELIVERY';
  const description = config.description || 'On Wellcore Creatine!';

  return (
    <section
      className="w-full my-8 sm:my-12 py-10 sm:py-14 px-4 sm:px-6 border-t border-b border-neutral-900"
      style={{
        backgroundColor: config.bgColor || '#070d19',
        color: config.textColor || '#FFFFFF'
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12">
        {/* Left / Center: Editorial Promotional Typography */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#FFCD00]">
            <Truck className="w-4 h-4" />
            <span>{eyebrow}</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase text-white"
            style={{ textWrap: 'balance' }}
          >
            {heading}
          </h2>

          <p className="text-lg sm:text-xl font-semibold text-neutral-200 leading-snug pt-1">
            {description}
          </p>

          {config.buttonText && (
            <div className="pt-3">
              <button
                type="button"
                onClick={onShopNow}
                className="bg-white text-neutral-950 hover:bg-neutral-200 active:scale-95 font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 transition-all cursor-pointer whitespace-nowrap"
              >
                {config.buttonText}
              </button>
            </div>
          )}
        </div>

        {/* Right: Promotional Product Visual */}
        {resolvedImage && (
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-full max-w-md overflow-hidden border border-white/15 bg-neutral-950">
              <img
                src={resolvedImage}
                alt={`${heading} — ${description}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-auto max-h-[340px] object-contain mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
