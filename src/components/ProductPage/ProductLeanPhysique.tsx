import { ArrowUpRight } from 'lucide-react';
import { BuildPhysiqueConfig } from '../../types';
import { useResolvedMediaUrl } from '../../services/storageService';

interface ProductLeanPhysiqueProps {
  config?: BuildPhysiqueConfig;
  defaultImage?: string;
  onShopNow: () => void;
}

export default function ProductLeanPhysique({
  config,
  defaultImage,
  onShopNow
}: ProductLeanPhysiqueProps) {
  const resolvedImg = useResolvedMediaUrl(config?.image || defaultImage);

  if (config && config.enabled === false) return null;

  const heading = config?.heading || 'Build Lean Physique';
  const subtitle =
    config?.subtitle || 'Premium quality you can trust. Fair pricing. Hassle-free returns.';
  const badges =
    config?.badges && config.badges.length > 0
      ? config.badges
      : ['Strength', 'Energy', 'Muscle Fullness'];
  const buttonText = config?.buttonText || 'Shop Now';

  return (
    <section className="w-full py-14 sm:py-20 bg-[#0b1528] text-white border-t border-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left: Editorial Copy, 3 Benefit Labels, and Shop Now CTA */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              {heading}
            </h2>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
              {subtitle}
            </p>

            {/* Three Benefit Labels: Strength, Energy, Muscle Fullness */}
            <div className="w-full pt-2 grid grid-cols-3 gap-3 sm:gap-4 max-w-md md:max-w-lg">
              {badges.map((label, idx) => (
                <div
                  key={`${idx}-${label}`}
                  className="border border-white/20 bg-white/5 px-3 py-3 text-center"
                >
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white block whitespace-nowrap truncate">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={onShopNow}
                className="bg-white text-neutral-950 hover:bg-neutral-200 active:scale-95 font-black text-xs sm:text-sm uppercase tracking-wider px-8 py-4 transition-all inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>{buttonText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Strong Product Image */}
          <div className="md:col-span-5 flex justify-center">
            {resolvedImg && (
              <div className="w-full max-w-sm aspect-square bg-white/5 border border-white/15 p-6 flex items-center justify-center overflow-hidden">
                <img
                  src={resolvedImg}
                  alt={heading}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
