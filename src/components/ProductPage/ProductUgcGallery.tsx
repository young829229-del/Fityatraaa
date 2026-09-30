import { useState, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { CustomerUGCImage } from '../../types';
import { useResolvedMediaUrl } from '../../services/storageService';

function ResolvedUgcImg({ src, alt }: { src: string; alt: string }) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) return <div className="w-full h-full bg-neutral-200 animate-pulse" />;
  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover"
    />
  );
}

interface ProductUgcGalleryProps {
  images?: CustomerUGCImage[];
}

export default function ProductUgcGallery({ images = [] }: ProductUgcGalleryProps) {
  const activeImages = images.filter((img) => img.enabled !== false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (activeImages.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      prevReview();
    }
    setTouchStart(null);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  };

  const current = activeImages[currentIndex];
  const prevImg = activeImages[(currentIndex - 1 + activeImages.length) % activeImages.length];
  const nextImg = activeImages[(currentIndex + 1) % activeImages.length];

  return (
    <section className="w-full py-8 sm:py-12 bg-white border-t border-neutral-100 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
            COMMUNITY & REAL RESULTS
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-1">
            VERIFIED ATHLETE UNBOXINGS & RESULTS
          </h3>
        </div>

        {/* 3-Image Horizontal / Stacked Gallery matching the exact screenshot design */}
        <div
          className="relative flex items-center justify-center gap-2 sm:gap-4 my-4 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Partial Left Image */}
          {activeImages.length > 1 && (
            <div
              onClick={handlePrev}
              className="w-20 sm:w-36 h-44 sm:h-64 rounded-3xl overflow-hidden bg-neutral-100 shadow-md opacity-60 hover:opacity-90 transition-all cursor-pointer shrink-0 scale-95"
            >
              <ResolvedUgcImg
                src={prevImg.url}
                alt={prevImg.caption || 'Customer review'}
              />
            </div>
          )}

          {/* Main Large Center Customer Image */}
          <div className="w-48 sm:w-64 h-60 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-2 border-neutral-900 bg-neutral-900 shrink-0 relative transition-transform duration-300">
            <ResolvedUgcImg
              src={current.url}
              alt={current.caption || 'Customer result'}
            />
            {current.customerName && (
              <div className="absolute bottom-3 left-3 right-3 bg-neutral-900/85 backdrop-blur-xs text-white p-2 rounded-xl text-left">
                <div className="flex items-center gap-1 text-[11px] font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{current.customerName}</span>
                </div>
                {current.caption && (
                  <p className="text-[10px] text-neutral-300 truncate mt-0.5">
                    {current.caption}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Partial Right Image */}
          {activeImages.length > 2 && (
            <div
              onClick={handleNext}
              className="w-20 sm:w-36 h-44 sm:h-64 rounded-3xl overflow-hidden bg-neutral-100 shadow-md opacity-60 hover:opacity-90 transition-all cursor-pointer shrink-0 scale-95"
            >
              <ResolvedUgcImg
                src={nextImg.url}
                alt={nextImg.caption || 'Customer review'}
              />
            </div>
          )}

          {/* Navigation arrow buttons */}
          {activeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-1 sm:left-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-colors cursor-pointer z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-1 sm:right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-colors cursor-pointer z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Carousel indicators */}
        {activeImages.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-3">
            {activeImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  currentIndex === idx ? 'w-5 h-1.5 bg-neutral-800' : 'w-1.5 h-1.5 bg-neutral-300'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
