import {
  useState,
  useRef,
  TouchEvent,
  MouseEvent as ReactMouseEvent
} from 'react';
import { Star, Check } from 'lucide-react';
import { useResolvedMediaUrl } from '../services/storageService';

export interface CarouselReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  verified?: boolean;
  productName?: string;
  location?: string;
  date?: string;
}

interface ReviewCarouselProps {
  reviews: CarouselReviewItem[];
  heading?: string;
  subheading?: string;
  eyebrow?: string;
  sectionId?: string;
  className?: string;
}

function ResolvedReviewerImage({
  src,
  alt,
  className
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) {
    return <div className={`w-full h-full bg-[#8D8E82] ${className || ''}`} />;
  }
  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      draggable={false}
      loading="lazy"
      className={className}
    />
  );
}

export default function ReviewCarousel({
  reviews,
  sectionId = 'reviews',
  className = ''
}: ReviewCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const prashantIdx = reviews?.findIndex((r) => r.name?.toLowerCase().includes('prashant'));
    return prashantIdx !== undefined && prashantIdx >= 0 ? prashantIdx : 0;
  });
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartXRef = useRef<number | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const didDragMoveRef = useRef<boolean>(false);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const total = reviews.length;
  const safeActiveIndex = ((activeIndex % total) + total) % total;
  const prevIndex = (safeActiveIndex - 1 + total) % total;
  const nextIndex = (safeActiveIndex + 1) % total;

  const activeReview = reviews[safeActiveIndex];
  const ratingCount = Math.max(1, Math.min(5, Math.round(activeReview.rating || 5)));
  const isVerified = activeReview.verified !== false;

  const handleNext = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => prev - 1);
  };

  // Touch swipe handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (total <= 1) return;
    dragStartXRef.current = e.touches[0].clientX;
    dragStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    didDragMoveRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartXRef.current === null || dragStartYRef.current === null) return;
    const dx = e.touches[0].clientX - dragStartXRef.current;
    const dy = e.touches[0].clientY - dragStartYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontalSwipeRef.current) {
      if (Math.abs(dx) > 6) didDragMoveRef.current = true;
      setDragDeltaX(dx);
    }
  };

  const finishDrag = () => {
    if (!isDragging) return;
    const threshold = 36;
    if (dragDeltaX <= -threshold) {
      handleNext();
    } else if (dragDeltaX >= threshold) {
      handlePrev();
    }
    setIsDragging(false);
    setDragDeltaX(0);
    dragStartXRef.current = null;
    dragStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  // Desktop mouse drag handlers
  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (total <= 1 || e.button !== 0) return;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    didDragMoveRef.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartXRef.current === null) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 6) didDragMoveRef.current = true;
    setDragDeltaX(dx);
  };

  // Build the 3 visible slots: [Left Narrow Pill, Wide Center Photo, Right Narrow Pill]
  // Keyed by review item identity so the side pill smoothly expands into the center frame on swipe
  const slots =
    total === 1
      ? [{ pos: 'center' as const, idx: 0, item: reviews[0], key: `rev-${reviews[0].id || 0}` }]
      : [
          {
            pos: 'left' as const,
            idx: prevIndex,
            item: reviews[prevIndex],
            key: `rev-${reviews[prevIndex].id || prevIndex}`
          },
          {
            pos: 'center' as const,
            idx: safeActiveIndex,
            item: reviews[safeActiveIndex],
            key: `rev-${reviews[safeActiveIndex].id || safeActiveIndex}`
          },
          {
            pos: 'right' as const,
            idx: nextIndex,
            item: reviews[nextIndex],
            key:
              total === 2
                ? `rev-${reviews[nextIndex].id || nextIndex}-right-dup`
                : `rev-${reviews[nextIndex].id || nextIndex}`
          }
        ];

  return (
    <section
      id={sectionId}
      className={`w-full py-8 sm:py-12 bg-white overflow-hidden select-none ${className}`}
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={finishDrag}
        onTouchCancel={finishDrag}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={finishDrag}
        onMouseLeave={finishDrag}
        className={`max-w-[420px] sm:max-w-[540px] mx-auto px-5 ${
          total > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
      >
        {/* 1. TOP 3-PANEL PHOTO GALLERY: Narrow Left Pill + Wide Rounded Center + Narrow Right Pill */}
        <div
          style={{
            transform: isDragging ? `translate3d(${dragDeltaX * 0.22}px, 0, 0)` : 'translate3d(0, 0, 0)',
            transition: isDragging ? 'none' : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
          className="flex items-center justify-center gap-2.5 sm:gap-3.5 h-[335px] sm:h-[390px] w-full"
        >
          {slots.map((slot) => {
            const isCenter = slot.pos === 'center';
            return (
              <div
                key={slot.key}
                onClick={() => {
                  if (didDragMoveRef.current) return;
                  if (slot.pos === 'left') handlePrev();
                  if (slot.pos === 'right') handleNext();
                }}
                className={`h-full overflow-hidden bg-[#8D8E82] rounded-[26px] sm:rounded-[32px] transition-[flex,width,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isCenter
                    ? 'flex-1'
                    : 'w-[52px] sm:w-[64px] shrink-0 cursor-pointer hover:opacity-95'
                }`}
              >
                <ResolvedReviewerImage
                  src={slot.item.imageUrl}
                  alt={slot.item.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500"
                />
              </div>
            );
          })}
        </div>

        {/* 2. BOTTOM WARM CREAM REVIEW CARD (#FAF3F0) */}
        <div className="relative mt-4 bg-[#FAF3F0] rounded-[28px] px-6 pt-6 pb-8 text-center">
          {/* 5 Orange Stars */}
          <div className="flex items-center justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-[19px] h-[19px] ${
                  i < ratingCount
                    ? 'fill-[#F5820D] text-[#F5820D]'
                    : 'fill-[#E6DCD5] text-[#E6DCD5]'
                }`}
              />
            ))}
          </div>

          {/* Review Text (No quotation marks around text, matching screenshot) */}
          <p className="mt-3.5 text-[#333333] text-[15.5px] sm:text-[16.5px] leading-[1.48] font-normal line-clamp-3 min-h-[4.4rem]">
            {activeReview.comment}
          </p>

          {/* Verified Check Circle + Reviewer Name */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {isVerified && (
              <span
                className="w-[17px] h-[17px] rounded-full bg-[#6E5A4F] text-white inline-flex items-center justify-center shrink-0"
                aria-label="Verified Buyer"
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <span className="text-[15.5px] sm:text-[16px] text-[#222222] font-normal">
              {activeReview.name}
            </span>
          </div>

          {/* Overlapping Brown Double Quote Mark ("66") at Bottom Edge */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 -bottom-[17px] flex items-center gap-1"
          >
            <svg
              width="34"
              height="28"
              viewBox="0 0 34 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#6E5A4F]"
            >
              <path
                d="M11.6 0C6.2 3.2 2.4 8.6 2.4 15.6C2.4 21.4 5.8 25.2 10.2 25.2C14.2 25.2 16.8 22.4 16.8 18.6C16.8 14.8 14.0 12.2 10.6 12.2C9.6 12.2 8.4 12.5 7.8 12.8C8.4 8.6 11.2 4.6 14.8 2.4L11.6 0ZM28.8 0C23.4 3.2 19.6 8.6 19.6 15.6C19.6 21.4 23.0 25.2 27.4 25.2C31.4 25.2 34.0 22.4 34.0 18.6C34.0 14.8 31.2 12.2 27.8 12.2C26.8 12.2 25.6 12.5 25.0 12.8C25.6 8.6 28.4 4.6 32.0 2.4L28.8 0Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* 3. PAGINATION DOTS + ACTIVE BROWN PILL */}
        {total > 1 && (
          <div className="mt-7 flex items-center justify-center gap-2">
            {reviews.map((rev, idx) => {
              const isCurrent = idx === safeActiveIndex;
              return (
                <button
                  key={rev.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`h-[7px] rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'w-[26px] bg-[#6E5A4F]'
                      : 'w-[7px] bg-[#E2D9D3] hover:bg-[#C8B9B0]'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
