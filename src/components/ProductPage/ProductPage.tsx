import { useState, useMemo, useEffect } from 'react';
import {
  Product,
  BundleDeal,
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
import ProductOptions from './ProductOptions';
import BuyMoreSaveMore from './BuyMoreSaveMore';
import ProductAddToCart from './ProductAddToCart';
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

interface ProductPageProps {
  product: Product;
  cartCount: number;
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
  liveReviews?: ReviewRecord[];
  liveBanners?: StoreBanner[];
}

export default function ProductPage({
  product,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onBackToStore,
  onNavigatePage,
  onAddToCart,
  onSelectRelatedProduct,
  allProducts = [],
  liveReviews = [],
  liveBanners = []
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

  // Active bundles
  const activeBundles = useMemo(
    () => (product.bundles || []).filter((b) => b.enabled !== false),
    [product.bundles]
  );

  // Selected bundle (optional; null when user sets custom quantity via +/- stepper)
  const [selectedBundle, setSelectedBundle] = useState<BundleDeal | null>(null);

  // Reset options and quantity when switching between products
  useEffect(() => {
    setSelectedOptionValues(defaultOptionValues);
    setQuantity(1);
    setSelectedBundle(null);
  }, [product.id, defaultOptionValues]);

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

  // Promotional banner config (product-specific or global product_promo banner from Firebase)
  const effectivePromoBanner = useMemo(() => {
    const globalPromo = liveBanners.find(
      (b) => b.enabled && b.displayLocation === 'product_promo' && b.imageUrl
    );
    if (globalPromo) {
      return {
        enabled: true,
        eyebrow: 'Limited Time',
        image: globalPromo.imageUrl,
        heading: globalPromo.title || 'FREE DELIVERY',
        description: globalPromo.subtitle || `On ${product.name}!`,
        buttonText: globalPromo.buttonText || 'Shop Now',
        buttonLink: globalPromo.buttonLink || '#purchase'
      };
    }
    return product.promotionalBanner;
  }, [liveBanners, product.promotionalBanner, product.name]);

  // Flavors for multi-unit bundles
  const [selectedBundleFlavors, setSelectedBundleFlavors] = useState<string[]>([
    availableFlavors[0] || 'Lemon Lime',
    availableFlavors[1] || availableFlavors[0] || 'Tropical Tango 307g',
    availableFlavors[0] || 'Lemon Lime',
    availableFlavors[0] || 'Lemon Lime'
  ]);

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptionValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    const matchingBundle = activeBundles.find((b) => b.quantity === newQty) || null;
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

    const missingSections = DEFAULT_PAGE_SECTIONS.filter((d) => !seenTypes.has(d.type));
    if (missingSections.length === 0) return deduplicated;

    // Insert missing sections in their natural order before 'related'
    const result: ProductSectionItem[] = [];
    const relatedItem = deduplicated.find((s) => s.type === 'related');
    deduplicated.forEach((s) => {
      if (s.type !== 'related') {
        result.push(s);
      }
    });
    missingSections.forEach((m) => {
      if (m.type !== 'related') {
        result.push({ ...m, id: `sec-${m.type}` });
      }
    });
    if (relatedItem) {
      result.push({ ...relatedItem, id: 'sec-related' });
    } else {
      const defRel = DEFAULT_PAGE_SECTIONS.find((d) => d.type === 'related');
      if (defRel) result.push({ ...defRel, id: 'sec-related' });
    }
    return result;
  }, [product.pageSections]);

  // Render individual sections based on type
  const renderSection = (item: ProductSectionItem) => {
    if (!item || !item.enabled) return null;

    switch (item.type) {
      case 'gallery':
        return (
          <div key={item.id} className="w-full">
            <ProductGallery
              images={
                product.gallery && product.gallery.length > 0
                  ? product.gallery
                  : [product.image]
              }
              videoUrl={product.videoUrl}
              productName={product.name}
            />
          </div>
        );

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
        return (
          <div key={item.id} className="w-full">
            <ProductOptions
              options={product.options}
              variants={product.variants}
              selectedOptionValues={selectedOptionValues}
              onOptionChange={handleOptionChange}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              maxStock={maxStock}
              isSoldOut={isSoldOut}
            />
          </div>
        );

      case 'bundles':
        return (
          <div key={item.id} className="w-full">
            <BuyMoreSaveMore
              bundles={activeBundles}
              selectedBundleId={selectedBundle?.id || ''}
              onSelectBundle={handleSelectBundle}
              availableFlavors={availableFlavors}
              selectedBundleFlavors={selectedBundleFlavors}
              onBundleFlavorChange={handleBundleFlavorChange}
            />
          </div>
        );

      case 'add_to_cart':
        return (
          <div key={item.id} className="w-full">
            <ProductAddToCart
              onAddToCart={handleAddToCartClick}
              price={totalDisplayPrice}
              originalPrice={totalDisplayOriginalPrice}
              savingsPercentage={currentSavingsPercent}
              bundleQuantity={selectedBundle ? selectedBundle.quantity : quantity}
              isSoldOut={isSoldOut}
              deliveryInfo={product.deliveryInfo}
            />
          </div>
        );

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
            {product.detailBanners && product.detailBanners.length > 0 && (
              <div className="space-y-3 pt-2">
                {product.detailBanners.map((bannerUrl, idx) => (
                  <img
                    key={`${bannerUrl}-${idx}`}
                    src={bannerUrl}
                    alt={`${product.name} detail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
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
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-black selection:text-white flex flex-col pb-20 md:pb-0">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

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
          <div className="md:col-span-6 lg:col-span-5 w-full flex flex-col space-y-2">
            {renderSection(
              sections.find((s) => s.type === 'rating') || DEFAULT_PAGE_SECTIONS[1]
            )}
            {renderSection(
              sections.find((s) => s.type === 'product_info') || DEFAULT_PAGE_SECTIONS[2]
            )}
            {renderSection(
              sections.find((s) => s.type === 'options') || DEFAULT_PAGE_SECTIONS[3]
            )}
            {renderSection(
              sections.find((s) => s.type === 'bundles') || DEFAULT_PAGE_SECTIONS[4]
            )}
            {renderSection(
              sections.find((s) => s.type === 'add_to_cart') || DEFAULT_PAGE_SECTIONS[5]
            )}
          </div>
        </div>
      </main>

      {/* Subsequent Product Sections: Promotional Banner, In Every Scoop, Benefits, UGC, Testimonials, FAQ, Build Lean Physique, Related Products */}
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
                'description',
                'description_cta'
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
