import { ProductReview } from '../../types';
import ReviewCarousel, { CarouselReviewItem } from '../ReviewCarousel';

const FALLBACK_TESTIMONIALS: ProductReview[] = [
  {
    id: 'fallback-1',
    name: 'Prashant M.',
    location: 'Kathmandu',
    rating: 5,
    comment:
      'I am using this product since week ago and I have noticed good changes in my strength and muscle recovery.',
    date: 'Verified Buyer',
    verified: true,
    image: 'https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg',
    productName: 'Wellcore Micronised Creatine Monohydrate'
  },
  {
    id: 'fallback-2',
    name: 'Rupesh T.',
    location: 'Kathmandu',
    rating: 5,
    comment:
      'Mixes effortlessly with water and zero bloating. Quick delivery inside Kathmandu valley with authentic lab seal!',
    date: 'Verified Buyer',
    verified: true,
    image: 'https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg',
    productName: 'Wellcore Micronised Creatine Monohydrate'
  },
  {
    id: 'fallback-3',
    name: 'Aayush Adhikari',
    location: 'Lalitpur',
    rating: 5,
    comment:
      'Fast dispatch, arrived next day with Cash on Delivery. Authentic batch code and great energy levels.',
    date: 'Verified Buyer',
    verified: true,
    image: 'https://i.ibb.co/dJBH98db/MV2-1-1-1-1.jpg',
    productName: 'Wellcore Micronised Creatine Monohydrate'
  },
  {
    id: 'fallback-4',
    name: 'Suman Karki',
    location: 'Bhaktapur',
    rating: 5,
    comment:
      'Verified original MuscleBlaze & Wellcore products. Great packaging and super responsive support team on WhatsApp.',
    date: 'Verified Buyer',
    verified: true,
    image: 'https://i.ibb.co/LD6MVb4K/MV2-1.jpg',
    productName: 'Wellcore Micronised Creatine Monohydrate'
  },
  {
    id: 'fallback-5',
    name: 'Bikash Shrestha',
    location: 'Pokhara',
    rating: 5,
    comment:
      '100% genuine seal checked with barcode QR. Noticeable strength improvement on bench within 2 weeks.',
    date: 'Verified Buyer',
    verified: true,
    image: 'https://i.ibb.co/r26k95J5/MV2-1-1.jpg',
    productName: 'Wellcore Micronised Creatine Monohydrate'
  }
];

interface ProductTestimonialProps {
  testimonials?: ProductReview[];
  productName?: string;
}

export default function ProductTestimonial({
  testimonials = [],
  productName
}: ProductTestimonialProps) {
  const sourceList = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;

  const items: CarouselReviewItem[] = sourceList
    .filter((t) => !t.status || t.status === 'approved')
    .map((t) => ({
      id: t.id,
      name: t.name,
      rating: t.rating || 5,
      comment: t.comment,
      imageUrl: t.image,
      verified: t.verified ?? true,
      productName: t.productName || productName,
      location: t.location,
      date: t.date
    }));

  if (items.length === 0) return null;

  return (
    <ReviewCarousel
      reviews={items}
      sectionId="customer-reviews"
    />
  );
}
