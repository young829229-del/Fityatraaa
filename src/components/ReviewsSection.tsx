import { ReviewRecord } from '../types';
import ReviewCarousel, { CarouselReviewItem } from './ReviewCarousel';

interface ReviewsSectionProps {
  reviews?: ReviewRecord[];
}

export default function ReviewsSection({ reviews = [] }: ReviewsSectionProps) {
  // Only display published / approved reviews from the database
  const approvedReviews: CarouselReviewItem[] = reviews
    .filter((r) => r.status === 'approved')
    .map((r) => ({
      id: r.id,
      name: r.name,
      rating: r.rating || 5,
      comment: r.comment,
      imageUrl: r.imageUrl,
      verified: r.verified ?? true,
      productName: r.productName,
      location: r.location
    }));

  if (approvedReviews.length === 0) {
    return null;
  }

  return (
    <ReviewCarousel
      reviews={approvedReviews}
      eyebrow="VERIFIED CUSTOMER REVIEWS"
      heading="See What Our Real Customers Have to Say"
      subheading="Trusted by thousands of lifters and athletes across Nepal."
      sectionId="reviews"
    />
  );
}
