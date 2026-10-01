import { useState, useEffect, ChangeEvent } from 'react';
import {
  ArrowLeft,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Upload,
  Loader2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';
import { CartItem, ShippingRegion, PaymentMethodSetting } from '../types';
import {
  DEFAULT_PAYMENT_METHODS,
  saveOrderToFirestore,
  subscribeToPaymentSettings,
  verifyPaymentScreenshotInFirestore
} from '../services/firestoreService';
import { uploadFileToStorage, useResolvedMediaUrl } from '../services/storageService';

async function computeFileSha256(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fallback below
  }
  return `fp_${file.name}_${file.size}_${file.lastModified}`;
}

function validateReceiptImageDimensions(file: File): Promise<{ valid: boolean; reason?: string }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|gif|bmp|heic)$/i.test(file.name)) {
      resolve({ valid: false, reason: 'Please upload a valid image file (PNG, JPG, WEBP).' });
      return;
    }
    if (file.size < 1024) {
      resolve({
        valid: false,
        reason: 'Uploaded file is too small to be a valid payment screenshot.'
      });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      URL.revokeObjectURL(objectUrl);
      if (w < 80 || h < 80) {
        resolve({
          valid: false,
          reason: 'Image resolution is too small. Please upload a clear payment receipt screenshot.'
        });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, reason: 'Could not read image file. Please try another screenshot.' });
    };
    img.src = objectUrl;
  });
}

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

function ResolvedQrImage({ src, label }: { src?: string; label: string }) {
  const resolved = useResolvedMediaUrl(typeof src === 'string' ? src : '');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src, resolved]);

  if (src && resolved && !imgError) {
    return (
      <div className="text-center space-y-1.5">
        <img
          src={resolved}
          alt={`${label} QR Code`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-40 h-40 bg-white p-2 rounded-2xl border border-neutral-200 object-contain shadow-xs mx-auto"
        />
        <p className="text-[11px] font-medium text-[#6E7485]">
          Scan {label} QR to complete payment
        </p>
      </div>
    );
  }

  return (
    <div className="w-40 h-40 bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs mx-auto flex flex-col items-center justify-center text-center gap-1.5">
      <QrCode className="w-14 h-14 text-[#181B25] stroke-[1.6]" />
      <span className="text-[11px] font-bold text-[#181B25]">{label} QR</span>
      <span className="text-[9px] text-[#9EA3B0] leading-tight">
        Scan configured {label} QR &amp; upload receipt below
      </span>
    </div>
  );
}

function ScreenshotPreviewThumb({
  src,
  localPreview,
  onClear
}: {
  src: string;
  localPreview?: string;
  onClear: () => void;
}) {
  const resolved = useResolvedMediaUrl(src);
  const displaySrc = localPreview || resolved || src;
  if (!displaySrc) return null;

  return (
    <div className="relative bg-white rounded-2xl border border-emerald-200 p-2.5 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 shrink-0">
          <img
            src={displaySrc}
            alt="Uploaded Payment Screenshot Preview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Payment Screenshot Preview</span>
          </div>
          <p className="text-[10px] text-[#6E7485] mt-0.5 leading-snug">
            Screenshot attached. Click Submit below to verify and confirm your order.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
          title="Remove screenshot"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
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
      {String(method.code || method.name || 'PAY').slice(0, 5)}
    </div>
  );
}

export type FlowStep = 'cart' | 'checkout' | 'payment' | 'submit';

interface PlacedOrderSummary {
  orderId: string;
  paymentMethod: string;
  productTotal: number;
  deliveryCharge: number;
  amountPaidNow: number;
  amountRemainingOnDelivery: number;
  totalAmount: number;
  deliveryChargeStatus: 'Paid';
  productPaymentType: 'Pay on Delivery' | 'Paid Online';
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
  const [allMethods, setAllMethods] = useState<PaymentMethodSetting[]>(DEFAULT_PAYMENT_METHODS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSetting[]>(
    DEFAULT_PAYMENT_METHODS
  );
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>('esewa');
  const [codOnlineGatewayCode, setCodOnlineGatewayCode] = useState<string>('esewa');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [screenshotLocalPreview, setScreenshotLocalPreview] = useState<string>('');
  const [screenshotHash, setScreenshotHash] = useState<string>('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotProgress, setScreenshotProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderSummary, setPlacedOrderSummary] = useState<PlacedOrderSummary | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setPlacedOrderSummary(null);
      setFormError(null);
      if (initialStep === 'cart') {
        setHasSelectedLocation(false);
      }
    }
  }, [isOpen, initialStep]);

  // Subscribe to live payment gateways from Firebase
  useEffect(() => {
    const unsub = subscribeToPaymentSettings((methods) => {
      setAllMethods(methods);
      const activeMethods = methods.filter((m) => m.enabled);
      // Always ensure both eSewa and Cash on Delivery are available as required
      const nextList = [...(activeMethods.length > 0 ? activeMethods : DEFAULT_PAYMENT_METHODS)];
      const hasEsewa = nextList.some((m) => String(m.code || '').toLowerCase() === 'esewa');
      if (!hasEsewa) {
        const esewaRecord =
          methods.find((m) => String(m.code || '').toLowerCase() === 'esewa') ||
          DEFAULT_PAYMENT_METHODS[0];
        nextList.unshift({ ...esewaRecord, enabled: true });
      }
      const hasCod = nextList.some((m) => String(m.code || '').toLowerCase() === 'cod');
      if (!hasCod) {
        const codRecord =
          methods.find((m) => String(m.code || '').toLowerCase() === 'cod') ||
          DEFAULT_PAYMENT_METHODS[2];
        nextList.push({ ...codRecord, enabled: true });
      }

      setPaymentMethods(nextList);
      if (nextList.length > 0 && !nextList.some((m) => m.code === selectedMethodCode)) {
        const esewaMethod = nextList.find(
          (m) =>
            String(m.code || '').toLowerCase() === 'esewa' ||
            String(m.name || '').toLowerCase().includes('esewa')
        );
        setSelectedMethodCode(esewaMethod ? esewaMethod.code : nextList[0].code);
      }
    });
    return () => unsub();
  }, [selectedMethodCode]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => {
    const price = item.totalPrice || item.product.price * item.quantity;
    return sum + price;
  }, 0);

  const getShippingFee = (region: ShippingRegion): number => {
    switch (region) {
      case 'KTM_VALLEY':
        return 100;
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

  const shippingFee =
    items.length > 0 && hasSelectedLocation ? getShippingFee(selectedRegion) : 0;
  const total = subtotal + shippingFee;

  const currentMethod =
    paymentMethods.find((m) => m.code === selectedMethodCode) || paymentMethods[0];
  const isCodSelected = String(currentMethod?.code || selectedMethodCode).toLowerCase() === 'cod';

  // Online gateways available for paying the upfront delivery charge when COD is selected
  const onlineGateways = allMethods.filter(
    (m) => String(m.code || '').toLowerCase() !== 'cod' && (m.enabled || m.code === 'esewa')
  );
  const activeCodOnlineGateway =
    onlineGateways.find((m) => m.code === codOnlineGatewayCode) ||
    onlineGateways.find((m) => m.code === 'esewa') ||
    DEFAULT_PAYMENT_METHODS[0];

  const amountToPayNow = isCodSelected ? shippingFee : total;
  const amountRemainingOnDelivery = isCodSelected ? subtotal : 0;

  const getMethodSubtitle = (method: PaymentMethodSetting): string => {
    const code = String(method.code || '').toLowerCase();
    // Never show phone or bank account numbers in eSewa or Bank
    if (code === 'esewa') {
      return 'Pay full order online via QR';
    }
    if (code === 'bank') {
      return 'Direct bank / Fonepay QR transfer';
    }
    if (code === 'cod') {
      return 'Delivery charge paid upfront • Product on delivery';
    }
    return 'Online QR payment';
  };

  const handleClearScreenshot = () => {
    setScreenshotUrl('');
    setScreenshotLocalPreview('');
    setScreenshotHash('');
    setFormError(null);
  };

  const handleScreenshotUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setIsUploadingScreenshot(true);
    setScreenshotProgress(15);

    try {
      // 1. Validate receipt image dimensions & format
      const dimCheck = await validateReceiptImageDimensions(file);
      if (!dimCheck.valid) {
        setFormError(dimCheck.reason || 'Invalid payment screenshot image.');
        setIsUploadingScreenshot(false);
        e.target.value = '';
        return;
      }

      // 2. Compute SHA-256 fingerprint for duplicate-screenshot protection
      const fileHash = await computeFileSha256(file);
      const localUrl = URL.createObjectURL(file);

      // 3. Upload screenshot
      const result = await uploadFileToStorage(file, 'payment-screenshots', (p) => {
        setScreenshotProgress(p);
      });

      if (result.url) {
        // 4. Immediately check duplicate screenshot protection against existing orders
        const verifyCheck = await verifyPaymentScreenshotInFirestore({
          screenshotHash: fileHash,
          screenshotUrl: result.url
        });

        if (!verifyCheck.verified) {
          URL.revokeObjectURL(localUrl);
          setScreenshotUrl('');
          setScreenshotLocalPreview('');
          setScreenshotHash('');
          setFormError(
            verifyCheck.reason || 'This payment screenshot could not be verified.'
          );
          return;
        }

        setScreenshotUrl(result.url);
        setScreenshotLocalPreview(localUrl);
        setScreenshotHash(fileHash);
      }
    } catch (err) {
      console.error('Screenshot upload error:', err);
      setFormError('Failed to upload screenshot. Please try again.');
    } finally {
      setIsUploadingScreenshot(false);
      e.target.value = '';
    }
  };

  const handleGoToPayment = () => {
    if (!fullName.trim() || !phone.trim() || !hasSelectedLocation || !address.trim()) {
      setFormError('Please enter your Full Name, Mobile Number, Delivery Location, and Address.');
      return;
    }
    setFormError(null);
    setStep('payment');
  };

  const handleSubmitOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !hasSelectedLocation || !address.trim()) {
      setStep('checkout');
      setFormError('Please enter your Full Name, Mobile Number, Delivery Location, and Address.');
      return;
    }

    // Require payment screenshot for both Full Online (eSewa/Bank) and COD upfront delivery charge
    if (!screenshotUrl) {
      if (isCodSelected) {
        setFormError(
          `Please pay the delivery charge (Rs. ${shippingFee.toLocaleString(
            'en-US'
          )}) and upload your payment screenshot to confirm your Cash on Delivery order.`
        );
      } else {
        setFormError(
          `Please scan the ${
            currentMethod?.name || 'eSewa'
          } QR and upload your payment screenshot (Rs. ${total.toLocaleString(
            'en-US'
          )}) to verify your order.`
        );
      }
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      // Run payment verification & duplicate-screenshot protection before confirming order
      const verification = await verifyPaymentScreenshotInFirestore({
        screenshotHash,
        screenshotUrl
      });

      if (!verification.verified) {
        setFormError(
          verification.reason ||
            'Payment screenshot verification failed. Please upload a valid payment receipt.'
        );
        setIsSubmitting(false);
        return;
      }

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

      const finalPaymentMethod = isCodSelected
        ? 'Cash on Delivery'
        : currentMethod?.name || 'eSewa';
      const deliveryChargeStatus: 'Paid' = 'Paid';
      const productPaymentType: 'Pay on Delivery' | 'Paid Online' = isCodSelected
        ? 'Pay on Delivery'
        : 'Paid Online';
      const usedOnlineGateway = isCodSelected
        ? activeCodOnlineGateway?.name || 'eSewa'
        : currentMethod?.name || 'eSewa';

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
        productTotal: subtotal,
        deliveryCharge: shippingFee,
        amountPaidNow: amountToPayNow,
        amountRemainingOnDelivery,
        deliveryChargeStatus,
        productPaymentType,
        deliveryPaymentGateway: usedOnlineGateway,
        screenshotHash,
        paymentMethod: finalPaymentMethod,
        paymentScreenshotUrl: screenshotUrl,
        paymentStatus: 'verified',
        status: 'confirmed',
        notes: isCodSelected
          ? `COD Order: Delivery charge Rs. ${shippingFee} paid via ${usedOnlineGateway}. Remaining Rs. ${subtotal} to collect on delivery.`
          : `Full Online Order: Rs. ${total} paid via ${usedOnlineGateway}.`
      });

      setPlacedOrderSummary({
        orderId,
        paymentMethod: finalPaymentMethod,
        productTotal: subtotal,
        deliveryCharge: shippingFee,
        amountPaidNow: amountToPayNow,
        amountRemainingOnDelivery,
        totalAmount: total,
        deliveryChargeStatus,
        productPaymentType
      });

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

  const getWhatsAppLink = (summary: PlacedOrderSummary) => {
    const text = encodeURIComponent(
      `Namaste FitYatra! I placed order #${summary.orderId}.\nName: ${fullName}\nPhone: ${phone}\nAddress: ${address}\nPayment Method: ${summary.paymentMethod}\nProduct Total: Rs. ${summary.productTotal.toLocaleString(
        'en-US'
      )} (${summary.productPaymentType})\nDelivery Charge: Rs. ${summary.deliveryCharge.toLocaleString(
        'en-US'
      )} (${summary.deliveryChargeStatus})\nAmount Paid Now: Rs. ${summary.amountPaidNow.toLocaleString(
        'en-US'
      )}\nRemaining on Delivery: Rs. ${summary.amountRemainingOnDelivery.toLocaleString('en-US')}`
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

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[12px] text-[#9EA3B0] font-medium block mb-0.5">
                      Total price
                    </span>
                    <span className="text-[26px] font-extrabold text-[#181B25] tracking-tight tabular-nums leading-none">
                      Rs. {subtotal.toLocaleString('en-US')}
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
                    Delivery City / Region *
                  </label>
                  <select
                    value={hasSelectedLocation ? selectedRegion : ''}
                    onChange={(e) => {
                      const val = e.target.value as ShippingRegion;
                      setHasSelectedLocation(true);
                      onSelectRegion(val);
                    }}
                    className="w-full bg-[#F8F8FA] text-[13px] font-medium text-[#181B25] px-4 py-3.5 rounded-2xl border border-transparent focus:border-[#121726] focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="" disabled>
                      Select delivery location
                    </option>
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

                {hasSelectedLocation && (
                  <div className="flex items-center justify-between text-[13px] pt-2 px-1">
                    <span className="text-[#9EA3B0] font-medium">Delivery services:</span>
                    <span className="font-bold text-[#181B25] tabular-nums">
                      Rs. {shippingFee.toFixed(2)}
                    </span>
                  </div>
                )}
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

        {/* STEP 3: PAYMENT (Select Payment Method -> Expand Inside Checkout -> Verify & Submit) */}
        {step === 'payment' && (
          <div className="flex-1 bg-white rounded-t-[34px] pt-3 px-6 pb-7 flex flex-col justify-between overflow-y-auto shadow-[0_-12px_40px_rgba(0,0,0,0.14)]">
            <div>
              <div className="w-8 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-4" />

              <h3 className="text-[22px] text-[#181B25] tracking-tight mb-4">
                <span className="font-normal">Order</span>{' '}
                <span className="font-semibold">confirmation</span>
              </h3>

              {/* Payment Methods Accordion List */}
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected =
                    currentMethod?.id === method.id || currentMethod?.code === method.code;
                  const methodCode = String(method.code || '').toLowerCase();
                  const isMethodCod = methodCode === 'cod';
                  const subtitle = getMethodSubtitle(method);

                  // Determine which QR image to show when this method is expanded
                  const qrSourceForCod =
                    activeCodOnlineGateway?.qrImageUrl || method.qrImageUrl || '';
                  const qrLabelForCod = activeCodOnlineGateway?.name || 'eSewa';

                  return (
                    <div
                      key={method.id}
                      className={`rounded-[22px] transition-all overflow-hidden border ${
                        isSelected
                          ? 'border-[#121726] bg-[#F8F8FA] shadow-md'
                          : 'border-transparent bg-[#F8F8FA] hover:bg-[#F1F2F6]'
                      }`}
                    >
                      {/* Selectable Gateway Header */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMethodCode(method.code);
                          setFormError(null);
                        }}
                        className={`w-full p-4 flex items-center justify-between transition-all cursor-pointer text-left ${
                          isSelected ? 'bg-[#121726] text-white' : 'text-[#181B25]'
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
                              {isMethodCod ? 'Cash on Delivery' : method.name}
                            </p>
                            <p
                              className={`text-[11px] truncate mt-0.5 ${
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

                      {/* EXPANDED SECTION DIRECTLY INSIDE CHECKOUT */}
                      {isSelected && (
                        <div className="p-4 space-y-3.5 bg-[#F8F8FA] border-t border-neutral-200/70">
                          {isMethodCod ? (
                            /* FLOW B: CASH ON DELIVERY (Delivery Charge Paid Upfront) */
                            <>
                              {/* 4 Required COD Breakdown Lines */}
                              <div className="bg-white rounded-2xl p-3.5 border border-neutral-200/90 space-y-2 text-[12px]">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#6E7485] font-medium">Product total</span>
                                  <span className="font-bold text-[#181B25] tabular-nums">
                                    Rs. {subtotal.toLocaleString('en-US')}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-[#6E7485] font-medium">Delivery charge</span>
                                  <span className="font-bold text-[#181B25] tabular-nums">
                                    Rs. {shippingFee.toLocaleString('en-US')}
                                  </span>
                                </div>

                                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                                  <span className="text-[#181B25] font-bold">
                                    Amount to pay now (Delivery charge)
                                  </span>
                                  <span className="font-extrabold text-emerald-700 text-[13px] tabular-nums">
                                    Rs. {shippingFee.toLocaleString('en-US')}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-[#181B25] font-bold">
                                    Remaining amount to pay on delivery
                                  </span>
                                  <span className="font-extrabold text-[#181B25] text-[13px] tabular-nums">
                                    Rs. {subtotal.toLocaleString('en-US')}
                                  </span>
                                </div>
                              </div>

                              {/* Available Online Payment Method to Pay Delivery Charge */}
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-[#181B25]">
                                    Pay Delivery Charge (Rs. {shippingFee.toLocaleString('en-US')}) via:
                                  </span>
                                  {onlineGateways.length > 1 && (
                                    <div className="flex items-center gap-1.5">
                                      {onlineGateways.map((gw) => {
                                        const activeGw =
                                          activeCodOnlineGateway?.code === gw.code;
                                        return (
                                          <button
                                            key={gw.id}
                                            type="button"
                                            onClick={() => setCodOnlineGatewayCode(gw.code)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                                              activeGw
                                                ? 'bg-[#60BB46] text-white shadow-xs'
                                                : 'bg-white text-[#181B25] border border-neutral-200'
                                            }`}
                                          >
                                            {gw.name}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Configured Online QR for paying Delivery Charge */}
                                <ResolvedQrImage
                                  src={qrSourceForCod}
                                  label={qrLabelForCod}
                                />

                                {/* Upload Payment Screenshot */}
                                <label className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-neutral-50 text-[#181B25] font-semibold text-[11px] rounded-xl border border-neutral-200 cursor-pointer transition-colors shadow-2xs">
                                  {isUploadingScreenshot ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#181B25]" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5 text-[#181B25]" />
                                  )}
                                  <span>
                                    {isUploadingScreenshot
                                      ? `Uploading & Verifying (${screenshotProgress}%)...`
                                      : screenshotUrl
                                      ? 'Change Payment Screenshot'
                                      : 'Upload Payment Screenshot'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleScreenshotUpload}
                                  />
                                </label>

                                {/* Screenshot Preview After Upload */}
                                {screenshotUrl && (
                                  <ScreenshotPreviewThumb
                                    src={screenshotUrl}
                                    localPreview={screenshotLocalPreview}
                                    onClear={handleClearScreenshot}
                                  />
                                )}
                              </div>
                            </>
                          ) : (
                            /* FLOW A: FULL ONLINE PAYMENT (eSewa / Bank Transfer) */
                            <>
                              {/* Full Online Payment Breakdown */}
                              <div className="bg-white rounded-2xl p-3.5 border border-neutral-200/90 space-y-1.5 text-[12px]">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#6E7485] font-medium">Product total</span>
                                  <span className="font-bold text-[#181B25] tabular-nums">
                                    Rs. {subtotal.toLocaleString('en-US')}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[#6E7485] font-medium">Delivery charge</span>
                                  <span className="font-bold text-[#181B25] tabular-nums">
                                    Rs. {shippingFee.toLocaleString('en-US')}
                                  </span>
                                </div>
                                <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                                  <span className="text-[#181B25] font-bold">Amount to pay now</span>
                                  <span className="font-extrabold text-emerald-700 text-[13px] tabular-nums">
                                    Rs. {total.toLocaleString('en-US')}
                                  </span>
                                </div>
                              </div>

                              {/* Configured eSewa / Bank QR */}
                              <ResolvedQrImage
                                src={method.qrImageUrl}
                                label={method.name}
                              />

                              {/* Below QR: Upload Payment Screenshot */}
                              <label className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-neutral-50 text-[#181B25] font-semibold text-[11px] rounded-xl border border-neutral-200 cursor-pointer transition-colors shadow-2xs">
                                {isUploadingScreenshot ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#181B25]" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5 text-[#181B25]" />
                                )}
                                <span>
                                  {isUploadingScreenshot
                                    ? `Uploading & Verifying (${screenshotProgress}%)...`
                                    : screenshotUrl
                                    ? 'Change Payment Screenshot'
                                    : 'Upload Payment Screenshot'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleScreenshotUpload}
                                />
                              </label>

                              {/* Screenshot Preview After Upload */}
                              {screenshotUrl && (
                                <ScreenshotPreviewThumb
                                  src={screenshotUrl}
                                  localPreview={screenshotLocalPreview}
                                  onClear={handleClearScreenshot}
                                />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {formError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs font-semibold text-[#EF4444]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
            </div>

            {/* Bottom Submit Bar */}
            <div className="flex items-center justify-between gap-4 pt-5 mt-2 border-t border-neutral-100">
              <div>
                <span className="text-[11px] text-[#9EA3B0] font-semibold block mb-0.5">
                  {isCodSelected ? 'Amount to pay now (Delivery)' : 'Amount to pay now'}
                </span>
                <span className="text-[24px] font-extrabold text-[#181B25] tracking-tight tabular-nums leading-none">
                  Rs. {amountToPayNow.toLocaleString('en-US')}
                </span>
                {isCodSelected && (
                  <span className="text-[11px] text-[#6E7485] font-semibold block mt-1 tabular-nums">
                    Pay on delivery: Rs. {amountRemainingOnDelivery.toLocaleString('en-US')}
                  </span>
                )}
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
                  {isSubmitting ? 'Verifying...' : 'Submit'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUBMIT (Order Confirmed) */}
        {step === 'submit' && placedOrderSummary && (
          <div className="flex-1 bg-white rounded-t-[34px] pt-3 px-6 pb-7 flex flex-col justify-between overflow-y-auto shadow-[0_-12px_40px_rgba(0,0,0,0.14)]">
            <div className="my-auto py-4 text-center space-y-4">
              <div className="w-16 h-16 bg-[#121726] text-[#F5B041] rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-[22px] font-semibold text-[#181B25]">
                  Order #{placedOrderSummary.orderId}
                </h3>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  Payment Verified ✓ • Order Confirmed
                </p>
              </div>

              <div className="bg-[#F8F8FA] rounded-[22px] p-4 text-left text-xs space-y-2 border border-neutral-200/70">
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
                <div className="flex justify-between pt-2 border-t border-neutral-200/60">
                  <span className="text-[#9EA3B0]">Payment Method</span>
                  <span className="font-bold text-[#181B25]">
                    {placedOrderSummary.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9EA3B0]">Delivery Charge</span>
                  <span className="font-bold text-emerald-700">
                    Rs. {placedOrderSummary.deliveryCharge.toLocaleString('en-US')} (
                    {placedOrderSummary.deliveryChargeStatus})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9EA3B0]">Product Amount</span>
                  <span className="font-bold text-[#181B25]">
                    Rs. {placedOrderSummary.productTotal.toLocaleString('en-US')} (
                    {placedOrderSummary.productPaymentType})
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200/60">
                  <span className="text-[#181B25] font-semibold">Amount Already Paid</span>
                  <span className="font-extrabold text-emerald-700">
                    Rs. {placedOrderSummary.amountPaidNow.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#181B25] font-semibold">
                    Remaining to Pay on Delivery
                  </span>
                  <span className="font-extrabold text-[#181B25] text-sm">
                    Rs. {placedOrderSummary.amountRemainingOnDelivery.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <a
                  href={getWhatsAppLink(placedOrderSummary)}
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
