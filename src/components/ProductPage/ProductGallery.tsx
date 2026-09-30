import { useState, useRef, useEffect, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Package } from 'lucide-react';
import { useResolvedMediaUrl } from '../../services/storageService';

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string;
  productName: string;
}

function ResolvedGalleryImage({
  src,
  alt,
  className
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const resolvedSrc = useResolvedMediaUrl(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src, resolvedSrc]);

  if (src && !resolvedSrc) {
    return <div className="w-full h-full bg-[#F9F9F8] animate-pulse" />;
  }

  if (!resolvedSrc || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-4 text-center">
        <Package className="w-10 h-10 mb-2 stroke-[1.3]" />
        <span className="text-xs font-medium text-neutral-500 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

export default function ProductGallery({
  images = [],
  videoUrl,
  productName
}: ProductGalleryProps) {
  const resolvedVideoUrl = useResolvedMediaUrl(videoUrl);

  // Filter out empty image strings and build gallery items array
  const validImages = images.filter(Boolean);
  const galleryItems = [
    ...validImages.map((src, i) => ({ type: 'image' as const, src, id: `img-${i}` })),
    ...(videoUrl
      ? [{ type: 'video' as const, src: resolvedVideoUrl || videoUrl, id: 'video-main' }]
      : [])
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const safeIndex = Math.min(activeIndex, Math.max(0, galleryItems.length - 1));
  const currentItem = galleryItems[safeIndex] || { type: 'image', src: '', id: 'empty' };

  const handleNext = () => {
    if (galleryItems.length <= 1) return;
    const nextIdx = (safeIndex + 1) % galleryItems.length;
    scrollToThumbnail(nextIdx);
  };

  const handlePrev = () => {
    if (galleryItems.length <= 1) return;
    const prevIdx = (safeIndex - 1 + galleryItems.length) % galleryItems.length;
    scrollToThumbnail(prevIdx);
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 36) {
      handleNext();
    } else if (diff < -36) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const scrollToThumbnail = (idx: number) => {
    setActiveIndex(idx);
    if (thumbnailContainerRef.current) {
      const el = thumbnailContainerRef.current.children[idx] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Primary Product Image / Video Display */}
      <div
        className="relative w-full aspect-square bg-[#F9F9F8] border border-neutral-200/80 overflow-hidden flex items-center justify-center select-none group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentItem.type === 'video' ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              src={currentItem.src}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-4 right-4 p-2.5 bg-black/75 hover:bg-black text-white rounded-full transition-colors cursor-pointer z-10"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <ResolvedGalleryImage
            src={currentItem.src}
            alt={`${productName} — View ${safeIndex + 1}`}
            className="w-full h-full object-contain p-3 sm:p-6 transition-opacity duration-200"
          />
        )}

        {/* Prev / Next Navigation Controls */}
        {galleryItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-neutral-900 shadow-sm flex items-center justify-center border border-neutral-200 transition-transform active:scale-95 cursor-pointer z-10"
              aria-label="Previous product image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-neutral-900 shadow-sm flex items-center justify-center border border-neutral-200 transition-transform active:scale-95 cursor-pointer z-10"
              aria-label="Next product image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Mobile Swipe Dots & Slide Counter */}
        {galleryItems.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/85 backdrop-blur-xs px-3 py-1.5 border border-neutral-200/80 z-10">
            {galleryItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToThumbnail(idx)}
                aria-label={`Go to image ${idx + 1}`}
                className={`h-1.5 transition-all cursor-pointer ${
                  idx === safeIndex ? 'w-5 bg-neutral-950' : 'w-1.5 bg-neutral-300 hover:bg-neutral-500'
                }`}
              />
            ))}
            <span className="ml-1.5 text-[11px] font-mono tabular-nums text-neutral-600">
              {safeIndex + 1}/{galleryItems.length}
            </span>
          </div>
        )}
      </div>

      {/* Multi-Image Thumbnail Strip */}
      {galleryItems.length > 1 && (
        <div
          ref={thumbnailContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto py-3.5 px-0.5 no-scrollbar scroll-smooth"
        >
          {galleryItems.map((item, idx) => {
            const isSelected = idx === safeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToThumbnail(idx)}
                className={`relative shrink-0 w-18 h-18 sm:w-20 sm:h-20 bg-[#F9F9F8] border-2 overflow-hidden transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-neutral-950 ring-1 ring-neutral-950/20 opacity-100'
                    : 'border-neutral-200 hover:border-neutral-400 opacity-65 hover:opacity-100'
                }`}
                aria-label={`Select product image ${idx + 1}`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-white">
                    <Play className="w-5 h-5 fill-white mb-0.5" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">Video</span>
                  </div>
                ) : (
                  <ResolvedGalleryImage
                    src={item.src}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain p-1.5"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
