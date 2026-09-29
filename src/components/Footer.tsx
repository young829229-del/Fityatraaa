import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { saveEmailSubscriberToFirestore } from '../services/firestoreService';

export type StorePageType =
  | 'home'
  | 'contact'
  | 'shipping'
  | 'refund'
  | 'terms'
  | 'privacy';

interface FooterProps {
  activePage?: StorePageType;
  onNavigatePage?: (page: StorePageType) => void;
  onShopClick?: () => void;
}

export default function Footer({
  activePage = 'home',
  onNavigatePage,
  onShopClick
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNav = (page: StorePageType) => {
    if (onNavigatePage) {
      onNavigatePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const submittedEmail = email.trim();
    setSubscribed(true);
    setEmail('');
    try {
      await saveEmailSubscriberToFirestore(submittedEmail, 'footer');
    } catch (err) {
      console.warn('Error saving footer subscriber:', err);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#0b1528] via-[#050a14] to-black text-white px-6 pt-12 pb-14">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Need Help? */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-5">
              Need Help?
            </h4>
            <ul className="space-y-4 text-sm sm:text-base text-neutral-200">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    activePage === 'home' ? 'underline underline-offset-4 text-white' : ''
                  }`}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onShopClick) {
                      onShopClick();
                    } else {
                      handleNav('home');
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shop
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    activePage === 'contact' ? 'underline underline-offset-4 text-white' : ''
                  }`}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-5">
              Policies
            </h4>
            <ul className="space-y-4 text-sm sm:text-base text-neutral-200">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('shipping')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    activePage === 'shipping' ? 'underline underline-offset-4 text-white' : ''
                  }`}
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('refund')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    activePage === 'refund' ? 'underline underline-offset-4 text-white' : ''
                  }`}
                >
                  Refund &amp; Return
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('terms')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    activePage === 'terms' ? 'underline underline-offset-4 text-white' : ''
                  }`}
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('terms')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    activePage === 'privacy' ? 'underline underline-offset-4 text-white' : ''
                  }`}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Info
                </button>
              </li>
            </ul>
          </div>

          {/* Stay Ahead. Stay Strong. */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-4">
              Stay Ahead. Stay Strong.
            </h4>
            <div className="text-sm sm:text-base text-neutral-200 leading-relaxed space-y-1">
              <p>Stop missing out.</p>
              <p>
                Join our email list for free access to exclusive offers, new product launches, and expert fitness tips.
              </p>
            </div>
            <p className="mt-6 text-sm sm:text-base font-bold text-white">
              We only send real updates, never spam.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 relative max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-transparent border border-neutral-400/70 rounded-lg pl-4 pr-12 py-3.5 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                {subscribed ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs text-emerald-400 font-medium">
                Thanks for subscribing!
              </p>
            )}
          </div>
        </div>

        {/* Social Icons & Copyright Area */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="hover:text-white transition-colors"
            >
              TikTok
            </a>
            <a
              href="https://wa.me/9779705283444"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </a>
          </div>

          <p className="text-neutral-400">
            © {new Date().getFullYear()}, FitYatra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
