import { useState, useEffect, ChangeEvent } from 'react';
import { CreditCard, Box, Check, QrCode, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { PaymentMethodSetting } from '../../types';
import { uploadFileToStorage, useResolvedMediaUrl } from '../../services/storageService';
import {
  DEFAULT_PAYMENT_METHODS,
  normalizePaymentSettingsList,
  savePaymentSettingToFirestore
} from '../../services/firestoreService';

interface AdminPaymentsTabProps {
  paymentSettings?: PaymentMethodSetting[];
  paymentMethods?: PaymentMethodSetting[];
  onSaveSetting?: (setting: PaymentMethodSetting) => Promise<void>;
  onSavePaymentMethod?: (setting: PaymentMethodSetting) => Promise<void>;
  onDeleteSetting?: (id: string) => Promise<void>;
  onDeletePaymentMethod?: (id: string) => Promise<void>;
  onAddPaymentMethod?: (setting: PaymentMethodSetting) => Promise<void>;
}

interface MethodMeta {
  id: 'esewa' | 'bank' | 'cod';
  code: 'esewa' | 'bank' | 'cod';
  title: string;
  description: string;
  uploadLabel: string;
  displayOrder: number;
}

const METHOD_DEFINITIONS: MethodMeta[] = [
  {
    id: 'esewa',
    code: 'esewa',
    title: 'eSewa',
    description: 'Digital wallet payment via eSewa ID or QR.',
    uploadLabel: 'Upload eSewa QR',
    displayOrder: 1
  },
  {
    id: 'bank',
    code: 'bank',
    title: 'Bank Transfer',
    description: 'Direct bank deposit / Fonepay account transfer.',
    uploadLabel: 'Upload Bank Transfer QR',
    displayOrder: 2
  },
  {
    id: 'cod',
    code: 'cod',
    title: 'Cash on Delivery (COD)',
    description: 'Pay with physical cash upon package doorstep delivery.',
    uploadLabel: 'Upload Cash on Delivery (COD) QR',
    displayOrder: 3
  }
];

function QrPreviewThumb({ src, alt }: { src?: string; alt: string }) {
  const resolved = useResolvedMediaUrl(typeof src === 'string' ? src : '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src, resolved]);

  if (!src || !resolved || hasError) {
    return (
      <div className="flex flex-col items-center justify-center text-[#B8B8BE] select-none">
        <ImageIcon className="w-6 h-6 stroke-[1.5]" />
        <span className="text-[10px] font-medium mt-1">No QR</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className="w-full h-full object-contain p-1.5 bg-white"
    />
  );
}

export default function AdminPaymentsTab({
  paymentSettings,
  paymentMethods,
  onSaveSetting,
  onSavePaymentMethod
}: AdminPaymentsTabProps) {
  const incomingList = paymentSettings || paymentMethods || DEFAULT_PAYMENT_METHODS;
  const [localMethods, setLocalMethods] = useState<PaymentMethodSetting[]>(() =>
    normalizePaymentSettingsList(incomingList)
  );
  const [uploadingCode, setUploadingCode] = useState<string | null>(null);

  useEffect(() => {
    const source = paymentSettings || paymentMethods;
    if (Array.isArray(source) && source.length > 0) {
      setLocalMethods(normalizePaymentSettingsList(source));
    }
  }, [paymentSettings, paymentMethods]);

  const persistMethod = async (updated: PaymentMethodSetting) => {
    const saveFn = onSaveSetting || onSavePaymentMethod || savePaymentSettingToFirestore;
    try {
      await saveFn(updated);
    } catch (err) {
      console.error('Failed to save payment setting:', err);
    }
  };

  const resolvedMethods: { meta: MethodMeta; record: PaymentMethodSetting }[] =
    METHOD_DEFINITIONS.map((meta) => {
      const existing =
        localMethods.find(
          (m) => m.id === meta.id || String(m.code || '').toLowerCase() === meta.code
        ) ||
        DEFAULT_PAYMENT_METHODS.find((m) => m.id === meta.id)!;

      const record: PaymentMethodSetting = {
        ...existing,
        id: meta.id,
        code: meta.code,
        name: meta.title,
        displayOrder: meta.displayOrder,
        enabled: typeof existing.enabled === 'boolean' ? existing.enabled : true,
        qrImageUrl: typeof existing.qrImageUrl === 'string' ? existing.qrImageUrl : '',
        qrEnabled:
          typeof existing.qrEnabled === 'boolean'
            ? existing.qrEnabled
            : Boolean(existing.qrImageUrl),
        requiresScreenshot: Boolean(existing.requiresScreenshot)
      };

      return { meta, record };
    });

  const activeCount = resolvedMethods.filter((m) => m.record.enabled).length;
  const screenshotUploadEnabled = resolvedMethods.some((m) => m.record.requiresScreenshot);

  const updateLocalAndSave = async (updated: PaymentMethodSetting) => {
    setLocalMethods((prev) =>
      prev.map((m) => (m.id === updated.id || m.code === updated.code ? updated : m))
    );
    await persistMethod(updated);
  };

  const handleToggleActive = async (record: PaymentMethodSetting) => {
    const updated: PaymentMethodSetting = {
      ...record,
      enabled: !record.enabled
    };
    await updateLocalAndSave(updated);
  };

  const handleToggleQr = async (record: PaymentMethodSetting) => {
    const updated: PaymentMethodSetting = {
      ...record,
      qrEnabled: !record.qrEnabled
    };
    await updateLocalAndSave(updated);
  };

  const handleUploadQrFile = async (
    record: PaymentMethodSetting,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCode(record.code);
    try {
      const res = await uploadFileToStorage(file, `payment-qrs/${record.code}`);
      if (res.url) {
        const updated: PaymentMethodSetting = {
          ...record,
          qrImageUrl: res.url,
          qrEnabled: true
        };
        await updateLocalAndSave(updated);
      }
    } catch (err) {
      console.error('Failed to upload QR image:', err);
    } finally {
      setUploadingCode(null);
      e.target.value = '';
    }
  };

  const handleToggleScreenshotUpload = async () => {
    const nextValue = !screenshotUploadEnabled;
    const updatedAll = resolvedMethods.map(({ record }) => ({
      ...record,
      requiresScreenshot: nextValue
    }));
    setLocalMethods(updatedAll);
    for (const item of updatedAll) {
      await persistMethod(item);
    }
  };

  return (
    <div className="bg-[#FAF9F7] text-[#18181B] rounded-3xl p-5 sm:p-8 max-w-4xl mx-auto">
      {/* Top Heading */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-[#D94E5A] stroke-[2.2] shrink-0" />
          <h2 className="text-[22px] sm:text-[26px] font-black tracking-tight text-[#18181B]">
            Payment Settings
          </h2>
        </div>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          Manage checkout payment methods, separate QR codes, and customer payment verification uploads.
        </p>
      </div>

      {/* Section Subheader */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-[#52525B] stroke-[2]" />
          <span className="text-[12px] font-black uppercase tracking-wider text-[#18181B]">
            PAYMENT METHODS &amp; QR CODES
          </span>
        </div>
        <span className="text-[12px] font-mono text-[#8E8E93]">
          {activeCount} active at checkout
        </span>
      </div>

      {/* 3 Payment Method Cards */}
      <div className="space-y-4">
        {resolvedMethods.map(({ meta, record }) => {
          const isQrOn = Boolean(record.qrEnabled);
          const isUploading = uploadingCode === record.code;

          return (
            <div
              key={meta.id}
              className="bg-white border border-[#ECECEA] rounded-[24px] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            >
              {/* Top Row: Checkbox + Title/Badge/Desc + QR Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(record)}
                    className={`w-7 h-7 rounded-[9px] flex items-center justify-center mt-0.5 shrink-0 transition-all cursor-pointer ${
                      record.enabled
                        ? 'bg-[#FF3B4E] text-white shadow-[0_2px_8px_rgba(255,59,78,0.35)]'
                        : 'bg-[#F4F4F5] border border-[#D4D4D8] text-transparent'
                    }`}
                    aria-label={`Toggle ${meta.title}`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-[15px] font-extrabold text-[#18181B]">
                        {meta.title}
                      </h3>
                      {record.enabled && (
                        <span className="bg-[#DDF7EE] text-[#0E7A57] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          ACTIVE AT CHECKOUT
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#6E6E73] mt-0.5">{meta.description}</p>
                  </div>
                </div>

                {/* Right QR: OFF/ON Toggle Pill */}
                <div className="bg-[#F7F7F5] border border-[#EFEFEB] rounded-full pl-3 pr-1.5 py-1.5 flex items-center gap-2 shrink-0">
                  <QrCode className="w-3.5 h-3.5 text-[#52525B]" />
                  <span className="text-[11px] font-bold text-[#3F3F46] whitespace-nowrap">
                    QR:{' '}
                    <span className="font-semibold text-[#71717A]">
                      {isQrOn ? 'ON' : 'OFF'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleQr(record)}
                    className={`w-10 h-[22px] rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                      isQrOn ? 'bg-[#18181B] justify-end' : 'bg-[#D4D4D8] justify-start'
                    }`}
                    aria-label={`Toggle ${meta.title} QR`}
                  >
                    <span className="w-[18px] h-[18px] rounded-full bg-white shadow-xs block" />
                  </button>
                </div>
              </div>

              {/* Bottom Row: QR Box + Upload Button */}
              <div className="mt-5 flex items-center gap-4">
                <div className="w-24 h-24 rounded-[18px] bg-[#F5F5F3] border border-[#EAEAE6] flex items-center justify-center overflow-hidden shrink-0">
                  <QrPreviewThumb src={record.qrImageUrl} alt={`${meta.title} QR`} />
                </div>

                <label className="bg-[#1C1B1A] hover:bg-black text-white rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-[12px] font-bold shadow-xs cursor-pointer transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-white stroke-[2.2]" />
                  )}
                  <span>{isUploading ? 'Uploading...' : meta.uploadLabel}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadQrFile(record, e)}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Payment Screenshot Upload Card */}
      <div className="mt-5 bg-white border border-[#ECECEA] rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#18181B] stroke-[2.2]" />
            <h4 className="text-[13px] font-black uppercase tracking-wider text-[#18181B]">
              PAYMENT SCREENSHOT UPLOAD
            </h4>
          </div>
          <p className="text-[12px] text-[#6E6E73] mt-1">
            Allow customers to attach payment confirmation slips during checkout.
          </p>
        </div>

        <div className="bg-[#F7F7F5] border border-[#EFEFEB] rounded-full pl-3.5 pr-1.5 py-1.5 flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <span className="text-[11px] font-bold text-[#3F3F46] whitespace-nowrap">
            Screenshot Upload:{' '}
            <span className="font-semibold text-[#71717A]">
              {screenshotUploadEnabled ? 'ON' : 'OFF'}
            </span>
          </span>
          <button
            type="button"
            onClick={handleToggleScreenshotUpload}
            className={`w-10 h-[22px] rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
              screenshotUploadEnabled
                ? 'bg-[#18181B] justify-end'
                : 'bg-[#D4D4D8] justify-start'
            }`}
            aria-label="Toggle Screenshot Upload"
          >
            <span className="w-[18px] h-[18px] rounded-full bg-white shadow-xs block" />
          </button>
        </div>
      </div>
    </div>
  );
}
