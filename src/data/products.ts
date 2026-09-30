import {
  Product,
  ProductSectionItem,
  ProductFaqItem,
  ScoopEditorialConfig,
  BuildPhysiqueConfig,
  DeliveryInfoConfig,
  PromotionalBannerConfig
} from '../types';

export const DEFAULT_PAGE_SECTIONS: ProductSectionItem[] = [
  { id: 'sec-gallery', type: 'gallery', name: 'Main Product Gallery', enabled: true },
  { id: 'sec-rating', type: 'rating', name: 'Product Rating & Reviews Count', enabled: true },
  { id: 'sec-product_info', type: 'product_info', name: 'Product Title & Tagline', enabled: true },
  { id: 'sec-options', type: 'options', name: 'Product Options (Flavor & Variant)', enabled: true },
  { id: 'sec-bundles', type: 'bundles', name: 'Buy More, Save More (Bundles)', enabled: true },
  { id: 'sec-add_to_cart', type: 'add_to_cart', name: 'Add to Cart & Delivery Info', enabled: true },
  { id: 'sec-promo_banner', type: 'promo_banner', name: 'Promotional Banner (Free Delivery)', enabled: true },
  { id: 'sec-scoop_editorial', type: 'scoop_editorial', name: 'In Every Scoop Editorial Section', enabled: true },
  { id: 'sec-benefits', type: 'benefits', name: 'Product Benefits Grid', enabled: true },
  { id: 'sec-customer_ugc', type: 'customer_ugc', name: 'Customer UGC Image Gallery', enabled: true },
  { id: 'sec-testimonials', type: 'testimonials', name: 'Customer Testimonial Carousel', enabled: true },
  { id: 'sec-faq', type: 'faq', name: 'Product FAQ Accordion', enabled: true },
  { id: 'sec-lean_physique', type: 'lean_physique', name: 'Build Lean Physique Section', enabled: true },
  { id: 'sec-related', type: 'related', name: 'Related Products (You May Also Like)', enabled: true }
];

export const DEFAULT_PRODUCT_FAQS: ProductFaqItem[] = [
  {
    id: 'faq-delivery-time',
    question: 'How long does delivery take?',
    answer:
      'Orders inside Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur) are delivered within 24 to 36 hours. Nationwide delivery across all major cities in Nepal (Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Birgunj, etc.) takes 2 to 3 business days with live tracking.',
    enabled: true
  },
  {
    id: 'faq-results',
    question: 'What Results will I see?',
    answer:
      'With consistent daily supplementation (1 scoop / 3g daily), you will experience noticeable increases in strength, 1–2 extra reps on heavy compound lifts, faster ATP recovery between sets, and fuller, denser muscle volume without water bloating.',
    enabled: true
  },
  {
    id: 'faq-how-quickly',
    question: 'How quickly does it work?',
    answer:
      'Most lifters begin feeling improved workout stamina and muscular pump within the first 5 to 7 days as intramuscular phosphocreatine stores saturate, with measurable strength and lean mass gains building steadily from Week 2 onward.',
    enabled: true
  },
  {
    id: 'faq-authentic',
    question: 'Is this product real?',
    answer:
      'Yes, 100% authentic and factory-sealed. Every tub comes with an official scratch-and-verify authenticity code and batch number that you can verify directly on the official manufacturer website. Backed by our 100% Money-Back Authenticity Guarantee.',
    enabled: true
  },
  {
    id: 'faq-how-to-order',
    question: 'How to Place Your Order',
    answer:
      'Simply select your preferred Flavor, Variant, and Quantity above, click "Add to Cart", and proceed to checkout. Enter your name, phone number, and delivery address — you can pay via Cash on Delivery (COD) right at your doorstep or via eSewa / Bank Transfer.',
    enabled: true
  }
];

export const DEFAULT_PROMO_BANNER: PromotionalBannerConfig = {
  enabled: true,
  eyebrow: 'Limited Time',
  image: 'https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg',
  heading: 'FREE DELIVERY',
  description: 'On Wellcore Creatine!',
  buttonText: 'Shop Now',
  buttonLink: '#purchase',
  bgColor: '#070d19',
  textColor: '#FFFFFF'
};

export const DEFAULT_SCOOP_SECTION: ScoopEditorialConfig = {
  enabled: true,
  heading: 'In Every Scoop of Wellcore Creatine',
  description:
    'Wellcore Creatine complements your training. Taken daily, it supports the Strength and Power you build session after session — the kind of results that show up over weeks, not days. Mix your scoop, then train.',
  ctaText: 'Add to Cart',
  images: [
    'https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg',
    'https://i.ibb.co/dJBH98db/MV2-1-1-1-1.jpg'
  ]
};

export const DEFAULT_LEAN_PHYSIQUE: BuildPhysiqueConfig = {
  enabled: true,
  heading: 'Build Lean Physique',
  subtitle: 'Premium quality you can trust. Fair pricing. Hassle-free returns.',
  badges: ['Strength', 'Energy', 'Muscle Fullness'],
  image: 'https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg',
  buttonText: 'Shop Now'
};

export const DEFAULT_DELIVERY_INFO: DeliveryInfoConfig = {
  enabled: true,
  freeDeliveryText: 'FREE Delivery on Wellcore Creatine',
  estimatedWindow: '24–36 Hours (Kathmandu Valley) • 2–3 Days (All Nepal)',
  codAvailableText: 'Cash on Delivery (COD) & eSewa Available',
  returnPolicyText: '100% Verified Authentic • Hassle-Free Returns'
};

export const PRODUCTS: Product[] = [
  {
    id: 'wellcore-creatine',
    name: 'Build Muscles and Get Stronger with Wellcore-Creatine',
    tagline: 'Recover faster. Lift heavier. Feel it in week 1.',
    brand: 'Wellcore',
    category: 'Muscle Building',
    price: 2200,
    originalPrice: 3199,
    discountPercentage: 31,
    stock: 48,
    badgeType: 'sale',
    rating: 5,
    reviewCount: 39,
    isSoldOut: false,
    image: '/src/assets/images/wellcore_creatine_1790339507337.jpg',
    gallery: [
      '/src/assets/images/wellcore_creatine_1790339507337.jpg',
      '/src/assets/images/mb_creamp_1790339580436.jpg',
      'https://i.ibb.co/rRCNBQMZ/gpt-image-2-Create-a-comparison-chart-image-titled-WHY-FITYATRA-Style-Clean-minimalist-prof-0-1-1.jpg',
      'https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg',
      'https://i.ibb.co/dJBH98db/MV2-1-1-1-1.jpg'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-lifting-weights-in-a-gym-42416-large.mp4',
    description:
      'Wellcore Creatine complements your training. Taken daily, it supports the Strength and Power you build session after session — the kind of results that show up over weeks, not days. Mix your scoop, then train.',
    descriptionHtml: `
      <h3 class="text-xl font-bold text-neutral-900 mb-3">In Every Scoop of Wellcore Creatine</h3>
      <p class="text-neutral-700 leading-relaxed mb-4">
        Wellcore Creatine complements your training. Taken daily, it supports the Strength and Power you build session after session — the kind of results that show up over weeks, not days. Mix your scoop, then train.
      </p>
      <ul class="list-disc pl-5 space-y-2 text-neutral-700 mb-4">
        <li><strong>Ultra-Micronized 200 Mesh:</strong> Dissolves instantly in water, juice, or whey shake without gritty sediment.</li>
        <li><strong>100% Pure Creatine Monohydrate:</strong> No banned substances, zero sugars, zero fillers, laboratory batch certified.</li>
        <li><strong>Cellular Volumization:</strong> Draws water into intracellular muscle fibers to support muscular fullness and protein synthesis.</li>
      </ul>
      <p class="text-neutral-700 leading-relaxed">
        Consume 1 scoop (3g) daily before or after workout for maximum results. Maintain consistent daily hydration of 3–4 liters of water.
      </p>
    `,
    servings: '83 Servings',
    servingSize: '3g per scoop',
    hasOptions: true,
    variants: ['100g (33 Servings)', '250g (83 Servings)', '307g (Flavored Pack)'],
    options: [
      {
        name: 'Flavor',
        values: ['Lemon Lime', 'Tropical Tango 307g', 'Unflavored (250g)', 'Fruit Punch (250g)']
      },
      {
        name: 'Variant',
        values: ['250g (83 Servings)', '307g (Flavored Pack)', '100g (33 Servings)']
      }
    ],
    bundles: [
      {
        id: 'bundle-1',
        title: 'Buy 1',
        quantity: 1,
        price: 2200,
        originalPrice: 3199,
        savingsAmount: 999,
        savingsPercentage: 31,
        badgeText: 'STANDARD PACK',
        isPopular: false,
        isDefault: true,
        requiresMultipleFlavors: false
      },
      {
        id: 'bundle-2',
        title: 'Buy 2',
        quantity: 2,
        price: 4099,
        originalPrice: 6398,
        savingsAmount: 2299,
        savingsPercentage: 36,
        badgeText: 'MOST POPULAR',
        isPopular: true,
        isDefault: false,
        requiresMultipleFlavors: true
      },
      {
        id: 'bundle-4',
        title: 'Buy 4',
        quantity: 4,
        price: 8103,
        originalPrice: 12796,
        savingsAmount: 4693,
        savingsPercentage: 37,
        badgeText: 'BEST VALUE',
        isPopular: false,
        isDefault: false,
        requiresMultipleFlavors: true
      }
    ],
    promotionalBanner: DEFAULT_PROMO_BANNER,
    scoopSection: DEFAULT_SCOOP_SECTION,
    faqs: DEFAULT_PRODUCT_FAQS,
    faqHeading: 'FAQs',
    faqSubheading: 'Everything you need to know about our products and services',
    leanPhysiqueSection: DEFAULT_LEAN_PHYSIQUE,
    deliveryInfo: DEFAULT_DELIVERY_INFO,
    relatedHeading: 'You May Also Like',
    relatedSubheading: 'Complete Your Gains.',
    customerGallery: [
      {
        id: 'ugc-1',
        url: '/src/assets/images/fuel_one_whey_1790339569614.jpg',
        customerName: 'Rupesh T.',
        caption: 'Unboxing my Wellcore Creatine in Kathmandu. Fresh batch!',
        isFeatured: true,
        enabled: true
      },
      {
        id: 'ugc-2',
        url: 'https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg',
        customerName: 'Bikash S.',
        caption: 'Hitting new PRs on deadlifts after 2 weeks on Wellcore.',
        isFeatured: true,
        enabled: true
      },
      {
        id: 'ugc-3',
        url: '/src/assets/images/wellcore_creatine_1790339507337.jpg',
        customerName: 'Aayush A.',
        caption: 'Best mixability. Mixes 100% clean with cold water.',
        isFeatured: true,
        enabled: true
      },
      {
        id: 'ugc-4',
        url: '/src/assets/images/mb_creamp_1790339580436.jpg',
        customerName: 'Suman Shrestha',
        caption: 'Stacking with whey protein. Leg recovery is night and day.',
        isFeatured: false,
        enabled: true
      }
    ],
    testimonials: [
      {
        id: 'test-1',
        name: 'Rupesh T.',
        rating: 5,
        location: 'Kathmandu',
        comment:
          'I recently ordered WellCore Creatine, and the quality feels really good. It taste really good and mix well with milk. I will order again once my current box finishes. Quick delivery inside valley!',
        date: '3 days ago',
        verified: true
      },
      {
        id: 'test-2',
        name: 'Bikash Shrestha',
        rating: 5,
        location: 'Pokhara',
        comment:
          '100% genuine seal checked with QR. Noticeable strength improvement on bench within 2 weeks. Best supplement store in Nepal.',
        date: '1 week ago',
        verified: true
      },
      {
        id: 'test-3',
        name: 'Aayush Adhikari',
        rating: 5,
        location: 'Lalitpur',
        comment:
          'Fast dispatch, arrived next day at Kupondole with Cash on Delivery. Authentic batch code and zero bloating.',
        date: '2 weeks ago',
        verified: true
      }
    ],
    benefitsHeading: 'WELLCORE CREATINE BENEFITS',
    benefits: [
      {
        id: 'ben-1',
        icon: '💪',
        title: '1–2 extra reps per set',
        description:
          'Increases muscular phosphocreatine to generate rapid ATP energy during final failure reps.',
        enabled: true
      },
      {
        id: 'ben-2',
        icon: '💪',
        title: 'Fuller-looking muscle',
        description:
          'Draws cellular water into muscle cells to maximize intramuscular volume and pump.',
        enabled: true
      },
      {
        id: 'ben-3',
        icon: '⏱️',
        title: 'Shorter rest between sets',
        description:
          'Accelerates between-set recovery so you lift heavier loads across every working set.',
        enabled: true
      },
      {
        id: 'ben-4',
        icon: '📈',
        title: 'Measurable strength gains',
        description:
          'Clinically proven compound for increasing bench, squat, and deadlift numbers within weeks.',
        enabled: true
      }
    ],
    pageSections: DEFAULT_PAGE_SECTIONS
  },
  {
    id: 'mb-fish-oil-1000',
    name: 'Omega-3 Fish Oil 300mg for Heart, Joint & Recovery Support — 90 Capsules',
    tagline: 'Pure EPA & DHA with enteric coating and zero fishy burps.',
    brand: 'MuscleBlaze',
    category: 'Daily Health',
    price: 1900,
    originalPrice: 2700,
    discountPercentage: 29,
    stock: 35,
    badgeType: 'sale',
    rating: 5,
    reviewCount: 5,
    isSoldOut: false,
    image: '/src/assets/images/mb_fish_oil_1790339527059.jpg',
    gallery: [
      '/src/assets/images/mb_fish_oil_1790339527059.jpg',
      '/src/assets/images/mb_fish_oil_gold_1790339553609.jpg'
    ],
    description:
      'Essential fatty acids EPA & DHA for heart and joint health. Anti-reflux molecularly distilled softgels.',
    servings: '90 Softgels',
    servingSize: '1 Softgel daily',
    hasOptions: false,
    variants: ['90 Softgels (Standard Bottle)'],
    options: [
      {
        name: 'Variant',
        values: ['90 Softgels (Standard Bottle)', '180 Softgels (Value Pack)']
      }
    ],
    bundles: [
      {
        id: 'b-mb-1',
        title: 'Buy 1',
        quantity: 1,
        price: 1900,
        originalPrice: 2700,
        savingsAmount: 800,
        savingsPercentage: 29,
        isPopular: false,
        isDefault: true
      },
      {
        id: 'b-mb-2',
        title: 'Buy 2',
        quantity: 2,
        price: 3500,
        originalPrice: 5400,
        savingsAmount: 1900,
        savingsPercentage: 35,
        badgeText: 'MOST POPULAR',
        isPopular: true
      }
    ],
    benefitsHeading: 'OMEGA 3 BENEFITS',
    benefits: [
      {
        id: 'b-1',
        icon: '❤️',
        title: 'Cardiovascular Support',
        description: 'Supports healthy triglyceride levels and arterial function.',
        enabled: true
      },
      {
        id: 'b-2',
        icon: '🦴',
        title: 'Joint Lubrication',
        description: 'Reduces joint stiffness and supports heavy lifting movements.',
        enabled: true
      }
    ],
    faqs: DEFAULT_PRODUCT_FAQS,
    leanPhysiqueSection: {
      ...DEFAULT_LEAN_PHYSIQUE,
      image: '/src/assets/images/mb_fish_oil_1790339527059.jpg'
    },
    deliveryInfo: DEFAULT_DELIVERY_INFO,
    pageSections: DEFAULT_PAGE_SECTIONS
  },
  {
    id: 'mb-fish-oil-gold',
    name: 'Omega 3 Fish Oil Gold 3x Triple Strength (EPA & DHA)',
    tagline: 'Triple strength 560mg EPA and 400mg DHA per enteric-coated softgel.',
    brand: 'MuscleBlaze',
    category: 'Gold Series',
    price: 2150,
    originalPrice: 3199,
    discountPercentage: 32,
    stock: 40,
    badgeType: 'sale',
    rating: 5,
    reviewCount: 6,
    isSoldOut: false,
    image: '/src/assets/images/mb_fish_oil_gold_1790339553609.jpg',
    gallery: ['/src/assets/images/mb_fish_oil_gold_1790339553609.jpg'],
    description:
      'Triple strength formulation providing 560mg EPA and 400mg DHA per enteric-coated softgel with zero fishy burps.',
    servings: '60 Softgels',
    servingSize: '1 Softgel daily with meal',
    hasOptions: false,
    variants: ['60 Softgels - Triple Strength Gold'],
    options: [
      {
        name: 'Variant',
        values: ['60 Softgels - Triple Strength Gold']
      }
    ],
    bundles: [
      {
        id: 'bg-1',
        title: 'Buy 1',
        quantity: 1,
        price: 2150,
        originalPrice: 3199,
        savingsAmount: 1049,
        savingsPercentage: 32,
        isDefault: true
      },
      {
        id: 'bg-2',
        title: 'Buy 2',
        quantity: 2,
        price: 3999,
        originalPrice: 6398,
        savingsAmount: 2399,
        savingsPercentage: 37,
        badgeText: 'MOST POPULAR',
        isPopular: true
      }
    ],
    benefitsHeading: 'GOLD STRENGTH BENEFITS',
    benefits: [
      {
        id: 'bg-b1',
        icon: '⚡',
        title: '3X Concentrated EPA/DHA',
        description: 'Maximum absorption per single capsule without excess fat.',
        enabled: true
      },
      {
        id: 'bg-b2',
        icon: '🛡️',
        title: 'Anti-Reflux Coating',
        description: 'Absorbs past the stomach to eliminate aftertaste.',
        enabled: true
      }
    ],
    faqs: DEFAULT_PRODUCT_FAQS,
    leanPhysiqueSection: {
      ...DEFAULT_LEAN_PHYSIQUE,
      image: '/src/assets/images/mb_fish_oil_gold_1790339553609.jpg'
    },
    deliveryInfo: DEFAULT_DELIVERY_INFO,
    pageSections: DEFAULT_PAGE_SECTIONS
  },
  {
    id: 'mb-lcarnitine-liquid',
    name: 'MuscleBlaze L-Carnitine Liquid for Fat Metabolism & Energy — 450ml',
    tagline: 'Fast-absorbing 3000mg liquid L-Carnitine per serving.',
    brand: 'MuscleBlaze',
    category: 'Fat Metabolism',
    price: 2150,
    pricePrefix: 'From ',
    originalPrice: 3199,
    discountPercentage: 32,
    stock: 30,
    badgeType: 'sale',
    rating: 5,
    reviewCount: 8,
    isSoldOut: false,
    image: '/src/assets/images/mb_carnitine_liquid_1790339566025.jpg',
    gallery: ['/src/assets/images/mb_carnitine_liquid_1790339566025.jpg'],
    description:
      'Liquid fast-acting 3000mg L-Carnitine per serving to transport long-chain fatty acids into mitochondria for energy.',
    servings: '30 Servings',
    servingSize: '15ml with measuring cup',
    hasOptions: true,
    variants: ['450ml - Tangy Orange', '450ml - Lemon Lime', '450ml - Green Apple'],
    options: [
      {
        name: 'Flavor',
        values: ['Tangy Orange', 'Lemon Lime', 'Green Apple']
      },
      {
        name: 'Variant',
        values: ['450ml Bottle (30 Servings)']
      }
    ],
    bundles: [
      {
        id: 'blc-1',
        title: 'Buy 1',
        quantity: 1,
        price: 2150,
        originalPrice: 3199,
        savingsAmount: 1049,
        savingsPercentage: 32,
        isDefault: true
      },
      {
        id: 'blc-2',
        title: 'Buy 2',
        quantity: 2,
        price: 3999,
        originalPrice: 6398,
        savingsAmount: 2399,
        savingsPercentage: 37,
        badgeText: 'MOST POPULAR',
        isPopular: true
      }
    ],
    faqs: DEFAULT_PRODUCT_FAQS,
    leanPhysiqueSection: {
      ...DEFAULT_LEAN_PHYSIQUE,
      image: '/src/assets/images/mb_carnitine_liquid_1790339566025.jpg'
    },
    deliveryInfo: DEFAULT_DELIVERY_INFO,
    pageSections: DEFAULT_PAGE_SECTIONS
  },
  {
    id: 'mb-vite-multivitamin',
    name: 'MuscleBlaze MB-VITE Daily Multivitamin, for Enhanced Energy, Stamina & Gut Health',
    tagline: '51 active ingredients, prebiotic fibers, and digestive enzymes.',
    brand: 'MuscleBlaze',
    category: 'Multivitamins',
    price: 1500,
    originalPrice: 2100,
    discountPercentage: 28,
    stock: 42,
    badgeType: 'sale',
    isSoldOut: false,
    image: '/src/assets/images/mb_vite_multivitamin_1790339611260.jpg',
    gallery: ['/src/assets/images/mb_vite_multivitamin_1790339611260.jpg'],
    description:
      'Daily micronutrient blend with essential vitamins, minerals, prebiotic fibers, and botanical digestive enzymes.',
    servings: '60 Tablets',
    servingSize: '1 Tablet after breakfast',
    hasOptions: false,
    variants: ['60 Tablets Bottle'],
    faqs: DEFAULT_PRODUCT_FAQS,
    deliveryInfo: DEFAULT_DELIVERY_INFO,
    pageSections: DEFAULT_PAGE_SECTIONS
  },
  {
    id: 'myfitness-peanut-butter',
    name: 'Original Crunchy Peanut Butter (25% Protein)',
    tagline: 'High protein, premium roasted brown peanuts, zero trans fat.',
    brand: 'MYFITNESS',
    category: 'Healthy Fats',
    price: 1200,
    originalPrice: 1500,
    discountPercentage: 20,
    stock: 50,
    badgeType: 'sale',
    isSoldOut: false,
    image: '/src/assets/images/myfitness_peanut_butter_1790339626354.jpg',
    gallery: ['/src/assets/images/myfitness_peanut_butter_1790339626354.jpg'],
    description:
      'Fresh roasted crunchy brown peanuts packed with healthy monounsaturated fats and 25g natural protein per 100g.',
    servings: '1kg Tub',
    hasOptions: false,
    variants: ['1kg Crunchy'],
    faqs: DEFAULT_PRODUCT_FAQS,
    deliveryInfo: DEFAULT_DELIVERY_INFO,
    pageSections: DEFAULT_PAGE_SECTIONS
  },
  {
    id: 'fuel-one-whey-protein',
    name: 'Fuel One Whey Protein Max — 24g Protein per Scoop',
    tagline: 'Clean fast-digesting whey protein concentrate + isolate blend.',
    brand: 'Fuel One',
    category: 'Protein',
    price: 4900,
    pricePrefix: 'From ',
    originalPrice: 6500,
    discountPercentage: 24,
    stock: 25,
    badgeType: 'sale',
    isSoldOut: false,
    image: '/src/assets/images/fuel_one_whey_1790339569614.jpg',
    gallery: ['/src/assets/images/fuel_one_whey_1790339569614.jpg'],
    description:
      'High biological value whey formula with 24g pure protein and 5.2g BCAAs per scoop. Laboratory tested for 100% label authenticity.',
    servings: '30 Servings (1kg)',
    servingSize: '1 Heaping Scoop (33g)',
    hasOptions: true,
    variants: ['1kg (30 Servings) - Rich Chocolate', '1kg (30 Servings) - Cafe Mocha', '2kg (60 Servings) - Rich Chocolate'],
    options: [
      {
        name: 'Flavor',
        values: ['Rich Chocolate', 'Cafe Mocha']
      },
      {
        name: 'Variant',
        values: ['1kg (30 Servings)', '2kg (60 Servings)']
      }
    ],
    faqs: DEFAULT_PRODUCT_FAQS,
    deliveryInfo: DEFAULT_DELIVERY_INFO,
    pageSections: DEFAULT_PAGE_SECTIONS
  },
  {
    id: 'mb-creamp-creatine',
    name: 'MuscleBlaze CreaMP Creatine Monohydrate with Creapure — 250g',
    tagline: 'Patented Creapure German creatine for pure power and recovery.',
    brand: 'MuscleBlaze',
    category: 'Muscle Building',
    price: 2450,
    originalPrice: 3499,
    discountPercentage: 30,
    stock: 30,
    badgeType: 'sale',
    isSoldOut: false,
    image: '/src/assets/images/mb_creamp_1790339580436.jpg',
    gallery: ['/src/assets/images/mb_creamp_1790339580436.jpg'],
    description:
      'Formulated with certified Creapure, the gold standard in ultra-pure micronized creatine monohydrate. Rapid ATP replenishing formulation.',
    servings: '83 Servings',
    servingSize: '3g Scoop',
    hasOptions: false,
    variants: ['250g (83 Servings) - Unflavored'],
    faqs: DEFAULT_PRODUCT_FAQS,
    deliveryInfo: DEFAULT_DELIVERY_INFO,
    pageSections: DEFAULT_PAGE_SECTIONS
  }
];

/**
 * Ensures any product loaded from Firestore has complete defaults for new product-page sections
 * while preserving any edits made in the Admin Panel.
 */
export function enrichProductWithDefaults(product: Product): Product {
  const baseline = PRODUCTS.find((p) => p.id === product.id);

  // Upgrade legacy promo banner if it still had old placeholder heading or broken image
  const hasLegacyPromo =
    !product.promotionalBanner ||
    product.promotionalBanner.heading === 'BUILD MUSCLE FASTER WITH VERIFIED NUTRITION' ||
    (product.promotionalBanner.image && product.promotionalBanner.image.startsWith('/src/assets/'));

  const promotionalBanner: PromotionalBannerConfig = hasLegacyPromo
    ? baseline?.promotionalBanner || DEFAULT_PROMO_BANNER
    : {
        ...DEFAULT_PROMO_BANNER,
        ...(baseline?.promotionalBanner || {}),
        ...product.promotionalBanner,
        bgColor: '#070d19',
        textColor: '#FFFFFF'
      };

  const activeGallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.image
      ? [product.image]
      : baseline?.gallery || [];

  const customScoopImages = (product.scoopSection?.images || []).filter(
    (img): img is string => Boolean(img && !img.startsWith('/src/assets/'))
  );

  const scoopSection: ScoopEditorialConfig = {
    ...(baseline?.scoopSection || DEFAULT_SCOOP_SECTION),
    ...(product.scoopSection || {}),
    heading:
      product.scoopSection?.heading ??
      baseline?.scoopSection?.heading ??
      `In Every Scoop of ${product.id === 'wellcore-creatine' ? 'Wellcore Creatine' : product.name}`,
    description:
      product.scoopSection?.description ??
      baseline?.scoopSection?.description ??
      product.description ??
      DEFAULT_SCOOP_SECTION.description,
    images:
      customScoopImages.length > 0
        ? customScoopImages
        : activeGallery.length > 0
        ? activeGallery.slice(0, 3)
        : [product.image].filter(
            (img): img is string => Boolean(img && !img.startsWith('/src/assets/'))
          )
  };

  const faqs: ProductFaqItem[] =
    product.faqs && product.faqs.length > 0
      ? product.faqs
      : baseline?.faqs || DEFAULT_PRODUCT_FAQS;

  const customLeanImage =
    product.leanPhysiqueSection?.image &&
    !product.leanPhysiqueSection.image.startsWith('/src/assets/')
      ? product.leanPhysiqueSection.image
      : '';

  const leanPhysiqueSection: BuildPhysiqueConfig = {
    ...DEFAULT_LEAN_PHYSIQUE,
    ...(baseline?.leanPhysiqueSection || {}),
    ...(product.leanPhysiqueSection || {}),
    image: customLeanImage || product.image || DEFAULT_LEAN_PHYSIQUE.image
  };

  const deliveryInfo: DeliveryInfoConfig = product.deliveryInfo
    ? {
        ...DEFAULT_DELIVERY_INFO,
        ...(baseline?.deliveryInfo || {}),
        ...product.deliveryInfo
      }
    : baseline?.deliveryInfo || {
        ...DEFAULT_DELIVERY_INFO,
        freeDeliveryText:
          product.id === 'wellcore-creatine'
            ? 'FREE Delivery on Wellcore Creatine'
            : `Fast Tracked Delivery on ${product.brand || 'All Orders'}`
      };

  // Preserve admin-edited options; only fall back to baseline if options was never set
  let options = product.options !== undefined ? product.options : baseline?.options;
  if (
    product.options === undefined &&
    product.id === 'wellcore-creatine' &&
    (!options || options.length < 2)
  ) {
    const existingFlavor = options?.find((o) => o.name.toLowerCase().includes('flavor')) || {
      name: 'Flavor',
      values: product.variants || ['Lemon Lime', 'Tropical Tango 307g', 'Unflavored (250g)', 'Fruit Punch (250g)']
    };
    const existingVariant = options?.find((o) => !o.name.toLowerCase().includes('flavor')) || {
      name: 'Variant',
      values: ['250g (83 Servings)', '307g (Flavored Pack)', '100g (33 Servings)']
    };
    options = [existingFlavor, existingVariant];
  }

  // Normalize pageSections so every section has a unique semantic id (`sec-${type}`) and any new sections are included
  const rawSections =
    product.pageSections && product.pageSections.length > 0
      ? product.pageSections
      : DEFAULT_PAGE_SECTIONS;

  const seenTypes = new Set<string>();
  const normalizedExisting: ProductSectionItem[] = [];
  for (const sec of rawSections) {
    if (sec && sec.type && !seenTypes.has(sec.type)) {
      seenTypes.add(sec.type);
      normalizedExisting.push({
        ...sec,
        id: `sec-${sec.type}`
      });
    }
  }

  const missingDefaults = DEFAULT_PAGE_SECTIONS.filter((d) => !seenTypes.has(d.type));
  const pageSections: ProductSectionItem[] = [];
  const relatedSec =
    normalizedExisting.find((s) => s.type === 'related') ||
    missingDefaults.find((s) => s.type === 'related');

  for (const sec of normalizedExisting) {
    if (sec.type !== 'related') pageSections.push(sec);
  }
  for (const sec of missingDefaults) {
    if (sec.type !== 'related') pageSections.push({ ...sec, id: `sec-${sec.type}` });
  }
  if (relatedSec) {
    pageSections.push({ ...relatedSec, id: 'sec-related' });
  }

  const enriched: Product = {
    ...(baseline || {}),
    ...product,
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice ?? product.price) || 0,
    pageSections,
    promotionalBanner,
    scoopSection,
    faqs,
    faqHeading: product.faqHeading || 'FAQs',
    faqSubheading:
      product.faqSubheading || 'Everything you need to know about our products and services',
    leanPhysiqueSection,
    deliveryInfo,
    relatedHeading: product.relatedHeading || 'You May Also Like',
    relatedSubheading: product.relatedSubheading || 'Complete Your Gains.'
  };

  if (options && options.length > 0) {
    enriched.options = options;
  } else {
    delete enriched.options;
  }

  return enriched;
}
