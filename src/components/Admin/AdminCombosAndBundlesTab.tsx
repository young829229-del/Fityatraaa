import { useState, useMemo } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Check,
  X,
  Search,
  Filter,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Calculator,
  AlertCircle,
  HelpCircle,
  Copy
} from 'lucide-react';
import { Product, BundleConfig, BundleType, BundlePlacementType, BundleItemConfig, BundleTierConfig } from '../../types';
import ImageUploader from './ImageUploader';
import { useResolvedMediaUrl } from '../../services/storageService';

function ThumbnailImg({ src, alt, className = 'w-10 h-10' }: { src?: string; alt: string; className?: string }) {
  const resolved = useResolvedMediaUrl(src || '');
  if (!src) {
    return <div className={`${className} bg-neutral-100 flex items-center justify-center text-neutral-400`}><Package className="w-4 h-4" /></div>;
  }
  return <img src={resolved || src} alt={alt} className={`${className} object-contain bg-white border border-neutral-200`} />;
}

interface AdminCombosAndBundlesTabProps {
  bundles: BundleConfig[];
  products: Product[];
  onSaveBundle: (bundle: BundleConfig) => Promise<BundleConfig>;
  onDeleteBundle: (id: string) => Promise<void>;
}

const BUNDLE_TYPES: { id: BundleType; label: string; desc: string; icon: string }[] = [
  {
    id: 'buy_more_save_more',
    label: 'Buy More, Save More',
    desc: 'Tiered volume pricing (Single, Duo, Trio) with separate variant dropdowns for each unit.',
    icon: '🔥'
  },
  {
    id: 'product_combo',
    label: 'Product Combo',
    desc: 'Combine 2 or more complementary products (e.g., Creatine + Whey Protein) connected with "+".',
    icon: '⚡'
  },
  {
    id: 'frequently_bought_together',
    label: 'Frequently Bought Together',
    desc: 'Checklist stack under product details with dynamic sum and bundle discount.',
    icon: '🛒'
  },
  {
    id: 'complete_nutrition',
    label: 'Complete Nutrition Stack',
    desc: 'Primary product bundled with essentials, displaying product list and total savings.',
    icon: '💪'
  }
];

const PLACEMENT_OPTIONS: { id: BundlePlacementType; label: string; desc: string }[] = [
  {
    id: 'frequently_bought_together',
    label: 'Frequently Bought Together Section',
    desc: 'Position 4 — Dedicated checklist section directly below Product Description.'
  },
  {
    id: 'main_selector',
    label: 'Main Bundle Selector',
    desc: 'Position 6 — Rendered in the bundle cards area below Product Benefits.'
  },
  {
    id: 'above_purchase',
    label: 'Above Purchase Area',
    desc: 'Prominently placed above standard variant selectors.'
  },
  {
    id: 'below_purchase',
    label: 'Below Purchase Controls',
    desc: 'Placed right under the Add to Cart and delivery trust badge.'
  }
];

export default function AdminCombosAndBundlesTab({
  bundles,
  products,
  onSaveBundle,
  onDeleteBundle
}: AdminCombosAndBundlesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [editingBundle, setEditingBundle] = useState<BundleConfig | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<BundleConfig | null>(null);
  const [previewBundle, setPreviewBundle] = useState<BundleConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAdminLabel, setFormAdminLabel] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBundleType, setFormBundleType] = useState<BundleType>('buy_more_save_more');
  const [formBadgeText, setFormBadgeText] = useState('MOST POPULAR');
  const [formIsPopular, setFormIsPopular] = useState(true);
  const [formEnabled, setFormEnabled] = useState(true);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(0);
  const [formImage, setFormImage] = useState<string>('');
  const [formPlacement, setFormPlacement] = useState<BundlePlacementType>('main_selector');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formTargetAll, setFormTargetAll] = useState(true);
  const [formTargetProductIds, setFormTargetProductIds] = useState<string[]>([]);
  const [formItems, setFormItems] = useState<BundleItemConfig[]>([]);
  const [formTiers, setFormTiers] = useState<BundleTierConfig[]>([]);
  const [formFbtDiscountPercent, setFormFbtDiscountPercent] = useState<number>(5);
  const [formStartDate, setFormStartDate] = useState<string>('');
  const [formEndDate, setFormEndDate] = useState<string>('');

  // Filtered bundles
  const filteredBundles = useMemo(() => {
    return bundles.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.adminLabel && b.adminLabel.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchType = selectedTypeFilter === 'all' || b.bundleType === selectedTypeFilter;
      return matchSearch && matchType;
    });
  }, [bundles, searchQuery, selectedTypeFilter]);

  const openCreateModal = () => {
    const firstProduct = products[0];
    const defaultProductPrice = firstProduct?.price || 2999;
    const defaultProductOrig = firstProduct?.originalPrice || 3999;

    setEditingBundle(null);
    setIsCreatingNew(true);
    setFormTitle('Buy More, Save More');
    setFormAdminLabel('tiered-volume-bundle');
    setFormDescription('Save bigger when ordering multiple units.');
    setFormBundleType('buy_more_save_more');
    setFormBadgeText('MOST POPULAR');
    setFormIsPopular(true);
    setFormEnabled(true);
    setFormSellingPrice(defaultProductPrice);
    setFormOriginalPrice(defaultProductOrig);
    setFormImage('');
    setFormPlacement('main_selector');
    setFormDisplayOrder(0);
    setFormStartDate('');
    setFormEndDate('');
    setFormTargetAll(true);
    setFormTargetProductIds(firstProduct ? [firstProduct.id] : []);
    setFormFbtDiscountPercent(5);

    // Initial item is first product
    if (firstProduct) {
      setFormItems([
        {
          productId: firstProduct.id,
          productName: firstProduct.name,
          quantity: 1,
          price: firstProduct.price,
          originalPrice: firstProduct.originalPrice || firstProduct.price,
          image: firstProduct.image,
          allowCustomerVariantSelection: true
        }
      ]);
    } else {
      setFormItems([]);
    }

    // Default 3 tiers for Buy More, Save More
    setFormTiers([
      {
        id: `tier-1-${Date.now()}`,
        title: 'Single (Buy 1)',
        quantity: 1,
        price: defaultProductPrice,
        originalPrice: defaultProductOrig,
        savingsAmount: Math.max(0, defaultProductOrig - defaultProductPrice),
        savingsPercentage: defaultProductOrig > 0 ? Math.round(((defaultProductOrig - defaultProductPrice) / defaultProductOrig) * 100) : 0,
        badgeText: '',
        isPopular: false
      },
      {
        id: `tier-2-${Date.now()}`,
        title: 'Duo (Buy 2)',
        quantity: 2,
        price: Math.round(defaultProductPrice * 1.85),
        originalPrice: defaultProductOrig * 2,
        savingsAmount: (defaultProductOrig * 2) - Math.round(defaultProductPrice * 1.85),
        savingsPercentage: Math.round((((defaultProductOrig * 2) - Math.round(defaultProductPrice * 1.85)) / (defaultProductOrig * 2)) * 100),
        badgeText: 'MOST POPULAR',
        isPopular: true
      },
      {
        id: `tier-3-${Date.now()}`,
        title: 'Trio (Buy 3)',
        quantity: 3,
        price: Math.round(defaultProductPrice * 2.6),
        originalPrice: defaultProductOrig * 3,
        savingsAmount: (defaultProductOrig * 3) - Math.round(defaultProductPrice * 2.6),
        savingsPercentage: Math.round((((defaultProductOrig * 3) - Math.round(defaultProductPrice * 2.6)) / (defaultProductOrig * 3)) * 100),
        badgeText: 'BEST VALUE',
        isPopular: false
      }
    ]);
  };

  const openEditModal = (bundle: BundleConfig) => {
    setEditingBundle(bundle);
    setIsCreatingNew(false);
    setFormTitle(bundle.title || '');
    setFormAdminLabel(bundle.adminLabel || bundle.title || '');
    setFormDescription(bundle.description || '');
    setFormBundleType(bundle.bundleType || 'buy_more_save_more');
    setFormBadgeText(bundle.badgeText || '');
    setFormIsPopular(bundle.isPopular ?? false);
    setFormEnabled(bundle.enabled ?? true);
    setFormSellingPrice(bundle.sellingPrice || 0);
    setFormOriginalPrice(bundle.originalPrice || 0);
    setFormImage(bundle.image || '');
    setFormPlacement(bundle.placement || 'main_selector');
    setFormDisplayOrder(bundle.displayOrder ?? 0);
    setFormStartDate(bundle.startDate ? bundle.startDate.slice(0, 16) : '');
    setFormEndDate(bundle.endDate ? bundle.endDate.slice(0, 16) : '');
    setFormTargetAll(bundle.targetProductIds?.includes('all') || bundle.targetProductIds?.length === 0);
    setFormTargetProductIds(bundle.targetProductIds?.filter((id) => id !== 'all') || []);
    setFormItems(bundle.items || []);
    setFormTiers(bundle.tiers || []);
    setFormFbtDiscountPercent(bundle.frequentlyBoughtDiscountPercentage || 5);
  };

  const closeModal = () => {
    setEditingBundle(null);
    setIsCreatingNew(false);
  };

  // Add a product item to bundle
  const handleAddProductItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setFormItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: 1,
        price: prod.price,
        originalPrice: prod.originalPrice || prod.price,
        image: prod.image,
        allowCustomerVariantSelection: true
      }
    ]);
  };

  const handleRemoveProductItem = (index: number) => {
    setFormItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateProductItem = (index: number, updates: Partial<BundleItemConfig>) => {
    setFormItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const next = { ...item, ...updates };
        if (updates.productId) {
          const prod = products.find((p) => p.id === updates.productId);
          if (prod) {
            next.productName = prod.name;
            next.price = prod.price;
            next.originalPrice = prod.originalPrice || prod.price;
            next.image = prod.image;
          }
        }
        return next;
      })
    );
  };

  // Tier operations for Buy More Save More
  const handleAddTier = () => {
    const nextQty = (formTiers.length > 0 ? formTiers[formTiers.length - 1].quantity + 1 : 1);
    const baseItemPrice = formItems[0]?.price || 2500;
    const baseItemOrig = formItems[0]?.originalPrice || 3500;
    const tierOrig = baseItemOrig * nextQty;
    const tierSell = Math.round(baseItemPrice * nextQty * 0.9);
    const savings = tierOrig - tierSell;
    const pct = Math.round((savings / tierOrig) * 100);

    setFormTiers((prev) => [
      ...prev,
      {
        id: `tier-${Date.now()}-${nextQty}`,
        title: nextQty === 1 ? 'Single (Buy 1)' : nextQty === 2 ? 'Duo (Buy 2)' : nextQty === 3 ? 'Trio (Buy 3)' : `Buy ${nextQty}`,
        quantity: nextQty,
        price: tierSell,
        originalPrice: tierOrig,
        savingsAmount: savings,
        savingsPercentage: pct,
        badgeText: nextQty === 2 ? 'MOST POPULAR' : '',
        isPopular: nextQty === 2
      }
    ]);
  };

  const handleUpdateTier = (tierIndex: number, updates: Partial<BundleTierConfig>) => {
    setFormTiers((prev) =>
      prev.map((t, idx) => {
        if (idx !== tierIndex) return t;
        const updated = { ...t, ...updates };
        // Recalculate savings if prices changed
        if (updates.price !== undefined || updates.originalPrice !== undefined) {
          const sell = updated.price;
          const orig = updated.originalPrice;
          updated.savingsAmount = Math.max(0, orig - sell);
          updated.savingsPercentage = orig > 0 ? Math.round(((orig - sell) / orig) * 100) : 0;
        }
        return updated;
      })
    );
  };

  const handleRemoveTier = (tierIndex: number) => {
    setFormTiers((prev) => prev.filter((_, idx) => idx !== tierIndex));
  };

  // Auto calculate bundle price from items
  const handleRecalculatePricesFromItems = () => {
    if (formBundleType === 'buy_more_save_more') {
      const topTier = formTiers[0];
      if (topTier) {
        setFormSellingPrice(topTier.price);
        setFormOriginalPrice(topTier.originalPrice);
      }
      return;
    }

    const totalOrig = formItems.reduce((acc, it) => acc + (it.originalPrice || it.price) * (it.quantity || 1), 0);
    const totalSell = formItems.reduce((acc, it) => acc + it.price * (it.quantity || 1), 0);
    // Apply 5-10% combo discount default
    const comboPrice = Math.round(totalSell * 0.92);
    setFormOriginalPrice(totalOrig);
    setFormSellingPrice(comboPrice);
  };

  // Toggle active status in Firestore directly
  const handleToggleActive = async (bundle: BundleConfig) => {
    try {
      const nextEnabled = !bundle.enabled;
      await onSaveBundle({ ...bundle, enabled: nextEnabled });
    } catch (err) {
      console.error('Failed to toggle bundle status:', err);
    }
  };

  // Save bundle handler
  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a bundle title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savings = Math.max(0, formOriginalPrice - formSellingPrice);
      const savingsPercent = formOriginalPrice > 0 ? Math.round((savings / formOriginalPrice) * 100) : 0;

      const targetProductIds = formTargetAll
        ? ['all']
        : formTargetProductIds.length > 0
        ? formTargetProductIds
        : ['all'];

      const bundlePayload: BundleConfig = {
        id: editingBundle?.id || `bundle_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: formTitle.trim(),
        adminLabel: formAdminLabel.trim() || formTitle.trim(),
        description: formDescription.trim(),
        bundleType: formBundleType,
        badgeText: formBadgeText.trim(),
        isPopular: formIsPopular,
        enabled: formEnabled,
        sellingPrice: formSellingPrice,
        originalPrice: formOriginalPrice,
        savingsAmount: savings,
        savingsPercentage: savingsPercent,
        image: formImage || '',
        items: formItems,
        tiers: formBundleType === 'buy_more_save_more' ? formTiers : [],
        targetProductIds,
        placement: formPlacement,
        displayOrder: Number(formDisplayOrder) || 0,
        frequentlyBoughtDiscountPercentage: formFbtDiscountPercent,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : undefined,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : undefined,
        createdAt: editingBundle?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSaveBundle(bundlePayload);
      closeModal();
    } catch (err) {
      console.error('Failed to save bundle:', err);
      alert('Failed to save bundle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const savingsAmount = Math.max(0, formOriginalPrice - formSellingPrice);
  const savingsPercent =
    formOriginalPrice > 0 ? Math.round((savingsAmount / formOriginalPrice) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-neutral-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-none">
              <Flame className="w-5 h-5 fill-emerald-600 text-emerald-600" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Combos & Bundles System
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Manage volume discounts (Single/Duo/Trio), multi-product combos, and Frequently Bought Together modules.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bundle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bundles by name or label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-neutral-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="text-xs border border-neutral-200 px-3 py-2 bg-neutral-50 focus:outline-none focus:border-neutral-900 font-semibold"
          >
            <option value="all">All Bundle Types ({bundles.length})</option>
            <option value="buy_more_save_more">Buy More, Save More</option>
            <option value="product_combo">Product Combos</option>
            <option value="frequently_bought_together">Frequently Bought Together</option>
            <option value="complete_nutrition">Complete Nutrition Stack</option>
          </select>
        </div>
      </div>

      {/* Bundles Grid / Table */}
      {filteredBundles.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-neutral-100 flex items-center justify-center text-neutral-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">No Bundles Found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
              {searchQuery || selectedTypeFilter !== 'all'
                ? 'Try adjusting your search query or filter.'
                : 'Click "Create New Bundle" above to build your first high-converting product bundle.'}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Bundle</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBundles.map((b) => {
            const typeInfo = BUNDLE_TYPES.find((t) => t.id === b.bundleType);
            const targetSummary = b.targetProductIds?.includes('all') || !b.targetProductIds?.length
              ? 'All Products'
              : `${b.targetProductIds.length} Product${b.targetProductIds.length === 1 ? '' : 's'}`;

            return (
              <div
                key={b.id}
                className={`bg-white border-2 transition-all flex flex-col justify-between ${
                  b.enabled ? 'border-neutral-200 hover:border-neutral-400' : 'border-neutral-200/60 opacity-60 bg-neutral-50'
                }`}
              >
                {/* Header & Badges */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-700 flex items-center gap-1 border border-neutral-200">
                      <span>{typeInfo?.icon || '📦'}</span>
                      <span>{typeInfo?.label || b.bundleType}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(b)}
                      className={`text-[10px] font-black uppercase px-2 py-0.5 transition-colors cursor-pointer ${
                        b.enabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {b.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  {/* Title & Admin Label */}
                  <div>
                    <h3 className="font-extrabold text-sm text-neutral-900 line-clamp-1">{b.title}</h3>
                    <p className="text-[11px] font-mono text-neutral-400 truncate">{b.adminLabel}</p>
                  </div>

                  {/* Pricing Overview */}
                  <div className="bg-neutral-50 border border-neutral-200 p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Selling Price</span>
                      <span className="text-base font-black text-neutral-950">Rs {b.sellingPrice.toLocaleString()}</span>
                    </div>
                    {b.originalPrice > b.sellingPrice && (
                      <div className="text-right">
                        <span className="text-[10px] line-through text-neutral-400 block">
                          Rs {b.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-black text-emerald-700">
                          Save Rs {b.savingsAmount.toLocaleString()} ({b.savingsPercentage}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Products Included Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Included Items ({b.items?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(b.items || []).slice(0, 3).map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-white border border-neutral-200 p-1 text-[11px] font-medium"
                          title={it.productName}
                        >
                          <ThumbnailImg src={it.image} alt={it.productName} className="w-5 h-5 shrink-0" />
                          <span className="truncate max-w-[110px]">{it.productName}</span>
                          <span className="text-neutral-400 font-bold">x{it.quantity}</span>
                        </div>
                      ))}
                      {(b.items?.length || 0) > 3 && (
                        <span className="text-[10px] font-bold text-neutral-400 self-center">
                          +{b.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Placement Info */}
                  <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-1 border-t border-neutral-100">
                    <span>Target: <strong className="text-neutral-800">{targetSummary}</strong></span>
                    <span>Order: <strong className="text-neutral-800">#{b.displayOrder}</strong></span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-neutral-50/80 border-t border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(b)}
                      className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewBundle(b)}
                      className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBundleToDelete(b)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Bundle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT BUNDLE MODAL */}
      {(isCreatingNew || editingBundle) && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white max-w-4xl w-full border-2 border-neutral-900 shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-black text-neutral-950 uppercase tracking-tight">
                  {isCreatingNew ? 'Create New Combo / Bundle' : `Edit Bundle: ${editingBundle?.title}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Form */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* Step 1: Bundle Type Selection */}
              <div className="space-y-2">
                <label className="font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1. Choose Bundle Type:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BUNDLE_TYPES.map((type) => {
                    const isSelected = formBundleType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setFormBundleType(type.id)}
                        className={`p-3 border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{type.icon}</span>
                          <span className="font-black text-neutral-950">{type.label}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1 pl-7 leading-relaxed">
                          {type.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Basic Info */}
              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <label className="font-extrabold uppercase tracking-wider text-neutral-900 block">
                  2. General Details:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Bundle Display Name *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Creatine + Whey Super Stack"
                      className="w-full px-3 py-2 border border-neutral-300 font-semibold focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Internal Admin Identifier
                    </label>
                    <input
                      type="text"
                      value={formAdminLabel}
                      onChange={(e) => setFormAdminLabel(e.target.value)}
                      placeholder="e.g. promo-creatine-whey-q4"
                      className="w-full px-3 py-2 border border-neutral-300 font-mono focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Short Tagline / Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="e.g. Maximum strength recovery stack for explosive gains"
                      className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Highlight Badge Text
                    </label>
                    <input
                      type="text"
                      value={formBadgeText}
                      onChange={(e) => setFormBadgeText(e.target.value)}
                      placeholder="e.g. MOST POPULAR, BEST VALUE"
                      className="w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-neutral-800">
                      <input
                        type="checkbox"
                        checked={formIsPopular}
                        onChange={(e) => setFormIsPopular(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                      <span>Highlight with Badge Pill</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-neutral-800">
                      <input
                        type="checkbox"
                        checked={formEnabled}
                        onChange={(e) => setFormEnabled(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                      <span>Active / Published</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 3: Bundle Items & Tiers Builder */}
              <div className="space-y-4 pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold uppercase tracking-wider text-neutral-900 block">
                    3. Configure Included Products & Tiers:
                  </label>
                </div>

                {/* If Buy More Save More -> Tiers Builder */}
                {formBundleType === 'buy_more_save_more' ? (
                  <div className="space-y-3 bg-neutral-50 p-4 border border-neutral-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-neutral-900 block">Primary Base Product</span>
                        <span className="text-[11px] text-neutral-500">
                          Select the product whose variants will be selected for each unit in this tier bundle.
                        </span>
                      </div>
                      <select
                        value={formItems[0]?.productId || ''}
                        onChange={(e) => {
                          const prod = products.find((p) => p.id === e.target.value);
                          if (prod) {
                            setFormItems([
                              {
                                productId: prod.id,
                                productName: prod.name,
                                quantity: 1,
                                price: prod.price,
                                originalPrice: prod.originalPrice || prod.price,
                                image: prod.image,
                                allowCustomerVariantSelection: true
                              }
                            ]);
                          }
                        }}
                        className="text-xs font-bold border border-neutral-300 p-2 bg-white min-w-[220px]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Rs {p.price})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tiers List */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase text-neutral-700">
                          Tiers Configuration (Single, Duo, Trio, etc.):
                        </span>
                        <button
                          type="button"
                          onClick={handleAddTier}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Tier</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {formTiers.map((tier, idx) => (
                          <div
                            key={tier.id || idx}
                            className="bg-white border border-neutral-200 p-3 flex flex-col md:flex-row items-start md:items-center gap-3 justify-between"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 w-full">
                              <div>
                                <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                                  Tier Label
                                </label>
                                <input
                                  type="text"
                                  value={tier.title}
                                  onChange={(e) => handleUpdateTier(idx, { title: e.target.value })}
                                  placeholder="e.g. Duo (Buy 2)"
                                  className="w-full text-xs font-semibold p-1.5 border border-neutral-300"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                                  Units (Qty)
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={tier.quantity}
                                  onChange={(e) =>
                                    handleUpdateTier(idx, { quantity: Number(e.target.value) || 1 })
                                  }
                                  className="w-full text-xs font-semibold p-1.5 border border-neutral-300"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                                  Selling Price (Rs)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={tier.price}
                                  onChange={(e) =>
                                    handleUpdateTier(idx, { price: Number(e.target.value) || 0 })
                                  }
                                  className="w-full text-xs font-semibold p-1.5 border border-neutral-300"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                                  Original Price (Rs)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={tier.originalPrice}
                                  onChange={(e) =>
                                    handleUpdateTier(idx, { originalPrice: Number(e.target.value) || 0 })
                                  }
                                  className="w-full text-xs font-semibold p-1.5 border border-neutral-300"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-200">
                                Save Rs {tier.savingsAmount || 0} ({tier.savingsPercentage || 0}%)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTier(idx)}
                                disabled={formTiers.length <= 1}
                                className="p-1.5 text-neutral-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Multi-product combo builder */
                  <div className="space-y-3 bg-neutral-50 p-4 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900 block">
                        Included Products in this Combo ({formItems.length})
                      </span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddProductItem(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="text-xs font-bold border border-neutral-300 p-2 bg-white cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>+ Add Product to Combo...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Rs {p.price})
                          </option>
                        ))}
                      </select>
                    </div>

                    {formItems.length === 0 ? (
                      <p className="text-xs text-neutral-500 py-3 text-center">
                        No products added yet. Pick a product from the dropdown above.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {formItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-neutral-200 p-2.5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <ThumbnailImg src={item.image} alt={item.productName} className="w-10 h-10 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-black text-neutral-950 text-xs block truncate">
                                  {item.productName}
                                </span>
                                <span className="text-[11px] text-neutral-500">
                                  Catalog Price: Rs {item.price.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold uppercase text-neutral-500">Qty:</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleUpdateProductItem(idx, { quantity: Number(e.target.value) || 1 })
                                  }
                                  className="w-14 p-1 text-xs font-bold border border-neutral-300 text-center"
                                />
                              </div>

                              <label className="text-[11px] font-semibold flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.allowCustomerVariantSelection ?? true}
                                  onChange={(e) =>
                                    handleUpdateProductItem(idx, {
                                      allowCustomerVariantSelection: e.target.checked
                                    })
                                  }
                                  className="w-3.5 h-3.5 accent-emerald-600"
                                />
                                <span>Customer Picks Flavor</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveProductItem(idx)}
                                className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formBundleType === 'frequently_bought_together' && (
                      <div className="pt-2 border-t border-neutral-200 flex items-center gap-3">
                        <span className="text-xs font-bold text-neutral-800">
                          Bundle Discount Percentage (%):
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={formFbtDiscountPercent}
                          onChange={(e) => setFormFbtDiscountPercent(Number(e.target.value) || 0)}
                          className="w-20 p-1.5 border border-neutral-300 font-bold text-xs"
                        />
                        <span className="text-[11px] text-neutral-500">
                          (Automatically applied when customer checks items in Frequently Bought Together)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Pricing & Discount Automation */}
              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold uppercase tracking-wider text-neutral-900 block">
                    4. Pricing & Savings Calculations:
                  </label>
                  <button
                    type="button"
                    onClick={handleRecalculatePricesFromItems}
                    className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 border border-emerald-300 cursor-pointer inline-flex items-center gap-1"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Auto-Calculate from Products</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Selling Price (Rs) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formSellingPrice}
                      onChange={(e) => setFormSellingPrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-neutral-300 font-black text-sm text-neutral-950 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Original / Compare-at Price (Rs) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-neutral-300 font-semibold focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-800">
                      Calculated Savings
                    </span>
                    <span className="text-sm font-black text-emerald-900">
                      Save Rs {savingsAmount.toLocaleString()} ({savingsPercent}% OFF)
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 5: Placement & Display Controls (Critical Requirement #3) */}
              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <label className="font-extrabold uppercase tracking-wider text-neutral-900 block">
                  5. Placement & Display Controls (Data-Driven):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Placement position */}
                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Position on Product Page
                    </label>
                    <select
                      value={formPlacement}
                      onChange={(e) => setFormPlacement(e.target.value as BundlePlacementType)}
                      className="w-full text-xs font-semibold p-2 border border-neutral-300 bg-white"
                    >
                      {PLACEMENT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {PLACEMENT_OPTIONS.find((p) => p.id === formPlacement)?.desc}
                    </p>
                  </div>

                  {/* Display order */}
                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Display Priority / Order (0 = Top)
                    </label>
                    <input
                      type="number"
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(Number(e.target.value) || 0)}
                      className="w-full text-xs font-semibold p-2 border border-neutral-300"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      Start Date / Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full text-xs font-semibold p-2 border border-neutral-300 bg-white"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block mb-1">
                      End Date / Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full text-xs font-semibold p-2 border border-neutral-300 bg-white"
                    />
                  </div>

                  {/* Target product assignment */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold uppercase text-neutral-600 block">
                      Target Product Assignment
                    </label>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                        <input
                          type="radio"
                          name="target_mode"
                          checked={formTargetAll}
                          onChange={() => setFormTargetAll(true)}
                          className="w-4 h-4 accent-neutral-950"
                        />
                        <span>All Products (Global Bundle)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                        <input
                          type="radio"
                          name="target_mode"
                          checked={!formTargetAll}
                          onChange={() => setFormTargetAll(false)}
                          className="w-4 h-4 accent-neutral-950"
                        />
                        <span>Specific Product Pages</span>
                      </label>
                    </div>

                    {!formTargetAll && (
                      <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-2">
                        <span className="text-[11px] font-bold text-neutral-700 block">
                          Select which products will display this bundle:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {products.map((p) => {
                            const isChecked = formTargetProductIds.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-center gap-2 p-1.5 border text-xs cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950'
                                    : 'bg-white border-neutral-200 text-neutral-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormTargetProductIds((prev) => [...prev, p.id]);
                                    } else {
                                      setFormTargetProductIds((prev) => prev.filter((id) => id !== p.id));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 accent-emerald-600"
                                />
                                <ThumbnailImg src={p.image} alt={p.name} className="w-6 h-6 shrink-0" />
                                <span className="truncate">{p.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 6: Custom Bundle Image (Optional) */}
              <div className="space-y-2 pt-3 border-t border-neutral-200">
                <label className="font-extrabold uppercase tracking-wider text-neutral-900 block">
                  6. Bundle Graphic / Photo (Optional):
                </label>
                <p className="text-[11px] text-neutral-500">
                  If left empty, product images from the catalog will be automatically composed on the storefront.
                </p>
                <ImageUploader
                  images={formImage ? [formImage] : []}
                  onChange={(imgs) => setFormImage(imgs[0] || '')}
                  multiple={false}
                  maxFiles={1}
                  folder="bundles"
                  label="Upload Custom Bundle Artwork"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const savings = Math.max(0, formOriginalPrice - formSellingPrice);
                    const savingsPercent =
                      formOriginalPrice > 0 ? Math.round((savings / formOriginalPrice) * 100) : 0;
                    setPreviewBundle({
                      id: editingBundle?.id || 'preview-bundle',
                      title: formTitle || 'Untitled Bundle',
                      adminLabel: formAdminLabel,
                      description: formDescription,
                      bundleType: formBundleType,
                      badgeText: formBadgeText,
                      isPopular: formIsPopular,
                      enabled: formEnabled,
                      sellingPrice: formSellingPrice,
                      originalPrice: formOriginalPrice,
                      savingsAmount: savings,
                      savingsPercentage: savingsPercent,
                      image: formImage,
                      items: formItems,
                      tiers: formBundleType === 'buy_more_save_more' ? formTiers : [],
                      targetProductIds: formTargetAll ? ['all'] : formTargetProductIds,
                      placement: formPlacement,
                      displayOrder: formDisplayOrder,
                      frequentlyBoughtDiscountPercentage: formFbtDiscountPercent
                    });
                  }}
                  className="px-4 py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-extrabold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveForm}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-xs inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save & Publish Bundle'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewBundle && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border-2 border-neutral-900 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm uppercase">Storefront Live Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBundle(null)}
                className="p-1 text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated selected card */}
            <div className="border-2 border-emerald-600 bg-emerald-50/40 p-4 relative space-y-3">
              {previewBundle.badgeText && (
                <div className="absolute -top-3 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider">
                  {previewBundle.badgeText}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center bg-emerald-600 text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-neutral-950">{previewBundle.title}</h4>
                    <p className="text-xs font-semibold text-emerald-700">
                      Save Rs {previewBundle.savingsAmount.toLocaleString()} ({previewBundle.savingsPercentage}% OFF)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-neutral-950">
                    Rs {previewBundle.sellingPrice.toLocaleString()}
                  </div>
                  {previewBundle.originalPrice > previewBundle.sellingPrice && (
                    <div className="text-xs text-neutral-400 line-through">
                      Rs {previewBundle.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Items included */}
              <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap gap-2">
                {(previewBundle.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-white p-1 border border-emerald-200 text-xs">
                    <ThumbnailImg src={it.image} alt={it.productName} className="w-6 h-6" />
                    <span className="font-semibold">{it.productName}</span>
                    <span className="text-neutral-400 font-bold">x{it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setPreviewBundle(null)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {bundleToDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border-2 border-neutral-900 shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-black text-base uppercase">Confirm Delete Bundle</h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-neutral-950">"{bundleToDelete.title}"</strong>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setBundleToDelete(null)}
                className="px-4 py-2 text-xs font-bold uppercase text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onDeleteBundle(bundleToDelete.id);
                    setBundleToDelete(null);
                  } catch (err) {
                    alert('Failed to delete bundle.');
                  }
                }}
                className="px-4 py-2 text-xs font-bold uppercase bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Delete Bundle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
