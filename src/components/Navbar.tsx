import { useState } from 'react';
import { Menu, Search, ShoppingBag, X, User } from 'lucide-react';
import { StorePageType } from './Footer';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onSearchClick: () => void;
  onOpenAdmin?: () => void;
  onNavigatePage?: (page: StorePageType) => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  onSearchClick,
  onNavigatePage
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoPage = (page: StorePageType) => {
    setMobileMenuOpen(false);
    if (onNavigatePage) {
      onNavigatePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigatePage) {
      onNavigatePage('home');
    }
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: Mobile Hamburger + Desktop Brand & Navigation */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>

            {/* Desktop Logo */}
            <button
              type="button"
              onClick={() => handleGoPage('home')}
              className="hidden md:flex items-center gap-3 group cursor-pointer text-left"
            >
              <img
                src="https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg"
                alt="FitYatra Logo"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-neutral-200 shadow-xs transition-transform group-hover:scale-105"
              />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-700">
              <button
                type="button"
                onClick={() => handleGoPage('home')}
                className="hover:text-neutral-950 transition-colors cursor-pointer py-1"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('catalog')}
                className="hover:text-neutral-950 transition-colors cursor-pointer py-1"
              >
                Shop
              </button>
              <button
                type="button"
                onClick={() => handleGoPage('contact')}
                className="hover:text-neutral-950 transition-colors cursor-pointer py-1"
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Center: Mobile Logo */}
          <div className="flex md:hidden items-center justify-center">
            <button
              type="button"
              onClick={() => handleGoPage('home')}
              className="flex items-center group cursor-pointer"
            >
              <img
                src="https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg"
                alt="FitYatra Logo"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-neutral-200 shadow-xs transition-transform group-hover:scale-105"
              />
            </button>
          </div>

          {/* Right: Search, Account & Shopping Cart */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            <button
              type="button"
              onClick={onSearchClick}
              className="p-2 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={() => handleGoPage('contact')}
              className="p-2 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              aria-label="Account & Support"
              title="Account & Order Support"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="p-2 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition-colors relative cursor-pointer"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#0c1a3b] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 p-6 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <img
                    src="https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg"
                    alt="FitYatra"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-xs"
                  />
                  <span className="font-extrabold tracking-wider text-sm">FITYATRA</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-3 text-sm font-semibold text-neutral-800">
                <button
                  type="button"
                  onClick={() => handleGoPage('home')}
                  className="text-left py-1.5 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('catalog')}
                  className="text-left py-1.5 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Shop
                </button>
                <button
                  type="button"
                  onClick={() => handleGoPage('contact')}
                  className="text-left py-1.5 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Contact
                </button>
                <button
                  type="button"
                  onClick={() => handleGoPage('shipping')}
                  className="text-left py-1.5 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Shipping Policy
                </button>
                <button
                  type="button"
                  onClick={() => handleGoPage('refund')}
                  className="text-left py-1.5 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Refund &amp; Return
                </button>
                <button
                  type="button"
                  onClick={() => handleGoPage('terms')}
                  className="text-left py-1.5 hover:text-[#0c1a3b] transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-neutral-200 text-xs text-neutral-500">
              <p className="font-medium text-neutral-800">Email: support@fityatra.store</p>
              <a
                href="https://wa.me/9779705283444"
                target="_blank"
                rel="noreferrer"
                className="text-[#0c1a3b] font-bold block mt-1 hover:underline"
              >
                WhatsApp: 970-5283444
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
