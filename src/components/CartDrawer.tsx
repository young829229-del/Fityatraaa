import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, ShippingRegion } from '../types';
import { useResolvedMediaUrl } from '../services/storageService';

function CartProductThumb({ src, alt }: { src: string; alt: string }) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) {
    return (
      <div className="w-16 h-16 bg-[#F8F9FA] rounded-none p-1.5 shrink-0 border border-neutral-200" />
    );
  }
  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      className="w-16 h-16 object-contain bg-[#F8F9FA] rounded-none p-1.5 shrink-0 border border-neutral-200"
    />
  );
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, variant?: string) => void;
  onRemoveItem: (productId: string, variant?: string) => void;
  selectedRegion: ShippingRegion;
  onSelectRegion: (region: ShippingRegion) => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  selectedRegion,
  onSelectRegion,
  onProceedToCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => {
    const price = item.totalPrice || item.product.price * item.quantity;
    return sum + price;
  }, 0);

  const getShippingFee = (region: ShippingRegion, sub: number): number => {
    switch (region) {
      case 'KTM_VALLEY':
        return sub >= 3000 ? 0 : 100;
      case 'POKHARA':
      case 'CHITWAN':
        return 150;
      case 'MAJOR_TARAI':
        return 200;
      case 'HILLY_REMOTE':
        return 300;
      default:
        return 150;
    }
  };

  const shippingFee = getShippingFee(selectedRegion, subtotal);
  const total = subtotal + (items.length > 0 ? shippingFee : 0);
  const ktmFreeProgress = Math.min(100, (subtotal / 3000) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-900" />
            <h2 className="font-extrabold text-base sm:text-lg text-neutral-900">
              Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free KTM Shipping Bar */}
        <div className="bg-[#FAF9F6] px-4 py-2.5 border-b border-neutral-200/60">
          <div className="flex justify-between text-[11px] font-semibold text-neutral-700 mb-1">
            <span>
              {subtotal >= 3000
                ? '🎉 You unlocked FREE Kathmandu Valley Shipping!'
                : `Add Rs. ${(3000 - subtotal).toLocaleString('en-US')} more for Free KTM Shipping`}
            </span>
            <span>{Math.round(ktmFreeProgress)}%</span>
          </div>
          <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${ktmFreeProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 space-y-3">
              <ShoppingBag className="w-12 h-12 stroke-[1.2] mx-auto text-neutral-300" />
              <p className="font-medium text-sm">Your shopping bag is empty.</p>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold uppercase tracking-wider text-black underline underline-offset-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => {
              const itemTotal = item.totalPrice || item.product.price * item.quantity;
              return (
                <div
                  key={`${item.product.id}-${item.selectedBundle?.id || 'single'}-${item.selectedVariant || 'default'}-${idx}`}
                  className="flex gap-3 pb-3 border-b border-neutral-100 items-center justify-between"
                >
                  <CartProductThumb
                    src={item.product.image}
                    alt={item.product.name}
                  />

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1">
                      {item.product.name}
                    </h4>
                    {item.selectedBundle && (
                      <span className="inline-block bg-neutral-900 text-white text-[9px] font-black uppercase px-1.5 py-0.2 mt-0.5">
                        {item.selectedBundle.title} Deal
                      </span>
                    )}
                    {item.selectedFlavors && item.selectedFlavors.length > 0 ? (
                      <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                        Flavors: {item.selectedFlavors.join(', ')}
                      </p>
                    ) : item.selectedVariant ? (
                      <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                        {item.selectedVariant}
                      </p>
                    ) : null}
                    <span className="font-extrabold text-xs text-neutral-900 block mt-1">
                      Rs. {itemTotal.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id, item.selectedVariant)}
                      className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            Math.max(1, item.quantity - 1),
                            item.selectedVariant
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center text-xs text-neutral-600 hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            item.quantity + 1,
                            item.selectedVariant
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center text-xs text-neutral-600 hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Calculation / Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white space-y-3">
            {/* Region Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Select Delivery Province / City:
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => onSelectRegion(e.target.value as ShippingRegion)}
                className="w-full text-xs font-semibold py-2 px-2.5 bg-neutral-50 border border-neutral-300 rounded-md focus:outline-none focus:border-black"
              >
                <option value="KTM_VALLEY">Kathmandu Valley (KTM, Lalitpur, Bhaktapur)</option>
                <option value="POKHARA">Pokhara / Lekhnath (+Rs. 150)</option>
                <option value="CHITWAN">Chitwan / Narayangarh (+Rs. 150)</option>
                <option value="MAJOR_TARAI">Major Tarai (Biratnagar, Butwal, Birgunj) (+Rs. 200)</option>
                <option value="HILLY_REMOTE">Hilly & Remote Districts (+Rs. 300)</option>
              </select>
            </div>

            {/* Subtotal & Shipping summary */}
            <div className="space-y-1 text-xs text-neutral-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-neutral-900">
                  Rs. {subtotal.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping:</span>
                <span className="font-bold text-neutral-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    `Rs. ${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-neutral-950 pt-1 border-t border-neutral-100">
                <span>Order Total:</span>
                <span>Rs. {total.toLocaleString('en-US')}.00</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-md hover:bg-neutral-900 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
