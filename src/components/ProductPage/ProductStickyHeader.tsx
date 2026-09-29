import { useState } from 'react';
import { Menu, Search, ShoppingBag, X, User, PackageCheck } from 'lucide-react';
import { StorePageType } from '../Footer';

interface ProductStickyHeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onBackToStore?: () => void;
  onNavigatePage?: (page: StorePageType) => void;
  onShopClick?: () => void;
}

export default function ProductStickyHeader({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onBackToStore,
  onNavigatePage,
  onShopClick
}: ProductStickyHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [orderLookupPhone, setOrderLookupPhone] = useState('');
  const [lookupSubmitted, setLookupSubmitted] = useState(false);

  const handleGoHome = () => {
    setMobileMenuOpen(false);
    if (onBackToStore) {
      onBackToStore();
    }
    if (onNavigatePage) {
      onNavigatePage('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoShop = () => {
    setMobileMenuOpen(false);
    if (onShopClick) {
      onShopClick();
      return;
    }
    if (onBackToStore) {
      onBackToStore();
    }
    if (onNavigatePage) {
      onNavigatePage('home');
    }
    setTimeout(() => {
      const el = document.getElementById('catalog') || document.getElementById('related-products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const handleGoContact = () => {
    setMobileMenuOpen(false);
    if (onBackToStore) {
      onBackToStore();
    }
    if (onNavigatePage) {
      onNavigatePage('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoPolicy = (page: StorePageType) => {
    setMobileMenuOpen(false);
    if (onBackToStore) {
      onBackToStore();
    }
    if (onNavigatePage) {
      onNavigatePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: Hamburger on Mobile / Brand + Nav Links on Desktop */}
          <div className="flex items-center gap-8">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-neutral-900 hover:text-black focus:outline-none cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 stroke-[1.6]" />
            </button>

            {/* Desktop Brand Logo on the Left */}
            <button
              type="button"
              onClick={handleGoHome}
              className="hidden md:flex items-center gap-3 group focus:outline-none cursor-pointer"
              aria-label="Home"
            >
              <img
                src="https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg"
                alt="FitYatra Logo"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-neutral-200 shadow-xs transition-transform duration-150 group-hover:scale-105"
              />
            </button>

            {/* Desktop Navigation Links: Home, Shop, Contact */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-700">
              <button
                type="button"
                onClick={handleGoHome}
                className="hover:text-black hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
              >
                Home
              </button>
              <button
                type="button"
                onClick={handleGoShop}
                className="hover:text-black hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
              >
                Shop
              </button>
              <button
                type="button"
                onClick={handleGoContact}
                className="hover:text-black hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap"
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Center: Mobile Centered Brand Logo */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <button
              type="button"
              onClick={handleGoHome}
              className="flex items-center justify-center group focus:outline-none cursor-pointer"
              aria-label="Home"
            >
              <img
                src="https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg"
                alt="FitYatra Logo"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-neutral-200 shadow-xs transition-transform group-hover:scale-105"
              />
            </button>
          </div>

          {/* Right: Search, Account/Login, Cart Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-md transition-colors focus:outline-none cursor-pointer"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5 stroke-[1.7]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setLookupSubmitted(false);
                setAccountModalOpen(true);
              }}
              className="p-2 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-md transition-colors focus:outline-none cursor-pointer"
              aria-label="Account & Order Status"
            >
              <User className="w-5 h-5 stroke-[1.7]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="p-2 -mr-1 relative text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-md transition-colors focus:outline-none cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.7]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#0c1a3b] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[82vw] bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <img
                    src="https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg"
                    alt="FitYatra"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                  />
                  <span className="font-extrabold text-sm tracking-wider text-neutral-900">
                    FITYATRA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-neutral-500 hover:text-black cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-3 text-base font-semibold text-neutral-800">
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="text-left py-2 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={handleGoShop}
                  className="text-left py-2 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Shop
                </button>
                <button
                  type="button"
                  onClick={handleGoContact}
                  className="text-left py-2 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Contact
                </button>

                <div className="pt-3 mt-3 border-t border-neutral-100 flex flex-col space-y-2.5 text-sm font-medium text-neutral-600">
                  <button
                    type="button"
                    onClick={() => handleGoPolicy('shipping')}
                    className="text-left py-1 hover:text-black transition-colors cursor-pointer"
                  >
                    Shipping Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoPolicy('refund')}
                    className="text-left py-1 hover:text-black transition-colors cursor-pointer"
                  >
                    Refund &amp; Return
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoPolicy('terms')}
                    className="text-left py-1 hover:text-black transition-colors cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLookupSubmitted(false);
                      setAccountModalOpen(true);
                    }}
                    className="text-left py-1 hover:text-black transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Account / Track Order</span>
                  </button>
                </div>
              </nav>
            </div>

            <div className="pt-5 border-t border-neutral-200 text-xs text-neutral-500 space-y-1">
              <p className="font-semibold text-neutral-800">Email: support@fityatra.store</p>
              <a
                href="https://wa.me/9779705283444"
                target="_blank"
                rel="noreferrer"
                className="text-[#0c1a3b] font-bold block hover:underline"
              >
                WhatsApp: 970-5283444
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Customer Account / Order Lookup Modal */}
      {accountModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setAccountModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6 border border-neutral-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAccountModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-black cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <PackageCheck className="w-5 h-5 text-[#0c1a3b]" />
              <h3 className="text-lg font-extrabold text-neutral-950">
                Customer Account &amp; Order Status
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4 leading-relaxed">
              Enter the phone number or email used at checkout to check your live delivery status or reach our support team.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!orderLookupPhone.trim()) return;
                setLookupSubmitted(true);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                value={orderLookupPhone}
                onChange={(e) => setOrderLookupPhone(e.target.value)}
                placeholder="Phone number (e.g. 98XXXXXXXX) or Email"
                required
                className="w-full px-3.5 py-3 text-sm border border-neutral-300 focus:border-neutral-900 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#0c1a3b] hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Check Order Status
              </button>
            </form>

            {lookupSubmitted && (
              <div className="mt-4 p-3.5 bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1.5">
                <p className="font-bold text-neutral-900">
                  Instant Dispatch Support for {orderLookupPhone}:
                </p>
                <p>
                  All verified orders are dispatched within 24 hours with SMS/WhatsApp tracking. Need immediate assistance with your order?
                </p>
                <a
                  href={`https://wa.me/9779705283444?text=${encodeURIComponent(
                    `Hi FitYatra, I would like to check my order status for: ${orderLookupPhone}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-1 font-bold text-[#0c1a3b] underline underline-offset-4"
                >
                  Chat on WhatsApp (970-5283444) →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
