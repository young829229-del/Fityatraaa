/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import WhyFitYatra from './components/WhyFitYatra';
import FaqSection from './components/FaqSection';
import MoneyBackBanner from './components/MoneyBackBanner';
import ReviewsSection from './components/ReviewsSection';
import RedefineVideoSection from './components/RedefineVideoSection';
import ContactSection from './components/ContactSection';
import Footer, { StorePageType } from './components/Footer';
import StorePages from './components/StorePages';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import SearchModal from './components/SearchModal';
import ProductPage from './components/ProductPage/ProductPage';
import ProductPageBuilder from './components/Admin/ProductPageBuilder';
import AdminPanel from './components/Admin/AdminPanel';
import AdminAuthModal from './components/Admin/AdminAuthModal';
import {
  Product,
  CartItem,
  ShippingRegion,
  BundleDeal,
  ReviewRecord,
  StoreBanner,
  StoreSettings
} from './types';
import {
  subscribeToProducts,
  subscribeToReviews,
  subscribeToBanners,
  subscribeToStoreSettings,
  saveProductToFirestore
} from './services/firestoreService';
import { auth, verifyAdminAccess } from './firebase';

function checkIsAdminUrl(): boolean {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return hash === '#admin' || hash.startsWith('#admin/') || path === '/admin' || path.startsWith('/admin/');
}

export default function App() {
  // Real-time Firebase state (No stale cached/local data before DB loads)
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  // Admin Route & Auth State (accessible ONLY via /#admin or /admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminUrl());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Storefront & Builder State
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [currentStorePage, setCurrentStorePage] = useState<StorePageType>('home');
  const [builderProduct, setBuilderProduct] = useState<Product | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fityatra_cart_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore localStorage errors
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<ShippingRegion>('KTM_VALLEY');

  // Persist cart items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fityatra_cart_v1', JSON.stringify(cartItems));
    } catch {
      // ignore storage quota errors
    }
  }, [cartItems]);

  // Listen to browser URL / hash changes for /#admin
  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminRoute(checkIsAdminUrl());
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Listen to Firebase Auth state for admin verification (strictly checks authorized admin Gmail)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      const authorized = await verifyAdminAccess(user);
      setIsAdminAuthenticated(authorized);
    });
    return () => unsubAuth();
  }, []);

  // Live Realtime Subscriptions to Firebase Firestore
  useEffect(() => {
    const unsubProducts = subscribeToProducts((liveProducts) => {
      setProducts(liveProducts || []);
    });
    const unsubReviews = subscribeToReviews((liveReviews) => {
      setReviews(liveReviews || []);
    });
    const unsubBanners = subscribeToBanners((liveBanners) => {
      setBanners(liveBanners || []);
    });
    const unsubSettings = subscribeToStoreSettings((liveSettings) => {
      setStoreSettings(liveSettings);
    });

    return () => {
      unsubProducts();
      unsubReviews();
      unsubBanners();
      unsubSettings();
    };
  }, []);

  const navigateToStore = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    if (window.location.hash) {
      window.location.hash = '';
    }
    setIsAdminRoute(false);
  };

  const activeProduct = activeProductId
    ? products.find((p) => p.id === activeProductId) || null
    : null;

  const handleOpenProduct = (prod: Product) => {
    setActiveProductId(prod.id);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    if (activeProductId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [activeProductId]);

  const activeHeroBanner = banners.find(
    (b) => b.enabled && b.displayLocation === 'hero' && (b.imageUrl || b.videoUrl)
  );

  const handleSaveProduct = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await saveProductToFirestore(updated);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedVariant?: string,
    bundle?: BundleDeal,
    selectedFlavors?: string[]
  ) => {
    if (product.isSoldOut || (typeof product.stock === 'number' && product.stock <= 0)) {
      return;
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedVariant === (selectedVariant || undefined) &&
          item.selectedBundle?.id === bundle?.id
      );

      const unitPrice = bundle
        ? Math.round(bundle.price / Math.max(1, bundle.quantity))
        : product.price;

      if (existingIndex > -1) {
        const next = [...prev];
        const newQuantity = next[existingIndex].quantity + quantity;
        const itemUnitPrice = next[existingIndex].unitPrice || unitPrice;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQuantity,
          unitPrice: itemUnitPrice,
          totalPrice: itemUnitPrice * newQuantity
        };
        return next;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          selectedVariant,
          selectedBundle: bundle,
          selectedFlavors,
          unitPrice,
          totalPrice: bundle ? bundle.price : unitPrice * quantity
        }
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number, variant?: string) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedVariant === variant) {
            const unitPrice = item.unitPrice || item.product.price;
            return { ...item, quantity, totalPrice: unitPrice * quantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string, variant?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedVariant === variant)
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ---------------------------------------------------------------------------
  // 1. ADMIN ROUTE VIEW (/#admin)
  // ---------------------------------------------------------------------------
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <AdminAuthModal
            isOpen={true}
            onClose={navigateToStore}
            onSuccess={async () => {
              const authorized = await verifyAdminAccess(auth.currentUser);
              setIsAdminAuthenticated(authorized);
            }}
          />
        </div>
      );
    }

    return (
      <>
        <AdminPanel
          onBackToStore={navigateToStore}
          onOpenPageBuilder={(prod) => setBuilderProduct(prod)}
        />

        {builderProduct && (
          <ProductPageBuilder
            product={builderProduct}
            onSaveProduct={async (updated) => {
              await handleSaveProduct(updated);
              setBuilderProduct(updated);
            }}
            onClose={() => setBuilderProduct(null)}
            onTogglePreview={() => {
              handleOpenProduct(builderProduct);
              setBuilderProduct(null);
              navigateToStore();
            }}
            isPreviewMode={isPreviewMode}
          />
        )}
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. PRODUCT DETAIL PAGE VIEW
  // ---------------------------------------------------------------------------
  if (activeProduct) {
    return (
      <div className="relative min-h-screen bg-white">
        <ProductPage
          product={activeProduct}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onBackToStore={() => setActiveProductId(null)}
          onAddToCart={handleAddToCart}
          onSelectRelatedProduct={(p) => handleOpenProduct(p)}
          allProducts={products.filter((p) => p.isActive !== false)}
          liveReviews={reviews}
          liveBanners={banners}
          onNavigatePage={(page) => {
            setActiveProductId(null);
            setCurrentStorePage(page);
          }}
        />

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          onClearCart={handleClearCart}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          selectedRegion={selectedRegion}
          onClearCart={handleClearCart}
        />

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          products={products.filter((p) => p.isActive !== false)}
          onSelectProduct={(p) => {
            handleOpenProduct(p);
            setIsSearchOpen(false);
          }}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. CUSTOMER HOME STOREFRONT VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-black selection:text-white flex flex-col">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Sticky Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        onNavigatePage={(page) => {
          setActiveProductId(null);
          setCurrentStorePage(page);
        }}
      />

      {currentStorePage !== 'home' ? (
        <StorePages
          page={currentStorePage}
          onNavigatePage={(page) => setCurrentStorePage(page)}
        />
      ) : (
        <>
          {/* 3. Hero Section with "REDEFINE YOURSELF." & "Buy Now" */}
          <Hero onBuyNowClick={scrollToCatalog} heroBanner={activeHeroBanner} />

          {/* 4. "Our Most Loved Products" 2-Col Mobile / Responsive Grid */}
          <ProductGrid
            products={products}
            onSelectProduct={(p) => handleOpenProduct(p)}
            onAddToCartDirect={(p) => handleAddToCart(p, 1)}
          />

          {/* 5. "WHY FITYATRA" Comparison Table & Trust Badges */}
          <WhyFitYatra />

          {/* 6. Frequently Asked Questions Accordion */}
          <FaqSection />

          {/* 7. Money Back Guarantee Banner */}
          <MoneyBackBanner onShopNowClick={scrollToCatalog} />

          {/* 8. Customer Photo & Testimonial Section (Synced with Firebase Reviews) */}
          <ReviewsSection reviews={reviews} />

          {/* 9. "Redefine Yourself" Athlete Video Showcase (Loaded from Firebase StoreSettings) */}
          <RedefineVideoSection storeSettings={storeSettings} />

          {/* 10. Contact Us Section below Redefine Video */}
          <ContactSection />
        </>
      )}

      {/* 10. Footer */}
      <Footer
        activePage={currentStorePage}
        onNavigatePage={(page) => {
          setActiveProductId(null);
          setCurrentStorePage(page);
        }}
        onShopClick={() => {
          setActiveProductId(null);
          setCurrentStorePage('home');
          setTimeout(scrollToCatalog, 50);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        selectedRegion={selectedRegion}
        onClearCart={handleClearCart}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products.filter((p) => p.isActive !== false)}
        onSelectProduct={(p) => {
          handleOpenProduct(p);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}
