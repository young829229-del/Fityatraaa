import { StoreBanner } from '../types';
import { useResolvedMediaUrl } from '../services/storageService';

interface HeroProps {
  onBuyNowClick: () => void;
  heroBanner?: StoreBanner;
}

export default function Hero({ onBuyNowClick, heroBanner }: HeroProps) {
  const rawImage =
    heroBanner?.enabled && heroBanner.imageUrl
      ? heroBanner.imageUrl
      : 'https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg';
  const rawVideo = heroBanner?.enabled && heroBanner.videoUrl ? heroBanner.videoUrl : '';
  const bannerImage = useResolvedMediaUrl(rawImage);
  const bannerVideo = useResolvedMediaUrl(rawVideo);
  const buttonText =
    heroBanner?.enabled && heroBanner.buttonText ? heroBanner.buttonText : 'Buy Now';

  return (
    <section id="hero" className="relative w-full overflow-hidden bg-black flex flex-col items-center">
      {/* Hero Statue Image with "REDEFINE YOURSELF." (or live Admin Hero Banner override) */}
      <div className="relative w-full aspect-[9/16] sm:aspect-auto sm:h-[80vh] md:h-[88vh] max-h-[920px]">
        {bannerVideo ? (
          <video
            src={bannerVideo}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <img
            src={bannerImage}
            alt="Redefine Yourself - FitYatra"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
        )}
      </div>

      {/* Buy Now Button Positioned Down Below the Banner */}
      <div className="w-full bg-black flex justify-center py-6 sm:py-8 px-4 z-10 border-b border-black">
        <button
          type="button"
          onClick={onBuyNowClick}
          className="bg-white text-neutral-950 font-bold text-sm sm:text-base tracking-wide px-12 py-3.5 rounded-none shadow-xl hover:bg-neutral-100 active:scale-[0.98] transition-all duration-150 cursor-pointer min-w-[170px] text-center"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}
