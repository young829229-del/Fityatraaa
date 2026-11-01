import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreBanner } from '../types';
import { useResolvedMediaUrl } from '../services/storageService';

interface BannerCarouselProps {
  banners: StoreBanner[];
  onBuyNowClick: () => void;
}

export default function BannerCarousel({ banners, onBuyNowClick }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeBanners = banners.filter((b) => b.enabled && b.displayLocation === 'hero').sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-black aspect-[9/16] sm:aspect-auto sm:h-[80vh] md:h-[88vh] max-h-[920px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBanners[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {activeBanners[currentIndex].videoUrl ? (
            <video
              src={useResolvedMediaUrl(activeBanners[currentIndex].videoUrl!) || activeBanners[currentIndex].videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={useResolvedMediaUrl(activeBanners[currentIndex].imageUrl) || activeBanners[currentIndex].imageUrl}
              alt={activeBanners[currentIndex].title}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-10">
        {activeBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full ${currentIndex === i ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}
