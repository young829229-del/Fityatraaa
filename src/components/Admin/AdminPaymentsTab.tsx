import { useState, useEffect } from 'react';
import { CreditCard, QrCode, Plus, Save, Trash2, Check, AlertCircle } from 'lucide-react';
import { PaymentMethodSetting } from '../../types';
import ImageUploader from './ImageUploader';

interface AdminPaymentsTabProps {
  paymentSettings: PaymentMethodSetting[];
  onSaveSetting: (setting: PaymentMethodSetting) => Promise<void>;
  onDeleteSetting: (id: string) => Promise<void>;
}

export default function AdminPaymentsTab({
  paymentSettings = [],
  onSaveSetting,
  onDeleteSetting
}: AdminPaymentsTabProps) {
  const [editingSettings, setEditingSettings] = useState<PaymentMethodSetting[]>(paymentSettings);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setEditingSettings(paymentSettings);
  }, [paymentSettings]);

  const handleUpdateField = (id: string, field: keyof PaymentMethodSetting, value: any) => {
    setEditingSettings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveItem = async (setting: PaymentMethodSetting) => {
    setSavingId(setting.id);
    setSaveError(null);
    try {
      await onSaveSetting(setting);
      setSavedSuccessId(setting.id);
      setTimeout(() => setSavedSuccessId((curr) => (curr === setting.id ? null : curr)), 2500);
    } catch (err: any) {
      console.error('Failed to save payment setting to Firebase:', err);
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const handleAddNewMethod = () => {
    const newMethod: PaymentMethodSetting = {
      id: `method-${Date.now()}`,
      code: `custom-${Date.now()}`,
      name: 'Khalti / Fonepay Direct',
      enabled: true,
      accountName: 'FitYatra Supplement Nepal',
      accountNumber: '9800000000',
      qrImageUrl: '',
      instructions: 'Scan the payment QR code and upload screenshot during checkout.',
      displayOrder: editingSettings.length + 1,
      requiresScreenshot: true
    };
    setEditingSettings([...editingSettings, newMethod]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Payment & QRs
        </h2>

        <button
          type="button"
          onClick={handleAddNewMethod}
          className="bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#FFCD00]" />
          <span>+ Add Payment Method</span>
        </button>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Payment Methods Cards Grid */}
      <div className="space-y-4">
        {editingSettings.map((method) => {
          const isSaved = savedSuccessId === method.id;
          const isSavingThis = savingId === method.id;

          return (
            <div
              key={method.id}
              className={`p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                method.enabled ? 'border-neutral-200/90' : 'border-neutral-200 opacity-60 bg-neutral-50'
              }`}
            >
              {/* Header with Switch */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-800">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-neutral-900">{method.name}</h3>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      Code: {method.code} • Order #{method.displayOrder}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase text-neutral-600">
                    {method.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateField(method.id, 'enabled', !method.enabled)}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      method.enabled ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        method.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left: Account details & Instructions */}
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Payment Method Name
                    </label>
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) => handleUpdateField(method.id, 'name', e.target.value)}
                      className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  {method.code !== 'cod' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Account / Receiver Name
                        </label>
                        <input
                          type="text"
                          value={method.accountName || ''}
                          onChange={(e) => handleUpdateField(method.id, 'accountName', e.target.value)}
                          placeholder="e.g. FitYatra Nutrition Nepal"
                          className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Account / Mobile Number
                        </label>
                        <input
                          type="text"
                          value={method.accountNumber || ''}
                          onChange={(e) =>
                            handleUpdateField(method.id, 'accountNumber', e.target.value)
                          }
                          placeholder="e.g. 9800000000 or Account No."
                          className="w-full text-xs font-mono p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Payment Instructions shown at Checkout
                    </label>
                    <textarea
                      value={method.instructions || ''}
                      onChange={(e) => handleUpdateField(method.id, 'instructions', e.target.value)}
                      rows={2}
                      placeholder="Instructions for customer payment & screenshot upload..."
                      className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`req-scr-${method.id}`}
                      checked={method.requiresScreenshot ?? false}
                      onChange={(e) =>
                        handleUpdateField(method.id, 'requiresScreenshot', e.target.checked)
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor={`req-scr-${method.id}`}
                      className="text-xs font-semibold text-neutral-800 cursor-pointer"
                    >
                      Require customer payment screenshot upload at checkout
                    </label>
                  </div>
                </div>

                {/* Right: Direct File Upload QR Code */}
                <div className="md:col-span-5 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-neutral-600" />
                      <span>Payment QR Code</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">Direct File Upload</span>
                  </div>

                  {method.code === 'cod' ? (
                    <div className="p-6 text-center text-xs text-neutral-400 italic">
                      Cash on Delivery does not require a QR code image.
                    </div>
                  ) : (
                    <ImageUploader
                      label=""
                      folder="payments"
                      images={method.qrImageUrl ? [method.qrImageUrl] : []}
                      onChange={(newImgs) => {
                        handleUpdateField(method.id, 'qrImageUrl', newImgs[0] || '');
                      }}
                      multiple={false}
                      maxFiles={1}
                      aspectRatio="square"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-4 mt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  {method.id.startsWith('method-') && (
                    <button
                      type="button"
                      onClick={() => onDeleteSetting(method.id)}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveItem(method)}
                    className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isSaved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Published!' : 'Save Method'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
