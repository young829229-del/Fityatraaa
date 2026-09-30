import { useState, useRef, ChangeEvent } from 'react';
import {
  GripVertical,
  Upload,
  Trash2,
  Plus,
  Eye,
  Save,
  Check,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Image as ImageIcon,
  Flame,
  Star,
  Layers,
  FileText,
  Shield,
  X,
  Video,
  Loader2,
  HelpCircle,
  Truck
} from 'lucide-react';
import {
  Product,
  BundleDeal,
  ProductBenefit,
  CustomerUGCImage,
  ProductReview,
  ProductFaqItem,
  ProductOption
} from '../../types';
import {
  DEFAULT_PAGE_SECTIONS,
  DEFAULT_PRODUCT_FAQS,
  DEFAULT_SCOOP_SECTION,
  DEFAULT_LEAN_PHYSIQUE,
  DEFAULT_DELIVERY_INFO
} from '../../data/products';
import ImageUploader from './ImageUploader';
import { uploadFileToStorage, useResolvedMediaUrl } from '../../services/storageService';

function BuilderVideoPreview({ url }: { url: string }) {
  const resolved = useResolvedMediaUrl(url);
  if (!resolved) return null;
  return (
    <video
      src={resolved}
      controls
      playsInline
      className="w-48 h-28 object-cover rounded-lg bg-black"
    />
  );
}

interface ProductPageBuilderProps {
  product: Product;
  onSaveProduct: (updated: Product) => void;
  onClose: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
}

export default function ProductPageBuilder({
  product,
  onSaveProduct,
  onClose,
  onTogglePreview,
  isPreviewMode
}: ProductPageBuilderProps) {
  const [draft, setDraft] = useState<Product>(() => JSON.parse(JSON.stringify(product)));
  const [activeTab, setActiveTab] = useState<
    | 'sections'
    | 'images'
    | 'info'
    | 'bundles'
    | 'editorial'
    | 'faq'
    | 'promo'
    | 'ugc'
    | 'reviews'
    | 'description'
    | 'benefits'
  >('sections');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const sections =
    draft.pageSections && draft.pageSections.length > 0
      ? draft.pageSections
      : DEFAULT_PAGE_SECTIONS;

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    setDraft((prev) => ({ ...prev, pageSections: newSections }));
  };

  const toggleSection = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      pageSections: sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    }));
  };

  const handleVideoFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    setVideoProgress(10);
    try {
      const res = await uploadFileToStorage(file, `products/${draft.id}/videos`, (pct) => {
        setVideoProgress(pct);
      });
      if (res.url) {
        setDraft((prev) => ({ ...prev, videoUrl: res.url }));
      }
    } catch (err) {
      console.error('Video upload error:', err);
    } finally {
      setIsUploadingVideo(false);
      setVideoProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Options operations (Flavor, Size / Pack Variant, etc.)
  const optionsList: ProductOption[] =
    draft.options && draft.options.length > 0
      ? draft.options
      : [
          { name: 'Flavor', values: draft.variants || ['Unflavoured'] },
          { name: 'Size / Variant', values: ['100g (33 Servings)', '250g (83 Servings)'] }
        ];

  const updateOptionGroup = (index: number, updatedOption: ProductOption) => {
    const next = [...optionsList];
    next[index] = updatedOption;
    setDraft((prev) => ({
      ...prev,
      options: next,
      variants: next[0]?.values || prev.variants
    }));
  };

  const addOptionGroup = () => {
    setDraft((prev) => ({
      ...prev,
      options: [...optionsList, { name: 'Pack Size', values: ['Standard Pack'] }]
    }));
  };

  const removeOptionGroup = (index: number) => {
    const next = optionsList.filter((_, i) => i !== index);
    setDraft((prev) => ({
      ...prev,
      options: next
    }));
  };

  // Bundle operations
  const addBundle = () => {
    const qty = (draft.bundles?.length || 0) + 1;
    const sellPrice = Math.round(draft.price * qty * 0.9);
    const origPrice = draft.originalPrice * qty;
    const newBundle: BundleDeal = {
      id: `bundle-${Date.now()}`,
      title: `Buy ${qty}`,
      quantity: qty,
      price: sellPrice,
      originalPrice: origPrice,
      savingsAmount: origPrice - sellPrice,
      savingsPercentage: origPrice > 0 ? Math.round(((origPrice - sellPrice) / origPrice) * 100) : 0,
      badgeText: '',
      isPopular: false,
      isDefault: false,
      enabled: true
    };

    setDraft((prev) => ({
      ...prev,
      bundles: [...(prev.bundles || []), newBundle]
    }));
  };

  const updateBundle = (id: string, updates: Partial<BundleDeal>) => {
    setDraft((prev) => ({
      ...prev,
      bundles: (prev.bundles || []).map((b) => (b.id === id ? { ...b, ...updates } : b))
    }));
  };

  const removeBundle = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      bundles: (prev.bundles || []).filter((b) => b.id !== id)
    }));
  };

  // FAQ operations
  const faqsList: ProductFaqItem[] =
    draft.faqs && draft.faqs.length > 0 ? draft.faqs : DEFAULT_PRODUCT_FAQS;

  const addFaq = () => {
    const newFaq: ProductFaqItem = {
      id: `faq-${Date.now()}`,
      question: 'New Question?',
      answer: 'Provide clear, helpful details for your customers here.',
      enabled: true
    };
    setDraft((prev) => ({
      ...prev,
      faqs: [...faqsList, newFaq]
    }));
  };

  const updateFaq = (id: string, updates: Partial<ProductFaqItem>) => {
    setDraft((prev) => ({
      ...prev,
      faqs: faqsList.map((f) => (f.id === id ? { ...f, ...updates } : f))
    }));
  };

  const removeFaq = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      faqs: faqsList.filter((f) => f.id !== id)
    }));
  };

  // Benefits operations
  const addBenefit = () => {
    const newBen: ProductBenefit = {
      id: `ben-${Date.now()}`,
      icon: '💪',
      title: '1–2 extra reps per set',
      description: 'Explain the physiological gain and clinical proof here.',
      enabled: true
    };
    setDraft((prev) => ({
      ...prev,
      benefits: [...(prev.benefits || []), newBen]
    }));
  };

  const updateBenefit = (id: string, updates: Partial<ProductBenefit>) => {
    setDraft((prev) => ({
      ...prev,
      benefits: (prev.benefits || []).map((ben) => (ben.id === id ? { ...ben, ...updates } : ben))
    }));
  };

  const removeBenefit = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      benefits: (prev.benefits || []).filter((ben) => ben.id !== id)
    }));
  };

  // Reviews operations
  const addReview = () => {
    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      name: 'Verified Athlete',
      location: 'Kathmandu',
      rating: 5,
      comment: 'Excellent results! Authentic sealed package.',
      date: 'Verified Buyer',
      verified: true
    };
    setDraft((prev) => ({
      ...prev,
      testimonials: [...(prev.testimonials || []), newReview]
    }));
  };

  const updateReview = (id: string, updates: Partial<ProductReview>) => {
    setDraft((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).map((rev) =>
        rev.id === id ? { ...rev, ...updates } : rev
      )
    }));
  };

  const removeReview = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((rev) => rev.id !== id)
    }));
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSaveProduct({ ...draft, pageSections: sections });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error('Failed to save Product Page Builder changes:', err);
      let msg = err?.message || 'Failed to save changes. Please try again.';
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error) msg = `Failed to save changes: ${parsed.error}`;
      } catch {}
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const scoopConfig = draft.scoopSection || DEFAULT_SCOOP_SECTION;
  const leanPhysiqueConfig = draft.leanPhysiqueSection || DEFAULT_LEAN_PHYSIQUE;
  const deliveryConfig = draft.deliveryInfo || DEFAULT_DELIVERY_INFO;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-neutral-300 overflow-hidden rounded-2xl">
        {/* Top Header Bar */}
        <div className="bg-neutral-950 text-white px-4 py-3 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFCD00] bg-neutral-900 px-2 py-0.5 border border-neutral-800 rounded">
              PRODUCT PAGE BUILDER
            </span>
            <h2 className="text-sm sm:text-base font-black tracking-tight truncate max-w-[220px] sm:max-w-md">
              {draft.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await handleSave();
                onTogglePreview();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#FFCD00]" />
              <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black rounded-lg transition-all cursor-pointer disabled:opacity-60 ${
                saveSuccess ? 'bg-emerald-400' : 'bg-[#FFCD00] hover:bg-amber-400'
              }`}
            >
              {saveSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved to Firebase!' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close builder"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
            <span>{saveError}</span>
            <button
              type="button"
              onClick={() => setSaveError(null)}
              className="underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Builder Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-200 bg-neutral-100 overflow-x-auto text-xs font-bold uppercase tracking-wider text-neutral-600 no-scrollbar">
          {[
            { id: 'sections', label: '☰ Sections Order', icon: Layers },
            { id: 'images', label: '📸 Gallery & Video', icon: ImageIcon },
            { id: 'info', label: 'Title, Price, Stock & Options', icon: FileText },
            { id: 'editorial', label: 'Scoop & Lean Physique', icon: Sparkles },
            { id: 'faq', label: 'FAQs Accordion', icon: HelpCircle },
            { id: 'promo', label: 'Free Delivery Banner', icon: Truck },
            { id: 'bundles', label: '⚡ Bundles', icon: Flame },
            { id: 'benefits', label: '💪 Benefits', icon: Shield },
            { id: 'description', label: 'Rich Description', icon: FileText },
            { id: 'ugc', label: '👥 UGC Photos', icon: Sparkles },
            { id: 'reviews', label: '⭐ Testimonials', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-3 shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-neutral-950 bg-white text-neutral-950 font-black'
                    : 'border-transparent hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {/* TAB 1: SECTIONS REORDERING */}
          {activeTab === 'sections' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Product Page Content Manager:</strong> Use the up/down arrows to reorder sections on the live product page or toggle visibility on/off. Changes persist directly in Firebase.
                </p>
              </div>

              <div className="space-y-2">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      sec.enabled
                        ? 'bg-neutral-50 border-neutral-300'
                        : 'bg-neutral-100/50 border-neutral-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-neutral-400 w-5 text-right">
                        {idx + 1}
                      </span>
                      <span className="text-neutral-500 font-mono text-sm">☰</span>
                      <span className="text-sm font-bold text-neutral-900">{sec.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSection(sec.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border cursor-pointer ${
                          sec.enabled
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-neutral-200 text-neutral-600 border-neutral-300'
                        }`}
                      >
                        {sec.enabled ? 'Enabled' : 'Hidden'}
                      </button>

                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT IMAGE & VIDEO MANAGER (DIRECT UPLOAD ONLY) */}
          {activeTab === 'images' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <ImageUploader
                label="Product Gallery Photos (Direct Upload — Reorder, Replace, or Set Primary)"
                folder={`products/${draft.id}/gallery`}
                images={
                  draft.gallery && draft.gallery.length > 0
                    ? draft.gallery
                    : [draft.image].filter(Boolean)
                }
                onChange={(newImages) => {
                  setDraft((prev) => ({
                    ...prev,
                    image: newImages[0] || '',
                    gallery: newImages
                  }));
                }}
                multiple={true}
                maxFiles={20}
                helperText="Upload multiple product photos directly from your device. Drag or use arrows to reorder, click Set Primary for cover image, or delete."
              />

              <div className="pt-5 border-t border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-neutral-600" />
                      <span>Product Video (Direct Upload)</span>
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Upload an MP4/WebM product video directly from your device.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoFileUpload}
                    accept="video/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploadingVideo}
                    className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    {isUploadingVideo ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFCD00]" />
                    ) : (
                      <Upload className="w-4 h-4 text-[#FFCD00]" />
                    )}
                    <span>
                      {isUploadingVideo
                        ? `Uploading (${videoProgress}%)...`
                        : draft.videoUrl
                        ? 'Replace Video'
                        : '+ Upload Video'}
                    </span>
                  </button>
                </div>

                {draft.videoUrl && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-4">
                    <BuilderVideoPreview url={draft.videoUrl} />
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, videoUrl: '' }))}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Video</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TITLE, PRICE, STOCK, DELIVERY & OPTIONS */}
          {activeTab === 'info' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                  Product Title (H1)
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Build Muscles and Get Stronger with Wellcore-Creatine"
                  className="w-full text-sm font-bold p-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                  Subtitle / Hook
                </label>
                <input
                  type="text"
                  value={draft.tagline || ''}
                  onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                  placeholder="Recover faster. Lift heavier. Feel it in week 1."
                  className="w-full text-sm p-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                    Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={draft.price}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const orig = draft.originalPrice || p;
                      const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                      setDraft({ ...draft, price: p, discountPercentage: disc });
                    }}
                    className="w-full text-xs font-black p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                    Original Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={draft.originalPrice}
                    onChange={(e) => {
                      const orig = Number(e.target.value);
                      const p = draft.price;
                      const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                      setDraft({ ...draft, originalPrice: orig, discountPercentage: disc });
                    }}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                    Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={draft.stock ?? 45}
                    onChange={(e) => {
                      const st = Number(e.target.value);
                      setDraft({ ...draft, stock: st, isSoldOut: st <= 0 });
                    }}
                    className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.isSoldOut || (typeof draft.stock === 'number' && draft.stock <= 0))}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          isSoldOut: e.target.checked,
                          stock: e.target.checked ? 0 : Math.max(1, draft.stock || 25)
                        })
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold uppercase text-red-700">Sold Out</span>
                  </label>
                </div>
              </div>

              {/* Product Options (Flavor, Size / Variant, etc.) */}
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Product Options (Flavor &amp; Variant Selectors)
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Configure Flavor selector, Size/Pack variant selector, or custom option groups.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addOptionGroup}
                    className="px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-bold uppercase rounded cursor-pointer"
                  >
                    + Add Option Group
                  </button>
                </div>

                {optionsList.map((opt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) =>
                          updateOptionGroup(idx, { ...opt, name: e.target.value })
                        }
                        placeholder="Option Name (e.g. Flavor or Pack Size)"
                        className="text-xs font-bold p-2 bg-white border border-neutral-300 rounded w-48"
                      />
                      {optionsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOptionGroup(idx)}
                          className="text-neutral-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={opt.values.join(', ')}
                      onChange={(e) => {
                        const vals = e.target.value
                          .split(',')
                          .map((v) => v.trim())
                          .filter(Boolean);
                        updateOptionGroup(idx, { ...opt, values: vals });
                      }}
                      placeholder="Comma separated values (e.g. Unflavoured, Fruit Fusion, Lemon Lime)"
                      className="w-full text-xs p-2 bg-white border border-neutral-300 rounded"
                    />
                  </div>
                ))}
              </div>

              {/* Delivery Estimation Area */}
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Delivery Estimation Area
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                      Free Delivery Text
                    </label>
                    <input
                      type="text"
                      value={deliveryConfig.freeDeliveryText}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          deliveryInfo: { ...deliveryConfig, freeDeliveryText: e.target.value }
                        })
                      }
                      className="w-full text-xs p-2 bg-neutral-50 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                      Estimated Window
                    </label>
                    <input
                      type="text"
                      value={deliveryConfig.estimatedWindow}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          deliveryInfo: { ...deliveryConfig, estimatedWindow: e.target.value }
                        })
                      }
                      className="w-full text-xs p-2 bg-neutral-50 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                      COD &amp; Payment Note
                    </label>
                    <input
                      type="text"
                      value={deliveryConfig.codAvailableText}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          deliveryInfo: { ...deliveryConfig, codAvailableText: e.target.value }
                        })
                      }
                      className="w-full text-xs p-2 bg-neutral-50 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                      Return &amp; Authenticity Policy
                    </label>
                    <input
                      type="text"
                      value={deliveryConfig.returnPolicyText}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          deliveryInfo: { ...deliveryConfig, returnPolicyText: e.target.value }
                        })
                      }
                      className="w-full text-xs p-2 bg-neutral-50 border border-neutral-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EDITORIAL SECTIONS (IN EVERY SCOOP & BUILD LEAN PHYSIQUE) */}
          {activeTab === 'editorial' && (
            <div className="max-w-2xl mx-auto space-y-8">
              {/* In Every Scoop Section */}
              <div className="space-y-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                  1. &ldquo;In Every Scoop&rdquo; Editorial Section
                </h3>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={scoopConfig.heading}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        scoopSection: { ...scoopConfig, heading: e.target.value }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    Supporting Copy
                  </label>
                  <textarea
                    rows={3}
                    value={scoopConfig.description}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        scoopSection: { ...scoopConfig, description: e.target.value }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={scoopConfig.ctaText}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        scoopSection: { ...scoopConfig, ctaText: e.target.value }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg"
                  />
                </div>
                <ImageUploader
                  label="In Every Scoop Editorial Photos"
                  folder={`products/${draft.id}/scoop`}
                  images={scoopConfig.images || []}
                  onChange={(imgs) =>
                    setDraft({
                      ...draft,
                      scoopSection: {
                        ...scoopConfig,
                        images: imgs
                      }
                    })
                  }
                  multiple={true}
                  maxFiles={4}
                />
              </div>

              {/* Build Lean Physique Section */}
              <div className="space-y-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                  2. &ldquo;Build Lean Physique&rdquo; Promotional Section
                </h3>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={leanPhysiqueConfig.heading}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        leanPhysiqueSection: { ...leanPhysiqueConfig, heading: e.target.value }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    Supporting Text
                  </label>
                  <input
                    type="text"
                    value={leanPhysiqueConfig.subtitle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        leanPhysiqueSection: { ...leanPhysiqueConfig, subtitle: e.target.value }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    Benefit Labels (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={(leanPhysiqueConfig.badges || []).join(', ')}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        leanPhysiqueSection: {
                          ...leanPhysiqueConfig,
                          badges: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                        }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg"
                  />
                </div>
                <ImageUploader
                  label="Build Lean Physique Showcase Image"
                  folder={`products/${draft.id}/physique`}
                  images={leanPhysiqueConfig.image ? [leanPhysiqueConfig.image] : []}
                  onChange={(imgs) =>
                    setDraft({
                      ...draft,
                      leanPhysiqueSection: { ...leanPhysiqueConfig, image: imgs[0] || '' }
                    })
                  }
                  multiple={false}
                  maxFiles={1}
                />
              </div>
            </div>
          )}

          {/* TAB 5: FAQ ACCORDION */}
          {activeTab === 'faq' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-neutral-900 uppercase">
                    Product FAQ Accordion
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Manage expandable FAQ questions and answers for this product.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFaq}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FFCD00]" />
                  <span>+ Add Question</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    FAQ Heading
                  </label>
                  <input
                    type="text"
                    value={draft.faqHeading || 'FAQs'}
                    onChange={(e) => setDraft({ ...draft, faqHeading: e.target.value })}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    FAQ Subheading
                  </label>
                  <input
                    type="text"
                    value={
                      draft.faqSubheading ||
                      'Everything you need to know about our products and services'
                    }
                    onChange={(e) => setDraft({ ...draft, faqSubheading: e.target.value })}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {faqsList.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 border border-neutral-300 rounded-xl bg-neutral-50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(faq.id, { question: e.target.value })}
                        className="flex-1 text-xs font-bold p-2 bg-white border border-neutral-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeFaq(faq.id)}
                        className="text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => updateFaq(faq.id, { answer: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-neutral-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BUNDLES (BUY MORE, SAVE MORE) */}
          {activeTab === 'bundles' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-neutral-900 uppercase">
                    Buy More, Save More (Quantity Deals)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Create any quantity bundle with custom pricing, badges, default selection, and bundle photo upload.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addBundle}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FFCD00]" />
                  <span>+ Add Bundle</span>
                </button>
              </div>

              <div className="space-y-4">
                {(draft.bundles || []).map((bundle, idx) => (
                  <div
                    key={bundle.id}
                    className="p-4 border border-neutral-300 rounded-xl bg-neutral-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-neutral-900">
                        Bundle #{idx + 1}: {bundle.title} ({bundle.quantity} Units)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBundle(bundle.id)}
                        className="text-neutral-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={bundle.title}
                          onChange={(e) => updateBundle(bundle.id, { title: e.target.value })}
                          className="w-full text-xs p-2 bg-white border border-neutral-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                          Units Qty
                        </label>
                        <input
                          type="number"
                          value={bundle.quantity}
                          onChange={(e) =>
                            updateBundle(bundle.id, { quantity: Number(e.target.value) })
                          }
                          className="w-full text-xs p-2 bg-white border border-neutral-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                          Selling Price (Rs)
                        </label>
                        <input
                          type="number"
                          value={bundle.price}
                          onChange={(e) => {
                            const sell = Number(e.target.value);
                            const orig = bundle.originalPrice || sell;
                            updateBundle(bundle.id, {
                              price: sell,
                              savingsAmount: Math.max(0, orig - sell),
                              savingsPercentage:
                                orig > sell ? Math.round(((orig - sell) / orig) * 100) : 0
                            });
                          }}
                          className="w-full text-xs p-2 bg-white border border-neutral-300 rounded font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                          Original Price (Rs)
                        </label>
                        <input
                          type="number"
                          value={bundle.originalPrice}
                          onChange={(e) => {
                            const orig = Number(e.target.value);
                            const sell = bundle.price;
                            updateBundle(bundle.id, {
                              originalPrice: orig,
                              savingsAmount: Math.max(0, orig - sell),
                              savingsPercentage:
                                orig > sell ? Math.round(((orig - sell) / orig) * 100) : 0
                            });
                          }}
                          className="w-full text-xs p-2 bg-white border border-neutral-300 rounded text-neutral-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={bundle.badgeText || ''}
                          placeholder="e.g. MOST POPULAR"
                          onChange={(e) => updateBundle(bundle.id, { badgeText: e.target.value })}
                          className="w-full text-xs p-2 bg-white border border-neutral-300 rounded"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id={`pop-${bundle.id}`}
                          checked={bundle.isPopular || false}
                          onChange={(e) => updateBundle(bundle.id, { isPopular: e.target.checked })}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor={`pop-${bundle.id}`} className="text-xs font-semibold cursor-pointer">
                          Most Popular
                        </label>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id={`def-${bundle.id}`}
                          checked={bundle.isDefault || false}
                          onChange={(e) => updateBundle(bundle.id, { isDefault: e.target.checked })}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor={`def-${bundle.id}`} className="text-xs font-semibold cursor-pointer">
                          Default Selected
                        </label>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id={`en-${bundle.id}`}
                          checked={bundle.enabled ?? true}
                          onChange={(e) => updateBundle(bundle.id, { enabled: e.target.checked })}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor={`en-${bundle.id}`} className="text-xs font-semibold cursor-pointer">
                          Enabled
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200">
                      <ImageUploader
                        label="Optional Bundle Image"
                        folder={`products/${draft.id}/bundles`}
                        images={bundle.image ? [bundle.image] : []}
                        onChange={(imgs) => updateBundle(bundle.id, { image: imgs[0] || '' })}
                        multiple={false}
                        maxFiles={1}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CUSTOMER UGC IMAGES */}
          {activeTab === 'ugc' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <ImageUploader
                label="Upload Customer & Athlete UGC Photos"
                folder={`ugc/${draft.id}`}
                images={(draft.customerGallery || []).map((item) => item.url)}
                onChange={(urls) => {
                  const nextGallery: CustomerUGCImage[] = urls.map((url, idx) => {
                    const existing = (draft.customerGallery || []).find((u) => u.url === url);
                    return (
                      existing || {
                        id: `ugc-${Date.now()}-${idx}`,
                        url,
                        customerName: 'Verified Athlete',
                        caption: 'Authentic result with FitYatra',
                        enabled: true
                      }
                    );
                  });
                  setDraft((prev) => ({ ...prev, customerGallery: nextGallery }));
                }}
                multiple={true}
                maxFiles={12}
                aspectRatio="tall"
              />
            </div>
          )}

          {/* TAB 8: TESTIMONIALS */}
          {activeTab === 'reviews' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-neutral-900 uppercase">
                    Customer Review Carousel Items
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Add, edit, reorder, verify, and publish product reviews with direct photo uploads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addReview}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FFCD00]" />
                  <span>+ Add Review</span>
                </button>
              </div>

              <div className="space-y-3">
                {(draft.testimonials || []).map((rev, idx) => (
                  <div
                    key={rev.id}
                    className="p-4 border border-neutral-300 rounded-xl bg-neutral-50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const list = [...(draft.testimonials || [])];
                              const [moved] = list.splice(idx, 1);
                              list.splice(idx - 1, 0, moved);
                              setDraft((prev) => ({ ...prev, testimonials: list }));
                            }}
                            className="p-1 bg-white border border-neutral-300 rounded disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (draft.testimonials || []).length - 1}
                            onClick={() => {
                              const list = [...(draft.testimonials || [])];
                              const [moved] = list.splice(idx, 1);
                              list.splice(idx + 1, 0, moved);
                              setDraft((prev) => ({ ...prev, testimonials: list }));
                            }}
                            className="p-1 bg-white border border-neutral-300 rounded disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={rev.name}
                          onChange={(e) => updateReview(rev.id, { name: e.target.value })}
                          placeholder="Reviewer Name"
                          className="text-xs font-bold p-1.5 bg-white border border-neutral-300 rounded w-36"
                        />
                        <input
                          type="text"
                          value={rev.location || ''}
                          onChange={(e) => updateReview(rev.id, { location: e.target.value })}
                          placeholder="City (e.g. Kathmandu)"
                          className="text-xs p-1.5 bg-white border border-neutral-300 rounded w-28"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={rev.rating || 5}
                          onChange={(e) =>
                            updateReview(rev.id, { rating: Number(e.target.value) })
                          }
                          className="text-xs font-bold p-1.5 bg-white border border-neutral-300 rounded"
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>
                              {r}★
                            </option>
                          ))}
                        </select>

                        <label className="flex items-center gap-1 text-xs font-semibold bg-white px-2 py-1.5 border border-neutral-300 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rev.verified ?? true}
                            onChange={(e) =>
                              updateReview(rev.id, { verified: e.target.checked })
                            }
                            className="w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Verified</span>
                        </label>

                        <select
                          value={rev.status || 'approved'}
                          onChange={(e) =>
                            updateReview(rev.id, {
                              status: e.target.value as 'approved' | 'pending' | 'rejected'
                            })
                          }
                          className="text-xs font-bold p-1.5 bg-white border border-neutral-300 rounded"
                        >
                          <option value="approved">Published</option>
                          <option value="rejected">Hidden</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => removeReview(rev.id)}
                          className="text-neutral-400 hover:text-red-600 cursor-pointer p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={rev.comment}
                      onChange={(e) => updateReview(rev.id, { comment: e.target.value })}
                      rows={2}
                      placeholder="Review text..."
                      className="w-full text-xs p-2 bg-white border border-neutral-300 rounded"
                    />

                    <ImageUploader
                      label="Reviewer Photo (Direct File Upload)"
                      folder={`reviews/${rev.id}`}
                      images={rev.image ? [rev.image] : []}
                      onChange={(imgs) => updateReview(rev.id, { image: imgs[0] || '' })}
                      multiple={false}
                      maxFiles={1}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: RICH PRODUCT DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900 uppercase">
                  Rich Product Description
                </h3>
                <p className="text-xs text-neutral-500 mb-2">
                  Edit the scientific breakdown, ingredients, and usage details.
                </p>
                <textarea
                  value={draft.descriptionHtml || draft.description}
                  onChange={(e) => setDraft({ ...draft, descriptionHtml: e.target.value })}
                  rows={10}
                  className="w-full text-xs font-mono p-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>
          )}

          {/* TAB 10: BENEFITS */}
          {activeTab === 'benefits' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-neutral-900 uppercase">
                    Benefits Grid
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Define physiological benefit cards with custom icon upload or symbol.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addBenefit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FFCD00]" />
                  <span>+ Add Benefit</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={draft.benefitsHeading || ''}
                  onChange={(e) => setDraft({ ...draft, benefitsHeading: e.target.value })}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="space-y-3">
                {(draft.benefits || []).map((ben) => (
                  <div
                    key={ben.id}
                    className="p-4 border border-neutral-300 rounded-xl bg-neutral-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={
                            ben.icon.startsWith('http') || ben.icon.startsWith('data:')
                              ? '🖼️'
                              : ben.icon
                          }
                          onChange={(e) => updateBenefit(ben.id, { icon: e.target.value })}
                          className="w-10 text-center text-sm p-1.5 bg-white border border-neutral-300 rounded"
                          title="Emoji symbol"
                        />
                        <input
                          type="text"
                          value={ben.title}
                          onChange={(e) => updateBenefit(ben.id, { title: e.target.value })}
                          className="text-xs font-bold p-1.5 bg-white border border-neutral-300 rounded w-48 sm:w-64"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={ben.enabled}
                          onChange={(e) => updateBenefit(ben.id, { enabled: e.target.checked })}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => removeBenefit(ben.id)}
                          className="text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={ben.description}
                      onChange={(e) => updateBenefit(ben.id, { description: e.target.value })}
                      rows={2}
                      className="w-full text-xs p-2 bg-white border border-neutral-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: PROMOTIONAL BANNER */}
          {activeTab === 'promo' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900 uppercase">
                  Promotional Banner (&ldquo;Limited Time FREE DELIVERY&rdquo;)
                </h3>
                <p className="text-xs text-neutral-500 mb-3">
                  Configure the promotional banner displayed immediately below the main product section.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    Eyebrow Badge
                  </label>
                  <input
                    type="text"
                    value={draft.promotionalBanner?.eyebrow || 'Limited Time'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        promotionalBanner: {
                          ...(draft.promotionalBanner || {
                            enabled: true,
                            image: '',
                            heading: 'FREE DELIVERY',
                            description: 'On Wellcore Creatine!',
                            buttonText: 'Claim Free Delivery',
                            buttonLink: '#top'
                          }),
                          eyebrow: e.target.value
                        }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    Main Heading
                  </label>
                  <input
                    type="text"
                    value={draft.promotionalBanner?.heading || 'FREE DELIVERY'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        promotionalBanner: {
                          ...(draft.promotionalBanner || {
                            enabled: true,
                            image: '',
                            eyebrow: 'Limited Time',
                            description: 'On Wellcore Creatine!',
                            buttonText: 'Claim Free Delivery',
                            buttonLink: '#top'
                          }),
                          heading: e.target.value
                        }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                    Subheading / Description
                  </label>
                  <input
                    type="text"
                    value={draft.promotionalBanner?.description || 'On Wellcore Creatine!'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        promotionalBanner: {
                          ...(draft.promotionalBanner || {
                            enabled: true,
                            image: '',
                            eyebrow: 'Limited Time',
                            heading: 'FREE DELIVERY',
                            buttonText: 'Claim Free Delivery',
                            buttonLink: '#top'
                          }),
                          description: e.target.value
                        }
                      })
                    }
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <ImageUploader
                label="Upload Promotional Banner Photo"
                folder={`banners/${draft.id}`}
                images={draft.promotionalBanner?.image ? [draft.promotionalBanner.image] : []}
                onChange={(imgs) =>
                  setDraft({
                    ...draft,
                    promotionalBanner: {
                      ...(draft.promotionalBanner || {
                        enabled: true,
                        eyebrow: 'Limited Time',
                        heading: 'FREE DELIVERY',
                        description: 'On Wellcore Creatine!',
                        buttonText: 'Claim Free Delivery',
                        buttonLink: '#top'
                      }),
                      image: imgs[0] || ''
                    }
                  })
                }
                multiple={false}
                maxFiles={1}
                aspectRatio="wide"
              />
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-neutral-100 px-4 py-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>All changes save directly to Firebase Firestore &amp; Storage.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-neutral-700 hover:text-black font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-60 text-white font-bold uppercase tracking-wider rounded-lg cursor-pointer"
            >
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved to Firebase!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
