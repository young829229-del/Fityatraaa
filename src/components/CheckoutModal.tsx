import { useState, useEffect, ChangeEvent } from 'react';
import { X, CheckCircle, Copy, Upload, ArrowRight, Loader2, QrCode } from 'lucide-react';
import { CartItem, ShippingRegion, PaymentMethodSetting } from '../types';
import { saveOrderToFirestore, subscribeToPaymentSettings } from '../services/firestoreService';
import { uploadFileToStorage } from '../services/storageService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  selectedRegion: ShippingRegion;
  onClearCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  selectedRegion,
  onClearCart
}: CheckoutModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSetting[]>([]);
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>('esewa');

  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotProgress, setScreenshotProgress] = useState(0);

  const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to live payment settings from Firebase
  useEffect(() => {
    const unsub = subscribeToPaymentSettings((methods) => {
      const activeMethods = methods.filter((m) => m.enabled);
      setPaymentMethods(activeMethods);
      if (activeMethods.length > 0 && !activeMethods.some((m) => m.code === selectedMethodCode)) {
        setSelectedMethodCode(activeMethods[0].code);
      }
    });
    return () => unsub();
  }, [selectedMethodCode]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + (item.totalPrice || item.product.price * item.quantity),
    0
  );

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
  const grandTotal = subtotal + shippingFee;

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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) return;

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

    const isCod = selectedMethodCode === 'cod';

    try {
      await saveOrderToFirestore({
        id: orderId,
        customerName: fullName,
        phone,
        address,
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
        totalAmount: grandTotal,
        paymentMethod: currentMethod?.name || selectedMethodCode,
        paymentScreenshotUrl: screenshotUrl || '',
        paymentStatus: isCod ? 'pending' : screenshotUrl ? 'submitted' : 'pending',
        status: 'pending'
      });

      setOrderPlacedId(orderId);
      onClearCart();
    } catch (err) {
      console.error('Failed to submit order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (orderId: string) => {
    const text = encodeURIComponent(
      `Namaste FitYatra! I placed order #${orderId} for Rs. ${grandTotal.toLocaleString(
        'en-US'
      )}.\nName: ${fullName}\nPhone: ${phone}\nAddress: ${address}\nPayment: ${
        currentMethod?.name || selectedMethodCode
      }`
    );
    return `https://wa.me/9779705283444?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/75 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-950 text-white">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFCD00] block">
              FITYATRA CHECKOUT
            </span>
            <h3 className="font-black text-sm sm:text-base">
              {orderPlacedId ? 'Order Confirmed!' : 'Express Checkout (Nepal Direct)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderPlacedId ? (
          /* Confirmation Screen */
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-neutral-900">Order Placed Successfully!</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Your order is saved directly into Firebase and queued for priority dispatch across Nepal.
              </p>
            </div>

            <div className="bg-[#FAF9F6] border border-neutral-200 rounded-xl p-4 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-bold text-black">#{orderPlacedId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Recipient:</span>
                <span className="font-bold text-black">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Mobile Phone:</span>
                <span className="font-bold text-black">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Payable:</span>
                <span className="font-bold text-black">Rs. {grandTotal.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Channel:</span>
                <span className="font-bold text-black">
                  {currentMethod?.name || selectedMethodCode}
                </span>
              </div>
              {screenshotUrl && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Payment Proof:</span>
                  <span>Attached ✓</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={getWhatsAppLink(orderPlacedId)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Notify Dispatch on WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Customer Inputs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Suman Shrestha"
                className="w-full text-xs font-semibold py-2.5 px-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Mobile Number (Nepal 98XXXXXXXX) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX or 97XXXXXXXX"
                className="w-full text-xs font-semibold py-2.5 px-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Delivery Address & Landmark *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. New Baneshwor, Near Everest Hotel, Kathmandu"
                className="w-full text-xs font-semibold py-2.5 px-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            {/* Dynamic Payment Method Selector from Firebase */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Payment Channel (Loaded from Firebase)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethodCode === method.code;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethodCode(method.code)}
                      className={`py-2.5 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 bg-neutral-50'
                      }`}
                    >
                      {method.name.split('(')[0].trim()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic QR Code & Payment Info from Firebase */}
            {currentMethod && currentMethod.code !== 'cod' && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center space-y-3">
                <p className="text-xs font-bold text-neutral-900 uppercase tracking-tight">
                  {currentMethod.name}
                </p>

                {/* Real QR Code Uploaded by Admin */}
                {currentMethod.qrImageUrl ? (
                  <div className="flex justify-center">
                    <img
                      src={currentMethod.qrImageUrl}
                      alt="Payment QR Code"
                      referrerPolicy="no-referrer"
                      className="w-40 h-40 bg-white p-2 rounded-xl border border-neutral-300 object-contain shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto bg-neutral-200/60 rounded-xl flex items-center justify-center text-neutral-400">
                    <QrCode className="w-10 h-10 opacity-30" />
                  </div>
                )}

                {/* Account details */}
                {(currentMethod.accountName || currentMethod.accountNumber) && (
                  <div className="text-xs text-neutral-800 font-mono bg-white p-2.5 rounded-lg border border-neutral-200">
                    {currentMethod.accountName && (
                      <p className="font-semibold text-neutral-600">{currentMethod.accountName}</p>
                    )}
                    {currentMethod.accountNumber && (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="font-extrabold text-neutral-950 text-sm">
                          {currentMethod.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(currentMethod.accountNumber || '')}
                          className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5 text-[11px] cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedText ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions */}
                {currentMethod.instructions && (
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    {currentMethod.instructions}
                  </p>
                )}

                {/* Payment Screenshot Upload Button */}
                {currentMethod.requiresScreenshot && (
                  <div className="pt-2">
                    <label className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-neutral-800 bg-white border-2 border-neutral-300 hover:border-neutral-900 py-2.5 px-4 rounded-xl cursor-pointer transition-all">
                      {isUploadingScreenshot ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      ) : (
                        <Upload className="w-4 h-4 text-neutral-600" />
                      )}
                      <span>
                        {screenshotUrl
                          ? 'Receipt Attached ✓ (Click to replace)'
                          : isUploadingScreenshot
                          ? `Uploading screenshot (${screenshotProgress}%)...`
                          : '+ Upload Payment Screenshot'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleScreenshotUpload}
                      />
                    </label>

                    {screenshotUrl && (
                      <div className="mt-2 text-left flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Payment proof attached successfully</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentMethod && currentMethod.code === 'cod' && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-600 space-y-1">
                <p className="font-bold text-neutral-900">Cash on Delivery Verified</p>
                <p>
                  Pay in cash upon receiving your parcel. Our courier team provides mobile scanner on delivery.
                </p>
              </div>
            )}

            {/* Total and Submit */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-sm font-black">
              <span>Total Payable:</span>
              <span className="text-base text-neutral-900">
                Rs. {grandTotal.toLocaleString('en-US')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploadingScreenshot}
              className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span>Confirm Order — Rs. {grandTotal.toLocaleString('en-US')}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
