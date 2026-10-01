export interface ProductOption {
  name: string;
  values: string[];
}

export interface BundleDeal {
  id: string;
  title: string;
  quantity: number;
  price: number;
  originalPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  badgeText?: string;
  isPopular?: boolean;
  isDefault?: boolean;
  enabled?: boolean;
  requiresMultipleFlavors?: boolean;
  maxQuantity?: number;
  image?: string;
}

export interface ProductBenefit {
  id: string;
  icon: string; // Emoji, SVG icon name, or image URL
  title: string;
  description: string;
  enabled: boolean;
}

export interface CustomerUGCImage {
  id: string;
  url: string;
  customerName?: string;
  caption?: string;
  isFeatured?: boolean;
  enabled: boolean;
}

export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  location?: string;
  image?: string;
  productName?: string;
  status?: 'pending' | 'approved' | 'rejected';
  displayOrder?: number;
}

export interface PromotionalBannerConfig {
  enabled: boolean;
  eyebrow?: string;
  image: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor?: string;
  textColor?: string;
}

export interface ScoopEditorialConfig {
  enabled: boolean;
  heading: string;
  description: string;
  ctaText: string;
  images: string[];
}

export interface ProductFaqItem {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
}

export interface BuildPhysiqueConfig {
  enabled: boolean;
  heading: string;
  subtitle: string;
  badges: string[];
  image: string;
  buttonText: string;
}

export interface DeliveryInfoConfig {
  enabled: boolean;
  freeDeliveryText: string;
  estimatedWindow: string;
  codAvailableText: string;
  returnPolicyText: string;
}

export type ProductSectionType =
  | 'gallery'
  | 'rating'
  | 'product_info'
  | 'options'
  | 'bundles'
  | 'add_to_cart'
  | 'promo_banner'
  | 'scoop_editorial'
  | 'customer_ugc'
  | 'testimonials'
  | 'description'
  | 'description_cta'
  | 'benefits'
  | 'faq'
  | 'lean_physique'
  | 'related';

export interface ProductSectionItem {
  id: string;
  type: ProductSectionType;
  name: string;
  enabled: boolean;
}

export interface Product {
  id: string;
  name: string;
  tagline?: string;
  shortDescription?: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercentage?: number;
  stock?: number;
  soldCount?: number;
  sku?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  badgeType: 'sale' | 'soldout';
  rating?: number;
  reviewCount?: number;
  isSoldOut: boolean;
  image: string;
  gallery?: string[];
  detailBanners?: string[];
  videoUrl?: string;
  description: string;
  descriptionHtml?: string;
  servings?: string;
  servingSize?: string;
  variants?: string[];
  options?: ProductOption[];
  hasOptions: boolean;
  pricePrefix?: string;
  // Dynamic Product Page Architecture fields
  bundles?: BundleDeal[];
  benefitsHeading?: string;
  benefits?: ProductBenefit[];
  promotionalBanner?: PromotionalBannerConfig;
  scoopSection?: ScoopEditorialConfig;
  faqs?: ProductFaqItem[];
  faqHeading?: string;
  faqSubheading?: string;
  leanPhysiqueSection?: BuildPhysiqueConfig;
  deliveryInfo?: DeliveryInfoConfig;
  relatedHeading?: string;
  relatedSubheading?: string;
  relatedProductIds?: string[];
  customerGallery?: CustomerUGCImage[];
  testimonials?: ProductReview[];
  pageSections?: ProductSectionItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  selectedBundle?: BundleDeal;
  selectedFlavors?: string[];
  unitPrice?: number;
  totalPrice?: number;
}

export type ShippingRegion = 'KTM_VALLEY' | 'POKHARA' | 'CHITWAN' | 'MAJOR_TARAI' | 'HILLY_REMOTE';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  selectedVariant?: string;
  selectedBundle?: string;
  selectedFlavors?: string[];
  image?: string;
}

export interface AiReceiptVerificationResult {
  decision: 'verified' | 'pending_review' | 'rejected';
  isPaymentReceipt: boolean;
  isPrePaymentScreen: boolean;
  imageQuality: 'clear' | 'slightly_blurry' | 'unreadable' | 'cropped_missing_info';
  paymentProvider: string;
  extractedAmount: number | null;
  expectedAmount: number;
  amountMatches: boolean;
  extractedStatus: 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled' | 'pre_payment' | 'unknown';
  extractedStatusRaw: string;
  transactionId: string;
  normalizedTransactionId: string;
  recipient: string;
  transactionDateTime: string;
  isPhotoOfScreen: boolean;
  tamperingDetected: boolean;
  tamperingReasons: string[];
  confidence: number;
  reasons: string[];
  summaryReason: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  region: string;
  landmark?: string;
  items: OrderItem[];
  totalAmount: number;
  productTotal?: number;
  deliveryCharge?: number;
  amountPaidNow?: number;
  amountRemainingOnDelivery?: number;
  deliveryChargeStatus?: 'Paid' | 'Pending' | 'paid' | 'pending' | 'verified';
  productPaymentType?: 'Pay on Delivery' | 'Paid Online';
  deliveryPaymentGateway?: string;
  screenshotHash?: string;
  // AI Screenshot Verification Fields
  aiVerificationStatus?: 'verified' | 'pending_review' | 'rejected';
  extractedAmount?: number | null;
  expectedPaymentAmount?: number;
  transactionId?: string;
  normalizedTransactionId?: string;
  detectedPaymentProvider?: string;
  extractedPaymentStatus?: string;
  extractedRecipient?: string;
  extractedDateTime?: string;
  verificationConfidence?: number;
  aiVerificationReasons?: string[];
  aiVerificationSummary?: string;
  tamperingDetected?: boolean;
  discountAmount?: number;
  paymentMethod: string;
  paymentScreenshotUrl?: string;
  paymentStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stockDeducted?: boolean;
  notes?: string;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string | null;
  userEmail?: string | null;
}

export interface PaymentMethodSetting {
  id: string;
  name: string;
  code: 'cod' | 'esewa' | 'bank' | string;
  enabled: boolean;
  qrEnabled?: boolean;
  accountName?: string;
  accountNumber?: string;
  qrImageUrl?: string;
  instructions?: string;
  displayOrder: number;
  requiresScreenshot: boolean;
}

export interface StoreBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  videoUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  enabled: boolean;
  displayOrder?: number;
  displayLocation: 'hero' | 'product_promo' | 'popup';
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  productId?: string;
  productName?: string;
  name: string;
  rating: number;
  comment: string;
  location?: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  isAttention?: boolean;
  verified?: boolean;
  displayOrder?: number;
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  openForOrders: boolean;
  announcementText?: string;
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  currency: string;
  redefineVideoUrl?: string;
  redefineVideoPosterUrl?: string;
  redefineVideoHeading?: string;
  redefineVideoEnabled?: boolean;
  isInitialized?: boolean;
}

export interface AdminActivity {
  id: string;
  action: string;
  details?: string;
  adminEmail?: string;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  comment?: string;
  source?: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  source?: string;
  createdAt: string;
}
