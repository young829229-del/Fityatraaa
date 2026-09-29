import { Star } from 'lucide-react';

interface ProductRatingProps {
  rating?: number;
  reviewCount?: number;
  onScrollToReviews?: () => void;
}

export default function ProductRating({
  rating = 5,
  reviewCount = 39,
  onScrollToReviews
}: ProductRatingProps) {
  const handleClick = () => {
    if (onScrollToReviews) {
      onScrollToReviews();
    } else {
      const el = document.getElementById('customer-reviews') || document.getElementById('testimonials');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex items-center gap-2 pt-3 pb-1">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 group cursor-pointer text-left"
        aria-label={`Rated ${rating} out of 5 stars based on ${reviewCount} reviews. Click to view reviews.`}
      >
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(rating)
                  ? 'fill-[#F59E0B] text-[#F59E0B]'
                  : 'fill-neutral-200 text-neutral-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs sm:text-sm font-semibold text-neutral-600 group-hover:text-black underline underline-offset-2 decoration-neutral-300 transition-colors">
          ({reviewCount} reviews)
        </span>
      </button>
    </div>
  );
}
