import { useState, useMemo, useEffect } from 'react';
import {
  Product,
  BundleDeal,
  BundleConfig,
  ProductSectionItem,
  ReviewRecord,
  StoreBanner,
  ProductReview
} from '../../types';
import { DEFAULT_PAGE_SECTIONS } from '../../data/products';
import AnnouncementBar from '../AnnouncementBar';
import ProductStickyHeader from './ProductStickyHeader';
import ProductGallery from './ProductGallery';
import ProductRating from './ProductRating';
import ProductInfo from './ProductInfo';
import ProductNutritionalInfo from './ProductNutritionalInfo';
import ProductOptions from './ProductOptions';
import BuyMoreSaveMore from './BuyMoreSaveMore';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';
import ProductAddToCart, { ProductDeliveryInfo } from './ProductAddToCart';
import ProductStickyBottomBar from './ProductStickyBottomBar';
import ProductPromoBanner from './ProductPromoBanner';
import ProductScoopSection from './ProductScoopSection';
import ProductUgcGallery from './ProductUgcGallery';
import ProductTestimonial from './ProductTestimonial';
import ProductDescription from './ProductDescription';
import ProductDescriptionCta from './ProductDescriptionCta';
import ProductBenefits from './ProductBenefits';
import ProductFaqSection from './ProductFaqSection';
import ProductLeanPhysique from './ProductLeanPhysique';
import ProductRelatedSection from './ProductRelatedSection';
import Footer, { StorePageType } from '../Footer';
import { useResolvedMediaUrl } from '../../services/storageService';

function ResolvedDetailBanner({ src, alt }: { src: string; alt: string }) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) return null;
  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      className="w-full rounded-xl object-cover"
    />
  );
}



interface ProductPageProps {
  product: Product;
  cartCount: number;
  announcementText?: string;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onBackToStore?: () => void;
  onNavigatePage?: (page: StorePageType) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariant?: string,
    bundle?: BundleDeal,
    selectedFlavors?: string[]
  ) => void;
  onSelectRelatedProduct?: (product: Product) => void;
  allProducts?: Product[];
  allBundles?: BundleConfig[];
  liveReviews?: ReviewRecord[];
  liveBanners?: StoreBanner[];
  onBuyNow?: () => void;
}

export default function ProductPage({
  product,
  cartCount,
  announcementText,
  onOpenCart,
  onOpenSearch,
  onBackToStore,
  onNavigatePage,
  onAddToCart,
  onSelectRelatedProduct,
  allProducts = [],
  allBundles = [],
  liveReviews = [],
  liveBanners = [],
  onBuyNow
}: ProductPageProps) {
  // Compute default option values (e.g. { Flavor: 'Lemon Lime', Variant: '250g (83 Servings)' })
  const defaultOptionValues = useMemo(() => {
    const map: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt) => {
        map[opt.name] = opt.values[0] || '';
      });
    } else if (product.variants && product.variants.length > 0) {
      map['Flavor'] = product.variants[0];
    }
    return map;
  }, [product]);

  const [selectedOptionValues, setSelectedOptionValues] =
    useState<Record<string, string>>(defaultOptionValues);
  const [quantity, setQuantity] = useState<number>(1);

  // Available flavors list
  const availableFlavors = useMemo(() => {
    if (product.options && product.options.length > 0) {
      const flavorOpt = product.options.find((o) =>
        o.name.toLowerCase().includes('flavor')
      );
      if (flavorOpt) return flavorOpt.values;
      return product.options[0].values;
    }
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    return ['Lemon Lime', 'Tropical Tango 307g', 'Unflavored (250g)', 'Fruit Punch (250g)'];
  }, [product]);

  // Active bundles from baseline/product
  const activeBundles = useMemo(
    () => (product.bundles || []).filter((b) => b.enabled !== false),
    [product.bundles]
  );

  // Match bundles configured in Admin Combos & Bundles for this product
  const matchingBundles = useMemo(() => {
    return (allBundles || [])
      .filter(
        (b) =>
          b.enabled &&
          (b.targetProductIds?.includes('all') ||
            b.targetProductIds?.includes(product.id) ||
            b.targetProductIds?.length === 0)
      )
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [allBundles, product.id]);

  // Buy More Save More tiers from Firestore bundles
  const customMainBundles = useMemo(() => {
    const list: BundleDeal[] = [];
    matchingBundles
      .filter((b) => b.bundleType === 'buy_more_save_more' && b.placement !== 'frequently_bought_together')
      .forEach((b) => {
        if (b.tiers && b.tiers.length > 0) {
          b.tiers.forEach((t) => {
            list.push({
              id: `${b.id}-${t.id}`,
              title: t.title,
              quantity: t.quantity,
              price: t.price,
              originalPrice: t.originalPrice,
              savingsAmount: t.savingsAmount,
              savingsPercentage: t.savingsPercentage,
              badgeText: t.badgeText || b.badgeText,
              isPopular: t.isPopular ?? b.isPopular
            });
          });
        }
      });
    return list;
  }, [matchingBundles]);

  // Product combo bundles
  const comboBundles = useMemo(() => {
    return matchingBundles.filter(
      (b) =>
        (b.bundleType === 'product_combo' || b.bundleType === 'complete_nutrition') &&
        b.placement !== 'frequently_bought_together' &&
        b.placement !== 'above_purchase' &&
        b.placement !== 'below_purchase'
    );
  }, [matchingBundles]);

  // Frequently bought together bundle
  const fbtBundle = useMemo(() => {
    return matchingBundles.find(
      (b) =>
        b.placement === 'frequently_bought_together' ||
        b.bundleType === 'frequently_bought_together'
    );
  }, [matchingBundles]);

  // Above and below purchase area custom bundles
  const abovePurchaseBundles = useMemo(() => {
    return matchingBundles.filter((b) => b.placement === 'above_purchase');
  }, [matchingBundles]);

  const belowPurchaseBundles = useMemo(() => {
    return matchingBundles.filter((b) => b.placement === 'below_purchase');
  }, [matchingBundles]);

  // Effective bundles to display in the selector:
  const effectiveBundles = useMemo(() => {
    if (customMainBundles.length > 0) return customMainBundles;
    if (activeBundles.length > 0) return activeBundles;

    const uPrice = Number(product.price) || 2000;
    const origPrice = Number(product.originalPrice) || Math.round(uPrice * 1.3);
    return [
      {
        id: `bundle-auto-1-${product.id}`,
        title: 'Buy 1',
        quantity: 1,
        price: uPrice,
        originalPrice: origPrice,
        savingsAmount: Math.max(0, origPrice - uPrice),
        savingsPercentage: origPrice > uPrice ? Math.round(((origPrice - uPrice) / origPrice) * 100) : 0,
        badgeText: 'STANDARD PACK',
        isPopular: false,
        isDefault: true,
        requiresMultipleFlavors: false
      },
      {
        id: `bundle-auto-2-${product.id}`,
        title: 'Buy 2',
        quantity: 2,
        price: Math.round(uPrice * 2 * 0.9),
        originalPrice: origPrice * 2,
        savingsAmount: (origPrice * 2) - Math.round(uPrice * 2 * 0.9),
        savingsPercentage: Math.max(5, Math.round((((origPrice * 2) - Math.round(uPrice * 2 * 0.9)) / (origPrice * 2)) * 100)),
        badgeText: 'MOST POPULAR',
        isPopular: true,
        isDefault: false,
        requiresMultipleFlavors: true
      },
      {
        id: `bundle-auto-3-${product.id}`,
        title: 'Buy 3',
        quantity: 3,
        price: Math.round(uPrice * 3 * 0.85),
        originalPrice: origPrice * 3,
        savingsAmount: (origPrice * 3) - Math.round(uPrice * 3 * 0.85),
        savingsPercentage: Math.max(10, Math.round((((origPrice * 3) - Math.round(uPrice * 3 * 0.85)) / (origPrice * 3)) * 100)),
        badgeText: 'BEST VALUE',
        isPopular: false,
        isDefault: false,
        requiresMultipleFlavors: true
      }
    ];
  }, [customMainBundles, activeBundles, product]);

  // Selected bundle (pre-selected to default/single bundle)
  const [selectedBundle, setSelectedBundle] = useState<BundleDeal | null>(() => {
    return effectiveBundles.find((b) => b.isDefault) || effectiveBundles[0] || null;
  });

  // Reset options, quantity, and scroll position to top when opening or switching between products
  useEffect(() => {
    setSelectedOptionValues(defaultOptionValues);
    const initialBundle = effectiveBundles.find((b) => b.isDefault) || effectiveBundles[0] || null;
    setSelectedBundle(initialBundle);
    setQuantity(initialBundle ? initialBundle.quantity : 1);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [product.id, defaultOptionValues, effectiveBundles]);

  // Out-of-stock check
  const isSoldOut =
    product.isSoldOut || (typeof product.stock === 'number' && product.stock <= 0);
  const maxStock = typeof product.stock === 'number' ? product.stock : 50;

  // Merge product testimonials with live approved reviews from Firebase (sorted by displayOrder)
  const mergedTestimonials: ProductReview[] = useMemo(() => {
    const approvedFromDb = liveReviews
      .filter(
        (r) =>
          r.status === 'approved' &&
          (r.productId === product.id || r.isFeatured || !r.productId)
      )
      .sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 9999;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      })
      .map((r, idx) => {
        const fallbackUgcPhoto = product.customerGallery?.[idx]?.url;
        return {
          id: r.id,
          name: r.name,
          rating: r.rating || 5,
          comment: r.comment,
          date: 'Verified Buyer',
          verified: r.verified ?? true,
          location: r.location,
          image: r.imageUrl || fallbackUgcPhoto,
          productName: r.productName || product.name,
          status: r.status,
          displayOrder: r.displayOrder
        };
      });

    if (approvedFromDb.length > 0) {
      return approvedFromDb;
    }

    return (product.testimonials || [])
      .filter((t) => !t.status || t.status === 'approved')
      .map((t, idx) => ({
        ...t,
        image: t.image || product.customerGallery?.[idx]?.url,
        productName: t.productName || product.name
      }));
  }, [liveReviews, product.id, product.name, product.testimonials, product.customerGallery]);

  // Permanent Promotional banner config
  const effectivePromoBanner = useMemo(() => {
    return {
      enabled: true,
      eyebrow: 'Limited Time',
      image: 'https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg',
      heading: 'FREE DELIVERY',
      description: `On ${product.id === 'wellcore-creatine' ? 'Wellcore Creatine' : product.name}!`,
      buttonText: 'Shop Now',
      buttonLink: '#purchase',
      bgColor: '#070d19',
      textColor: '#FFFFFF'
    };
  }, [product.id, product.name]);

  // Flavors for multi-unit bundles
  const [selectedBundleFlavors, setSelectedBundleFlavors] = useState<string[]>([
    availableFlavors[0] || 'Lemon Lime',
    availableFlavors[1] || availableFlavors[0] || 'Tropical Tango 307g',
    availableFlavors[0] || 'Lemon Lime',
    availableFlavors[0] || 'Lemon Lime'
  ]);

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptionValues((prev) => ({ ...prev, [name]: value }));
    if (name.toLowerCase().includes('flavor')) {
      setSelectedBundleFlavors((prev) => {
        const next = [...prev];
        next[0] = value;
        return next;
      });
    }
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    const matchingBundle = effectiveBundles.find((b) => b.quantity === newQty) || null;
    setSelectedBundle(matchingBundle);
  };

  const handleSelectBundle = (bundle: BundleDeal) => {
    setSelectedBundle(bundle);
    setQuantity(bundle.quantity);
  };

  const handleBundleFlavorChange = (index: number, flavor: string) => {
    setSelectedBundleFlavors((prev) => {
      const next = [...prev];
      next[index] = flavor;
      return next;
    });
    if (index === 0) {
      const flavorOptName =
        product.options?.find((o) => o.name.toLowerCase().includes('flavor'))?.name || 'Flavor';
      setSelectedOptionValues((prev) => ({ ...prev, [flavorOptName]: flavor }));
    }
  };

  // Combine all selected options (e.g. "Lemon Lime • 250g (83 Servings)") for the cart item
  const combinedSelectedVariant = useMemo(() => {
    const entries = Object.entries(selectedOptionValues).filter(([, val]) => Boolean(val));
    if (entries.length === 0) return availableFlavors[0] || 'Standard';
    return entries.map(([, val]) => val).join(' • ');
  }, [selectedOptionValues, availableFlavors]);

  // Active unit/total pricing calculation
  const unitPrice = product.price;
  const unitOriginalPrice = product.originalPrice || product.price;
  const totalDisplayPrice = selectedBundle ? selectedBundle.price : unitPrice * quantity;
  const totalDisplayOriginalPrice = selectedBundle
    ? selectedBundle.originalPrice
    : unitOriginalPrice * quantity;
  const currentSavingsPercent =
    selectedBundle?.savingsPercentage ||
    product.discountPercentage ||
    (unitOriginalPrice > unitPrice
      ? Math.round(((unitOriginalPrice - unitPrice) / unitOriginalPrice) * 100)
      : 0);

  const handleAddToCartClick = () => {
    if (isSoldOut) return;
    const effectiveQty = selectedBundle ? selectedBundle.quantity : quantity;
    const activeFlavors =
      selectedBundle && selectedBundle.quantity > 1
        ? selectedBundleFlavors.slice(0, selectedBundle.quantity)
        : [combinedSelectedVariant];

    onAddToCart(
      product,
      effectiveQty,
      combinedSelectedVariant,
      selectedBundle || undefined,
      activeFlavors
    );
  };

  const scrollToPurchase = () => {
    const el = document.getElementById('purchase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Merge product pageSections with DEFAULT_PAGE_SECTIONS with guaranteed unique IDs per section type
  const sections: ProductSectionItem[] = useMemo(() => {
    const raw =
      product.pageSections && product.pageSections.length > 0
        ? product.pageSections
        : DEFAULT_PAGE_SECTIONS;

    const seenTypes = new Set<string>();
    const deduplicated: ProductSectionItem[] = [];

    raw.forEach((s) => {
      if (s && s.type && !seenTypes.has(s.type)) {
        seenTypes.add(s.type);
        deduplicated.push({
          ...s,
          id: `sec-${s.type}`
        });
      }
    });

    if (!seenTypes.has('description')) {
      deduplicated.push({ id: 'sec-description', type: 'description', name: 'Product Description', enabled: true });
      seenTypes.add('description');
    }
    if (!seenTypes.has('benefits')) {
      deduplicated.push({ id: 'sec-benefits', type: 'benefits', name: 'Product Benefits Grid', enabled: true });
      seenTypes.add('benefits');
    }

    const missingSections = DEFAULT_PAGE_SECTIONS.filter((d) => !seenTypes.has(d.type));
    const topTypes = ['gallery', 'rating', 'product_info', 'description', 'bundles', 'add_to_cart', 'options', 'frequently_bought_together', 'benefits'];
    const topMap = new Map<string, ProductSectionItem>();

    deduplicated.forEach(s => topMap.set(s.type, s));
    missingSections.forEach(s => topMap.set(s.type, { ...s, id: `sec-${s.type}` }));

    const orderedResult: ProductSectionItem[] = [];
    topTypes.forEach(t => {
      const item = topMap.get(t);
      if (item) {
        orderedResult.push(item);
        topMap.delete(t);
      }
    });

    topMap.forEach((item) => {
      if (item.type !== 'related') {
        orderedResult.push(item);
      }
    });

    const relatedItem = topMap.get('related') || deduplicated.find(s => s.type === 'related') || DEFAULT_PAGE_SECTIONS.find(d => d.type === 'related');
    if (relatedItem) {
      orderedResult.push({ ...relatedItem, id: 'sec-related' });
    }

    return orderedResult;
  }, [product.pageSections]);

  // Render individual sections based on type
  const renderSection = (item: ProductSectionItem) => {
    if (!item || !item.enabled) return null;

    switch (item.type) {
      case 'gallery': {
        const galleryImages =
          product.gallery && product.gallery.length > 0
            ? product.gallery.filter(Boolean)
            : product.image
            ? [product.image]
            : [];
        return (
          <div key={item.id} className="w-full">
            <ProductGallery
              images={galleryImages}
              videoUrl={product.videoUrl}
              productName={product.name}
            />
          </div>
        );
      }

      case 'rating':
        return (
          <div key={item.id} className="w-full">
            <ProductRating
              rating={product.rating || 5}
              reviewCount={product.reviewCount || 39}
            />
          </div>
        );

      case 'product_info':
        return (
          <div key={item.id} className="w-full">
            <ProductInfo
              title={product.name}
              tagline={product.tagline}
              brand={product.brand}
              category={product.category}
              price={unitPrice}
              originalPrice={unitOriginalPrice}
              discountPercentage={currentSavingsPercent}
              isSoldOut={isSoldOut}
            />
          </div>
        );

      case 'options':
      case 'bundles':
      case 'add_to_cart':
      case 'frequently_bought_together':
        // Centrally encapsulated within unified ProductPurchaseFlow to prevent external layout logic from pushing bundles out of place
        return null;

      case 'promo_banner':
        return (
          <div key={item.id} className="w-full">
            <ProductPromoBanner
              config={effectivePromoBanner}
              onShopNow={scrollToPurchase}
            />
          </div>
        );

      case 'scoop_editorial':
        return (
          <div key={item.id} className="w-full">
            <ProductScoopSection
              config={product.scoopSection}
              productName={product.name}
              price={totalDisplayPrice}
              isSoldOut={isSoldOut}
              onAddToCart={handleAddToCartClick}
            />
          </div>
        );

      case 'customer_ugc':
        // Unified into the center-focused ReviewCarousel rendered by 'testimonials'
        return null;

      case 'testimonials':
        return (
          <div key={item.id} className="w-full">
            <ProductTestimonial
              testimonials={mergedTestimonials}
              productName={product.name}
            />
          </div>
        );

      case 'description':
        return (
          <div key={item.id} className="w-full space-y-3">
            <ProductDescription
              descriptionHtml={product.descriptionHtml}
              fallbackDescription={product.description}
            />
          </div>
        );

      case 'description_cta':
        return (
          <div key={item.id} className="w-full">
            <ProductDescriptionCta
              onAddToCart={handleAddToCartClick}
              price={totalDisplayPrice}
            />
          </div>
        );

      case 'benefits':
        return (
          <div key={item.id} className="w-full">
            <ProductBenefits
              heading={product.benefitsHeading || `${product.brand} BENEFITS`}
              benefits={product.benefits}
            />
          </div>
        );

      case 'faq':
        return (
          <div key={item.id} className="w-full">
            <ProductFaqSection
              heading={product.faqHeading || 'FAQs'}
              subheading={
                product.faqSubheading ||
                'Everything you need to know about our products and services'
              }
              faqs={product.faqs}
            />
          </div>
        );

      case 'lean_physique':
        return (
          <div key={item.id} className="w-full">
            <ProductLeanPhysique
              config={product.leanPhysiqueSection}
              defaultImage={product.image}
              onShopNow={scrollToPurchase}
            />
          </div>
        );

      case 'related':
        return (
          <div key={item.id} className="w-full">
            <ProductRelatedSection
              currentProductId={product.id}
              allProducts={allProducts}
              heading={product.relatedHeading || 'You May Also Like'}
              subheading={product.relatedSubheading || 'Complete Your Gains.'}
              relatedProductIds={product.relatedProductIds}
              onSelectProduct={onSelectRelatedProduct}
              onAddToCart={onAddToCart}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-black selection:text-white flex flex-col pb-20 md:pb-0 [overflow-anchor:none]">
      {/* Top Announcement Bar */}
      <AnnouncementBar text={announcementText} />

      {/* 1. Sticky Ecommerce Header (Desktop + Mobile) */}
      <ProductStickyHeader
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenSearch={onOpenSearch}
        onBackToStore={onBackToStore}
        onNavigatePage={onNavigatePage}
      />

      {/* 2. Main Two-Column Product Section */}
      <main id="purchase" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Product Image Gallery */}
          <div className="md:col-span-6 lg:col-span-7 w-full md:sticky md:top-24">
            {renderSection(
              sections.find((s) => s.type === 'gallery') || DEFAULT_PAGE_SECTIONS[0]
            )}
          </div>

          {/* Right Column: Product Information, Options, Quantity, Pricing & Purchasing */}
          <div className="md:col-span-6 lg:col-span-5 w-full flex flex-col space-y-4">
            {/* Position 1 — Product Rating */}
            {renderSection(
              sections.find((s) => s.type === 'rating') || DEFAULT_PAGE_SECTIONS[1]
            )}

            {/* Position 2 — Product Title & Tagline */}
            {renderSection(
              sections.find((s) => s.type === 'product_info') || DEFAULT_PAGE_SECTIONS[2]
            )}

            {/* Position 3 — Product Description */}
            {renderSection(
              sections.find((s) => s.type === 'description') || { id: 'sec-description', type: 'description', name: 'Description', enabled: true }
            )}

            {/* Position 5 — Bundle Selector / Buy More, Save More */}
            <div className="w-full">
              <BuyMoreSaveMore
                bundles={effectiveBundles}
                comboBundles={[...abovePurchaseBundles, ...comboBundles]}
                selectedBundleId={selectedBundle?.id || ''}
                onSelectBundle={handleSelectBundle}
                availableFlavors={availableFlavors}
                selectedBundleFlavors={selectedBundleFlavors}
                onBundleFlavorChange={handleBundleFlavorChange}
                productStock={product.stock}
                isSoldOut={isSoldOut}
              />
            </div>

            {/* Position 6 & 7 — Action Buttons (Add to Cart & Buy It Now) */}
            <div className="w-full space-y-4">
              <ProductAddToCart
                onAddToCart={handleAddToCartClick}
                onBuyNow={onBuyNow}
                price={totalDisplayPrice}
                originalPrice={totalDisplayOriginalPrice}
                savingsPercentage={currentSavingsPercent}
                bundleQuantity={selectedBundle ? selectedBundle.quantity : quantity}
                isSoldOut={isSoldOut}
                deliveryInfo={product.deliveryInfo}
                showDeliveryInfo={false}
              />
            </div>

            {/* Position 8 — Standalone Options / Variant Selector */}
            {(!selectedBundle || selectedBundle.quantity === 1) && (
              <div className="w-full">
                <ProductOptions
                  options={product.options}
                  variants={product.variants}
                  selectedOptionValues={selectedOptionValues}
                  onOptionChange={handleOptionChange}
                  quantity={quantity}
                  onQuantityChange={handleQuantityChange}
                  maxStock={maxStock}
                  isSoldOut={isSoldOut}
                  showQuantitySelector={!selectedBundle}
                />
              </div>
            )}

            {/* Position 9 — FREQUENTLY BOUGHT TOGETHER */}
            <FrequentlyBoughtTogether
              currentProduct={product}
              bundleConfig={fbtBundle}
              allProducts={allProducts}
              onAddToCart={onAddToCart}
            />

            {/* Position 10 — Remaining existing product information & sections */}
            <ProductNutritionalInfo product={product} />

            {product.detailBanners && product.detailBanners.length > 0 && (
              <div className="space-y-3 pt-2">
                {product.detailBanners.map((bannerUrl, idx) => (
                  <ResolvedDetailBanner
                    key={`${bannerUrl}-${idx}`}
                    src={bannerUrl}
                    alt={`${product.name} detail ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Delivery information and trust badges */}
            <ProductDeliveryInfo deliveryInfo={product.deliveryInfo} />

            {/* Bundles configured with placement 'below_purchase' */}
            {belowPurchaseBundles.length > 0 && (
              <div className="w-full">
                <BuyMoreSaveMore
                  bundles={[]}
                  comboBundles={belowPurchaseBundles}
                  selectedBundleId={selectedBundle?.id || ''}
                  onSelectBundle={handleSelectBundle}
                  availableFlavors={availableFlavors}
                  selectedBundleFlavors={selectedBundleFlavors}
                  onBundleFlavorChange={handleBundleFlavorChange}
                  productStock={product.stock}
                  isSoldOut={isSoldOut}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Subsequent Product Sections: Promotional Banner, In Every Scoop, UGC, Testimonials, FAQ, Build Lean Physique, Related Products */}
      <div className="w-full">
        {sections
          .filter(
            (s) =>
              ![
                'gallery',
                'rating',
                'product_info',
                'options',
                'bundles',
                'add_to_cart',
                'frequently_bought_together',
                'description',
                'description_cta',
                'benefits'
              ].includes(s.type)
          )
          .map((s) => renderSection(s))}
      </div>

      {/* 9. Footer */}
      <Footer
        activePage="home"
        onNavigatePage={(page) => {
          if (onBackToStore) onBackToStore();
          if (onNavigatePage) {
            onNavigatePage(page);
          }
        }}
        onShopClick={onBackToStore}
      />

      {/* Mobile Sticky Bottom Add-to-Cart Bar */}
      <ProductStickyBottomBar
        productName={product.name}
        price={totalDisplayPrice}
        originalPrice={totalDisplayOriginalPrice}
        savingsPercentage={currentSavingsPercent}
        selectedFlavor={combinedSelectedVariant}
        onAddToCart={handleAddToCartClick}
        isSoldOut={isSoldOut}
      />
    </div>
  );
}
