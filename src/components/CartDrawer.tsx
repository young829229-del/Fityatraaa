import { useState, useEffect, ChangeEvent } from 'react';
import {
  ArrowLeft,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Copy,
  Upload,
  Loader2,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { CartItem, ShippingRegion, PaymentMethodSetting } from '../types';
import { saveOrderToFirestore, subscribeToPaymentSettings } from '../services/firestoreService';
import { uploadFileToStorage, useResolvedMediaUrl } from '../services/storageService';

function CartProductThumb({ src, alt }: { src: string; alt: string }) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) {
    return <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shrink-0" />;
  }
  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      className="w-16 h-16 object-contain rounded-2xl p-1 shrink-0"
    />
  );
}

function ResolvedQrImage({ src }: { src: string }) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) return null;
  return (
    <img
      src={resolved}
      alt="Payment QR Code"
      referrerPolicy="no-referrer"
      className="w-36 h-36 bg-white p-2 rounded-2xl border border-neutral-200 object-contain shadow-xs mx-auto"
    />
  );
}

export function PaymentGatewayBadge({
  method,
  isSelected
}: {
  method: PaymentMethodSetting;
  isSelected: boolean;
}) {
  const code = (method.code || '').toLowerCase();
  const name = (method.name || '').toLowerCase();

  if (code.includes('esewa') || name.includes('esewa')) {
    return (
      <div className="w-12 h-8 rounded-lg bg-[#60BB46] text-white font-extrabold text-[11px] tracking-tight flex items-center justify-center shrink-0 shadow-xs">
        eSewa
      </div>
    );
  }

  if (code.includes('khalti') || name.includes('khalti')) {
    return (
      <div className="w-12 h-8 rounded-lg bg-[#5C2D91] text-white font-extrabold text-[11px] tracking-tight flex items-center justify-center shrink-0 shadow-xs">
        Khalti
      </div>
    );
  }

  if (code.includes('ime') || name.includes('ime')) {
    return (
      <div className="w-12 h-8 rounded-lg bg-[#E11D48] text-white font-extrabold text-[11px] tracking-tight flex items-center justify-center shrink-0 shadow-xs">
        IME
      </div>
    );
  }

  if (code.includes('card') || name.includes('credit') || name.includes('mastercard')) {
    return (
      <div className="w-12 h-8 flex items-center justify-center shrink-0">
        <span className="w-5 h-5 rounded-full bg-[#EB001B] inline-block" />
        <span className="w-5 h-5 rounded-full bg-[#F79E1B] inline-block -ml-2 opacity-90" />
      </div>
    );
  }

  if (
    code.includes('bank') ||
    code.includes('fonepay') ||
    name.includes('bank') ||
    name.includes('visa') ||
    name.includes('fonepay')
  ) {
    return (
      <div
        className={`w-12 h-8 flex items-center justify-center font-black italic text-[13px] tracking-tighter shrink-0 ${
          isSelected ? 'text-white' : 'text-[#1A1F71]'
        }`}
      >
        {name.includes('fonepay') ? 'FONE' : name.includes('visa') ? 'VISA' : 'BANK'}
      </div>
    );
  }

  if (code === 'cod' || name.includes('cash')) {
    return (
      <div
        className={`w-12 h-8 rounded-lg font-extrabold text-[11px] flex items-center justify-center shrink-0 ${
          isSelected ? 'bg-white/15 text-[#F5B041]' : 'bg-[#121726]/10 text-[#121726]'
        }`}
      >
        COD
      </div>
    );
  }

  return (
    <div
      className={`w-12 h-8 rounded-lg font-extrabold text-[10px] uppercase flex items-center justify-center shrink-0 px-1 truncate ${
        isSelected ? 'bg-white/15 text-white' : 'bg-white text-[#181B25] border border-neutral-200'
      }`}
    >
      {method.code.slice(0, 5)}
    </div>
  );
}

export type FlowStep = 'cart' | 'checkout' | 'payment' | 'submit';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, variant?: string) => void;
  onRemoveItem: (productId: string, variant?: string) => void;
  selectedRegion: ShippingRegion;
  onSelectRegion: (region: ShippingRegion) => void;
  onProceedToCheckout: () => void;
  onClearCart?: () => void;
  initialStep?: FlowStep;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  selectedRegion,
  onSelectRegion,
  onClearCart,
  initialStep = 'cart'
}: CartDrawerProps) {
  const [step, setStep] = useState<FlowStep>(initialStep);
  const [activeDeleteKey, setActiveDeleteKey] = useState<string | null>(null);

  // Customer & Payment state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSetting[]>([]);
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>('esewa');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotProgress, setScreenshotProgress] = useState(0);
  const [copiedText, setCopiedText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);
  const [placedTotal, setPlacedTotal] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setOrderPlacedId(null);
      setFormError(null);
    }
  }, [isOpen, initialStep]);

  // Subscribe to live payment gateways from Firebase (eSewa + Admin-added methods)
  useEffect(() => {
    const unsub = subscribeToPaymentSettings((methods) => {
      const activeMethods = methods.filter((m) => m.enabled);
      setPaymentMethods(activeMethods);
      if (activeMethods.length > 0 && !activeMethods.some((m) => m.code === selectedMethodCode)) {
        const esewaMethod = activeMethods.find(
          (m) => m.code.toLowerCase() === 'esewa' || m.name.toLowerCase().includes('esewa')
        );
        setSelectedMethodCode(esewaMethod ? esewaMethod.code : activeMethods[0].code);
      }
    });
    return () => unsub();
  }, [selectedMethodCode]);

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

  const shippingFee = items.length > 0 ? getShippingFee(selectedRegion, subtotal) : 0;
  const total = subtotal + shippingFee;

  const currentMethod =
    paymentMethods.find((m) => m.code === selectedMethodCode) || paymentMethods[0];

  const handleCopyAccount = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleScreenshotUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingScreenshot(true);
    setScreenshotProgress(10);
    try {
      const result = await uploadFileToStorage(file, 'payment-screenshots', (p) => {
        setScreenshotProgress(p);
      });
      if (result.url) {
        setScreenshotUrl(result.url);
      }
    } catch (err) {
      console.error('Screenshot upload error:', err);
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleGoToPayment = () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError('Please enter your Full Name, Mobile Number, and Delivery Address.');
      return;
    }
    setFormError(null);
    setStep('payment');
  };

  const handleSubmitOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setStep('checkout');
      setFormError('Please enter your Full Name, Mobile Number, and Delivery Address.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const regionPrefix =
      selectedRegion === 'KTM_VALLEY'
        ? 'KTM'
        : selectedRegion === 'POKHARA'
        ? 'PKR'
        : selectedRegion === 'CHITWAN'
        ? 'CTW'
        : selectedRegion === 'MAJOR_TARAI'
        ? 'TAR'
        : 'REM';

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderId = `FY-${regionPrefix}-${randomDigits}`;
    const isCod = (currentMethod?.code || selectedMethodCode).toLowerCase() === 'cod';

    try {
      await saveOrderToFirestore({
        id: orderId,
        customerName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        region: selectedRegion,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.totalPrice || item.product.price * item.quantity,
          selectedVariant: item.selectedVariant,
          selectedBundle: item.selectedBundle?.title,
          selectedFlavors: item.selectedFlavors,
          image: item.product.image
        })),
        totalAmount: total,
        paymentMethod: currentMethod?.name || selectedMethodCode,
        paymentScreenshotUrl: screenshotUrl || '',
        paymentStatus: isCod ? 'pending' : screenshotUrl ? 'submitted' : 'pending',
        status: 'pending'
      });

      setPlacedTotal(total);
      setOrderPlacedId(orderId);
      setStep('submit');
      if (onClearCart) {
        onClearCart();
      } else {
        items.forEach((item) => onRemoveItem(item.product.id, item.selectedVariant));
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      setFormError('Could not submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (orderId: string) => {
    const text = encodeURIComponent(
      `Namaste FitYatra! I placed order #${orderId} for Rs. ${placedTotal.toLocaleString(
        'en-US'
      )}.\nName: ${fullName}\nPhone: ${phone}\nAddress: ${address}\nPayment: ${
        currentMethod?.name || selectedMethodCode
      }`
    );
    return `https://wa.me/9779705283444?text=${text}`;
  };

  const handleClearAll = () => {
    if (onClearCart) {
      onClearCart();
    } else {
      items.forEach((item) => onRemoveItem(item.product.id, item.selectedVariant));
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('checkout');
    } else if (step === 'checkout') {
      setStep('cart');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Drawer Container */}
      <div
        className={`relative w-full max-w-[410px] h-full z-10 flex flex-col justify-between transition-colors duration-200 overflow-hidden shadow-2xl ${
          step !== 'cart' ? 'bg-[#7F848F]' : 'bg-white'
        }`}
      >
        {/* Top Header Area */}
        <div
          className={`px-6 pt-6 pb-4 shrink-0 transition-colors duration-200 ${
            step !== 'cart' ? 'text-[#181B25]/80' : 'bg-white text-[#181B25]'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-[#181B25]" />
            </button>

            {items.length > 0 && step === 'cart' && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1.5 -mr-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                title="Clear Order"
              >
                <Trash2 className="w-[18px] h-[18px] text-[#181B25]" />
              </button>
            )}
          </div>

          <h2 className="text-[26px] font-semibold tracking-tight text-[#181B25] mt-4">
            My Order
          </h2>
        </div>

        {/* STEP 1: CART */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#F8F8FA] flex items-center justify-center mx-auto text-[#9EA3B0]">
                    <ShoppingCart className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <p className="text-sm font-medium text-[#9EA3B0]">Your order bag is empty</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-full bg-[#121726] text-white text-xs font-semibold tracking-wide cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item, idx) => {
                  const itemKey = `${item.product.id}-${item.selectedBundle?.id || 'single'}-${
                    item.selectedVariant || 'default'
                  }-${idx}`;
                  const itemTotal = item.totalPrice || item.product.price * item.quantity;
                  const showDeletePill =
                    activeDeleteKey === itemKey || (activeDeleteKey === null && idx === 1);

                  const subtitle =
                    item.selectedFlavors && item.selectedFlavors.length > 0
                      ? item.selectedFlavors.join(', ')
                      : item.selectedVariant
                      ? item.selectedVariant
                      : item.selectedBundle
                      ? item.selectedBundle.title
                      : item.product.category || item.product.brand;

                  return (
                    <div key={itemKey} className="flex items-stretch gap-3">
                      <div
                        onClick={() =>
                          setActiveDeleteKey(activeDeleteKey === itemKey ? '__none__' : itemKey)
                        }
                        className="flex-1 min-w-0 bg-[#F8F8FA] hover:bg-[#F3F4F8] rounded-[24px] p-3.5 flex items-center gap-3.5 transition-all cursor-pointer"
                      >
                        <CartProductThumb src={item.product.image} alt={item.product.name} />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[14px] text-[#181B25] truncate leading-snug">
                            {item.product.name}
                          </h4>
                          {subtitle && (
                            <p className="text-[11px] text-[#9EA3B0] truncate mt-0.5">{subtitle}</p>
                          )}
                          <span className="font-extrabold text-[14px] text-[#181B25] block mt-1.5 tabular-nums">
                            Rs. {itemTotal.toLocaleString('en-US')}
                          </span>
                        </div>

                        {/* Quantity Stepper (- 1 +) */}
                        <div
                          className="flex items-center gap-2.5 shrink-0 pl-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                onRemoveItem(item.product.id, item.selectedVariant);
                              } else {
                                onUpdateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                  item.selectedVariant
                                );
                              }
                            }}
                            className="w-6 h-6 flex items-center justify-center text-[15px] font-medium text-[#181B25] hover:opacity-60 transition-opacity cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-[13px] font-bold text-[#181B25] tabular-nums min-w-[12px] text-center">
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
                            className="w-6 h-6 flex items-center justify-center text-[15px] font-medium text-[#181B25] hover:opacity-60 transition-opacity cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {showDeletePill && (
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id, item.selectedVariant)}
                          className="w-12 bg-[#FFE5E6] hover:bg-[#FFD6D8] text-[#EF4444] rounded-[22px] flex items-center justify-center shrink-0 transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 pb-7 pt-2 bg-white shrink-0">
                <div className="w-24 h-[1.5px] bg-[#F1F2F6] mx-auto mb-5" />

                <div className="flex items-center justify-between text-[13px] mb-6">
                  <span className="text-[#9EA3B0] font-medium">Delivery services:</span>
                  <span className="font-bold text-[#181B25] tabular-nums">
                    Rs. {shippingFee.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[12px] text-[#9EA3B0] font-medium block mb-0.5">
                      Total price
                    </span>
                    <span className="text-[26px] font-extrabold text-[#181B25] tracking-tight tabular-nums leading-none">
                      Rs. {total.toLocaleString('en-US')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('checkout')}
                    className="bg-[#121726] hover:bg-[#1C2338] active:scale-[0.99] text-white rounded-full px-7 py-4 flex items-center gap-2.5 shadow-lg transition-all cursor-pointer shrink-0"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#F5B041]" />
                    <span className="text-[14px] font-semibold">Checkout</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* STEP 2: CHECKOUT (Delivery Details) */}
        {step === 'checkout' && (
          <div className="flex-1 bg-white rounded-t-[34px] pt-3 px-6 pb-7 flex flex-col justify-between overflow-y-auto shadow-[0_-12px_40px_rgba(0,0,0,0.14)]">
            <div>
              <div className="w-8 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-5" />

              <h3 className="text-[22px] text-[#181B25] tracking-tight mb-5">
                <span className="font-normal">Delivery</span>{' '}
                <span className="font-semibold">details</span>
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#9EA3B0] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#F8F8FA] text-[13px] font-medium text-[#181B25] px-4 py-3.5 rounded-2xl border border-transparent focus:border-[#121726] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9EA3B0] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-[#F8F8FA] text-[13px] font-medium text-[#181B25] px-4 py-3.5 rounded-2xl border border-transparent focus:border-[#121726] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9EA3B0] mb-1">
                    Delivery City / Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => onSelectRegion(e.target.value as ShippingRegion)}
                    className="w-full bg-[#F8F8FA] text-[13px] font-medium text-[#181B25] px-4 py-3.5 rounded-2xl border border-transparent focus:border-[#121726] focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="KTM_VALLEY">Kathmandu Valley (KTM, Lalitpur, Bhaktapur)</option>
                    <option value="POKHARA">Pokhara / Lekhnath (+Rs. 150)</option>
                    <option value="CHITWAN">Chitwan / Narayangarh (+Rs. 150)</option>
                    <option value="MAJOR_TARAI">Major Tarai (+Rs. 200)</option>
                    <option value="HILLY_REMOTE">Hilly & Remote Districts (+Rs. 300)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9EA3B0] mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address & landmark"
                    className="w-full bg-[#F8F8FA] text-[13px] font-medium text-[#181B25] px-4 py-3.5 rounded-2xl border border-transparent focus:border-[#121726] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs font-semibold text-[#EF4444] mt-3">{formError}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-5 mt-2">
              <div>
                <span className="text-[12px] text-[#9EA3B0] font-medium block mb-0.5">
                  Total price
                </span>
                <span className="text-[26px] font-extrabold text-[#181B25] tracking-tight tabular-nums leading-none">
                  Rs. {total.toLocaleString('en-US')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoToPayment}
                className="bg-[#121726] hover:bg-[#1C2338] active:scale-[0.99] text-white rounded-full px-7 py-4 flex items-center gap-2.5 shadow-lg transition-all cursor-pointer shrink-0"
              >
                <span className="text-[14px] font-semibold">Payment</span>
                <ArrowRight className="w-4 h-4 text-[#F5B041]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT (Select Payment Gateway -> Submit) */}
        {step === 'payment' && (
          <div className="flex-1 bg-white rounded-t-[34px] pt-3 px-6 pb-7 flex flex-col justify-between overflow-y-auto shadow-[0_-12px_40px_rgba(0,0,0,0.14)]">
            <div>
              <div className="w-8 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-5" />

              <h3 className="text-[22px] text-[#181B25] tracking-tight mb-5">
                <span className="font-normal">Order</span>{' '}
                <span className="font-semibold">confirmation</span>
              </h3>

              {/* Payment Gateways List (eSewa + Admin-configured methods) */}
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethodCode === method.code;
                  const subtitle =
                    method.accountNumber ||
                    method.accountName ||
                    (method.code === 'cod' ? 'Pay on delivery' : 'Instant verification');

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethodCode(method.code)}
                      className={`w-full rounded-[22px] p-4 flex items-center justify-between transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#121726] text-white shadow-lg'
                          : 'bg-[#F8F8FA] hover:bg-[#F1F2F6] text-[#181B25]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <PaymentGatewayBadge method={method} isSelected={isSelected} />
                        <div className="min-w-0">
                          <p
                            className={`text-[13px] font-semibold truncate ${
                              isSelected ? 'text-white' : 'text-[#181B25]'
                            }`}
                          >
                            {method.name}
                          </p>
                          <p
                            className={`text-[11px] font-mono truncate mt-0.5 ${
                              isSelected ? 'text-[#8E95A5]' : 'text-[#9EA3B0]'
                            }`}
                          >
                            {subtitle}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-white' : 'border-[#C5CAD3]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Gateway Details (QR & Screenshot Upload controlled by Admin toggles) */}
              {currentMethod &&
                ((currentMethod.qrEnabled && Boolean(currentMethod.qrImageUrl)) ||
                  currentMethod.requiresScreenshot) && (
                  <div className="mt-3.5 bg-[#F8F8FA] rounded-[22px] p-3.5 space-y-2.5 border border-[#ECEEF2]">
                    {currentMethod.qrEnabled && currentMethod.qrImageUrl && (
                      <ResolvedQrImage src={currentMethod.qrImageUrl} />
                    )}

                    {currentMethod.requiresScreenshot && (
                      <label className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-neutral-50 text-[#181B25] font-semibold text-[11px] rounded-xl border border-neutral-200 cursor-pointer transition-colors">
                        {isUploadingScreenshot ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#181B25]" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#181B25]" />
                        )}
                        <span>
                          {screenshotUrl
                            ? 'Payment Screenshot Attached ✓'
                            : isUploadingScreenshot
                            ? `Uploading (${screenshotProgress}%)...`
                            : 'Upload Payment Screenshot'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleScreenshotUpload}
                        />
                      </label>
                    )}
                  </div>
                )}

              {formError && (
                <p className="text-xs font-semibold text-[#EF4444] mt-3">{formError}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-5 mt-2">
              <div>
                <span className="text-[12px] text-[#9EA3B0] font-medium block mb-0.5">
                  Total price
                </span>
                <span className="text-[26px] font-extrabold text-[#181B25] tracking-tight tabular-nums leading-none">
                  Rs. {total.toLocaleString('en-US')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || isUploadingScreenshot}
                className="bg-[#121726] hover:bg-[#1C2338] disabled:opacity-60 active:scale-[0.99] text-white rounded-full px-7 py-4 flex items-center gap-2.5 shadow-lg transition-all cursor-pointer shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#F5B041]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#F5B041]" />
                )}
                <span className="text-[14px] font-semibold">
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUBMIT (Order Confirmed) */}
        {step === 'submit' && orderPlacedId && (
          <div className="flex-1 bg-white rounded-t-[34px] pt-3 px-6 pb-7 flex flex-col justify-between overflow-y-auto shadow-[0_-12px_40px_rgba(0,0,0,0.14)]">
            <div className="my-auto py-6 text-center space-y-5">
              <div className="w-16 h-16 bg-[#121726] text-[#F5B041] rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-[22px] font-semibold text-[#181B25]">
                  Order #{orderPlacedId}
                </h3>
                <p className="text-xs text-[#9EA3B0] mt-1">
                  Your order has been submitted and queued for dispatch.
                </p>
              </div>

              <div className="bg-[#F8F8FA] rounded-[22px] p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9EA3B0]">Recipient</span>
                  <span className="font-semibold text-[#181B25]">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9EA3B0]">Phone</span>
                  <span className="font-semibold text-[#181B25]">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9EA3B0]">Address</span>
                  <span className="font-semibold text-[#181B25] truncate max-w-[180px]">
                    {address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9EA3B0]">Payment Gateway</span>
                  <span className="font-semibold text-[#181B25]">
                    {currentMethod?.name || selectedMethodCode}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200/60">
                  <span className="text-[#9EA3B0] font-medium">Total Amount</span>
                  <span className="font-extrabold text-[#181B25] text-sm">
                    Rs. {placedTotal.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <a
                  href={getWhatsAppLink(orderPlacedId)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 px-6 bg-[#121726] hover:bg-[#1C2338] text-white font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Send Order Receipt on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 text-[#F5B041]" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-6 bg-[#F8F8FA] hover:bg-[#F1F2F6] text-[#181B25] font-semibold text-xs rounded-full transition-colors cursor-pointer"
                >
                  Back to Store
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
