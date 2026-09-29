import { useState, useRef, ChangeEvent } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  SlidersHorizontal,
  Star,
  Image as ImageIcon,
  X,
  ArrowUp,
  ArrowDown,
  Video,
  Upload,
  Loader2,
  Sparkles,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import { Product, BundleDeal, ProductBenefit, CustomerUGCImage } from '../../types';
import ImageUploader from './ImageUploader';
import { uploadFileToStorage, useResolvedMediaUrl } from '../../services/storageService';

function AdminVideoPreview({ url }: { url: string }) {
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

interface AdminProductsTabProps {
  products: Product[];
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onOpenPageBuilder?: (product: Product) => void;
}

export default function AdminProductsTab({
  products = [],
  onSaveProduct,
  onDeleteProduct,
  onOpenPageBuilder
}: AdminProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modalTab, setModalTab] = useState<'details' | 'images' | 'bundles' | 'benefits' | 'ugc'>('details');

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNewProduct = () => {
    const newId = `product-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      name: 'New FitYatra Performance Supplement',
      tagline: 'High potency athletic nutrition formula.',
      shortDescription: 'Clinically dosed formula for strength, endurance, and recovery.',
      brand: 'FitYatra',
      category: 'Supplements',
      price: 2500,
      originalPrice: 3500,
      discountPercentage: 29,
      stock: 50,
      soldCount: 0,
      sku: `FY-${Date.now().toString().slice(-6)}`,
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      badgeType: 'sale',
      rating: 5,
      reviewCount: 12,
      isSoldOut: false,
      image: '',
      gallery: [],
      videoUrl: '',
      description: 'Manufactured with clinical pharmaceutical-grade ingredients in Nepal.',
      descriptionHtml:
        '<p>Premium performance formula engineered for strength, power, and rapid muscular recovery.</p>',
      hasOptions: true,
      variants: ['Unflavored', 'Lemon Lime', 'Tropical Fruit'],
      options: [
        {
          name: 'Flavor',
          values: ['Unflavored', 'Lemon Lime', 'Tropical Fruit']
        }
      ],
      bundles: [
        {
          id: 'single',
          title: 'Buy 1',
          quantity: 1,
          price: 2500,
          originalPrice: 3500,
          savingsAmount: 1000,
          savingsPercentage: 29,
          badgeText: '',
          isPopular: false,
          isDefault: true,
          enabled: true
        },
        {
          id: 'bundle-2',
          title: 'Buy 2',
          quantity: 2,
          price: 4500,
          originalPrice: 7000,
          savingsAmount: 2500,
          savingsPercentage: 36,
          badgeText: 'MOST POPULAR',
          isPopular: true,
          isDefault: false,
          enabled: true,
          requiresMultipleFlavors: true
        }
      ],
      benefitsHeading: 'PHYSIOLOGICAL BENEFITS',
      benefits: [
        {
          id: 'b1',
          icon: '💪',
          title: '1–2 extra reps per set',
          description: 'Maximizes intracellular ATP resynthesis during high-intensity training.',
          enabled: true
        },
        {
          id: 'b2',
          icon: '⏱️',
          title: 'Shorter rest between sets',
          description: 'Reduces cellular fatigue and accelerates phosphocreatine recovery.',
          enabled: true
        }
      ],
      customerGallery: [],
      testimonials: []
    };
    setEditingProduct(newProd);
    setModalTab('details');
  };

  const handleDuplicate = async (prod: Product) => {
    const dup: Product = {
      ...prod,
      id: `${prod.id}-copy-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku || 'FY'}-COPY`
    };
    await onSaveProduct(dup);
  };

  const handleQuickToggle = async (prod: Product, field: 'isActive' | 'isFeatured' | 'isBestSeller') => {
    const currentVal = field === 'isActive' ? prod.isActive !== false : Boolean(prod[field]);
    await onSaveProduct({
      ...prod,
      [field]: !currentVal
    });
  };

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadingVideo(true);
    setVideoProgress(10);
    try {
      const res = await uploadFileToStorage(file, `products/${editingProduct.id}/video`, (pct) => {
        setVideoProgress(pct);
      });
      if (res.url) {
        setEditingProduct({ ...editingProduct, videoUrl: res.url });
      }
    } catch (err) {
      console.error('Video upload error:', err);
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleSaveModal = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      await onSaveProduct(editingProduct);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingProduct(null);
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  const moveBenefit = (index: number, direction: 'up' | 'down') => {
    if (!editingProduct) return;
    const list = [...(editingProduct.benefits || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    setEditingProduct({ ...editingProduct, benefits: list });
  };

  const moveUgc = (index: number, direction: 'up' | 'down') => {
    if (!editingProduct) return;
    const list = [...(editingProduct.customerGallery || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    setEditingProduct({ ...editingProduct, customerGallery: list });
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Search Controls */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Products
        </h2>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleAddNewProduct}
            className="bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FFCD00]" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by title, SKU, category, or brand..."
          className="w-full bg-white border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-neutral-900"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const isActive = product.isActive !== false;
          const stockCount = typeof product.stock === 'number' ? product.stock : product.isSoldOut ? 0 : 50;
          const discount =
            product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border shadow-xs p-4 flex flex-col justify-between transition-all group ${
                !isActive
                  ? 'border-neutral-200 opacity-60 bg-neutral-50'
                  : 'border-neutral-200/90 hover:border-neutral-900'
              }`}
            >
              <div>
                {/* Product Image & Badges */}
                <div className="aspect-square bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden relative mb-3 flex items-center justify-center p-3">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center text-neutral-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <span className="text-[10px] font-mono">No Image Uploaded</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {!isActive && (
                      <span className="bg-neutral-700 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        Disabled / Hidden
                      </span>
                    )}
                    {(product.isSoldOut || stockCount <= 0) && (
                      <span className="bg-neutral-950 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        Out of Stock
                      </span>
                    )}
                    {discount > 0 && !product.isSoldOut && stockCount > 0 && (
                      <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Quick Status Toggles Top Right */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'isFeatured')}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
                        product.isFeatured
                          ? 'bg-[#FFCD00] border-amber-400 text-black'
                          : 'bg-white/90 border-neutral-200 text-neutral-400 hover:text-black'
                      }`}
                      title="Toggle Featured Product"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'isBestSeller')}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
                        product.isBestSeller
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'bg-white/90 border-neutral-200 text-neutral-400 hover:text-black'
                      }`}
                      title="Toggle Best Seller"
                    >
                      <Award className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickToggle(product, 'isActive')}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-white/90 border-neutral-200 text-emerald-600'
                          : 'bg-neutral-800 border-neutral-900 text-white'
                      }`}
                      title={isActive ? 'Enabled on Store (Click to Hide)' : 'Hidden from Store (Click to Enable)'}
                    >
                      {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-400 font-bold">
                    <span>
                      {product.brand} • {product.category}
                    </span>
                    <span>Stock: {stockCount}</span>
                  </div>
                  <h3 className="text-sm font-black text-neutral-900 leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-1">
                    {product.shortDescription || product.tagline || product.description}
                  </p>
                </div>

                {/* Price & Badges */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-neutral-950">
                      Rs {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-neutral-400 line-through">
                        Rs {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {product.isBestSeller && (
                      <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        Best Seller
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(product);
                      setModalTab('details');
                    }}
                    className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#FFCD00]" />
                    <span>Edit Product</span>
                  </button>

                  {onOpenPageBuilder && (
                    <button
                      type="button"
                      onClick={() => onOpenPageBuilder(product)}
                      className="bg-neutral-100 hover:bg-[#FFCD00] text-neutral-900 font-bold text-xs py-2 px-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Open Full Product Page Builder"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Builder</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDuplicate(product)}
                    className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                    title="Duplicate Product"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {confirmDeleteId === product.id ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await onDeleteProduct(product.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer"
                    >
                      Confirm?
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL PRODUCT EDIT / CREATE MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-neutral-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFCD00] bg-neutral-900 px-2 py-0.5 rounded">
                  PRODUCT MANAGER
                </span>
                <h3 className="text-base font-black truncate max-w-md">
                  {editingProduct.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveModal}
                  disabled={isSaving}
                  className={`px-4 py-1.5 text-xs font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    saveSuccess
                      ? 'bg-emerald-400 text-black'
                      : 'bg-[#FFCD00] hover:bg-amber-400 text-black'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside modal */}
            <div className="flex items-center border-b border-neutral-200 bg-neutral-50 px-4 overflow-x-auto text-xs font-bold uppercase tracking-wider text-neutral-600 no-scrollbar">
              {[
                { id: 'details', label: '1. Details, Stock & SKU' },
                { id: 'images', label: '2. Upload Images & Video' },
                { id: 'bundles', label: '3. Buy More Save More' },
                { id: 'benefits', label: '4. Benefits' },
                { id: 'ugc', label: '5. Customer Images / UGC' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id as any)}
                  className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    modalTab === tab.id
                      ? 'border-neutral-950 text-neutral-950 font-black bg-white'
                      : 'border-transparent hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* TAB 1: DETAILS, PRICING, STOCK & FLAGS */}
              {modalTab === 'details' && (
                <div className="space-y-4 max-w-3xl">
                  {/* Status & Visibility Toggles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isActive !== false}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, isActive: e.target.checked })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span>Enabled / Active</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isFeatured || false}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span>Featured Product</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isBestSeller || false}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span>Best Seller</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-red-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isSoldOut || false}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, isSoldOut: e.target.checked })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span>Out of Stock</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Product Title
                      </label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        SKU Code
                      </label>
                      <input
                        type="text"
                        value={editingProduct.sku || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        placeholder="e.g. FY-CREATINE-100"
                        className="w-full text-xs font-mono p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Short Tagline
                      </label>
                      <input
                        type="text"
                        value={editingProduct.tagline || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                        placeholder="e.g. Recover faster. Lift heavier."
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={editingProduct.shortDescription || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, shortDescription: e.target.value })
                        }
                        placeholder="Brief summary for product cards and previews"
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Pricing, Discount, Stock */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Selling Price (Rs)
                      </label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          const orig = editingProduct.originalPrice || price;
                          const disc = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
                          setEditingProduct({
                            ...editingProduct,
                            price,
                            discountPercentage: disc
                          });
                        }}
                        className="w-full text-xs font-black p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Compare-At / Original Price
                      </label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice}
                        onChange={(e) => {
                          const orig = Number(e.target.value);
                          const price = editingProduct.price;
                          const disc = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
                          setEditingProduct({
                            ...editingProduct,
                            originalPrice: orig,
                            discountPercentage: disc
                          });
                        }}
                        className="w-full text-xs text-neutral-600 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        value={editingProduct.discountPercentage || 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            discountPercentage: Number(e.target.value)
                          })
                        }
                        className="w-full text-xs font-bold text-red-600 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Available Stock
                      </label>
                      <input
                        type="number"
                        value={editingProduct.stock ?? 50}
                        onChange={(e) => {
                          const st = Math.max(0, Number(e.target.value));
                          setEditingProduct({
                            ...editingProduct,
                            stock: st,
                            isSoldOut: st <= 0
                          });
                        }}
                        className="w-full text-xs font-black p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={editingProduct.brand}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, category: e.target.value })
                        }
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                        Flavors / Variants (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={(
                          editingProduct.options?.[0]?.values ||
                          editingProduct.variants ||
                          []
                        ).join(', ')}
                        onChange={(e) => {
                          const vals = e.target.value
                            .split(',')
                            .map((v) => v.trim())
                            .filter(Boolean);
                          setEditingProduct({
                            ...editingProduct,
                            variants: vals,
                            options: [{ name: 'Flavor', values: vals }]
                          });
                        }}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                      Full Product Description (HTML supported)
                    </label>
                    <textarea
                      value={editingProduct.descriptionHtml || editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value.replace(/<[^>]+>/g, ''),
                          descriptionHtml: e.target.value
                        })
                      }
                      rows={5}
                      className="w-full text-xs font-mono p-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DIRECT IMAGE & VIDEO UPLOADER */}
              {modalTab === 'images' && (
                <div className="space-y-6">
                  <ImageUploader
                    label="Product Gallery Images"
                    folder={`products/${editingProduct.id}`}
                    images={
                      editingProduct.gallery && editingProduct.gallery.length > 0
                        ? editingProduct.gallery
                        : editingProduct.image
                        ? [editingProduct.image]
                        : []
                    }
                    onChange={(newImages) => {
                      setEditingProduct({
                        ...editingProduct,
                        image: newImages[0] || '',
                        gallery: newImages
                      });
                    }}
                    multiple={true}
                  />

                  {/* Optional Product Video Upload */}
                  <div className="pt-5 border-t border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-neutral-600" />
                        <span>Product Video</span>
                      </h4>

                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={handleVideoUpload}
                        accept="video/*"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingVideo}
                        className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        {uploadingVideo ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#FFCD00]" />
                        ) : (
                          <Upload className="w-4 h-4 text-[#FFCD00]" />
                        )}
                        <span>
                          {uploadingVideo
                            ? `Uploading (${videoProgress}%)...`
                            : editingProduct.videoUrl
                            ? 'Replace Video'
                            : '+ Upload Video'}
                        </span>
                      </button>
                    </div>

                    {editingProduct.videoUrl && (
                      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-4">
                        <AdminVideoPreview url={editingProduct.videoUrl} />
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, videoUrl: '' })}
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

              {/* TAB 3: BUNDLES (BUY MORE, SAVE MORE) */}
              {modalTab === 'bundles' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase text-neutral-900">
                      Buy More, Save More Bundles
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const nextQty = (editingProduct.bundles?.length || 0) + 1;
                        const sellPrice = Math.round(editingProduct.price * nextQty * 0.88);
                        const origPrice = editingProduct.originalPrice * nextQty;
                        const newBundle: BundleDeal = {
                          id: `bundle-${Date.now()}`,
                          title: `Buy ${nextQty}`,
                          quantity: nextQty,
                          price: sellPrice,
                          originalPrice: origPrice,
                          savingsAmount: Math.max(0, origPrice - sellPrice),
                          savingsPercentage:
                            origPrice > sellPrice
                              ? Math.round(((origPrice - sellPrice) / origPrice) * 100)
                              : 0,
                          badgeText: '',
                          isPopular: false,
                          isDefault: false,
                          enabled: true,
                          requiresMultipleFlavors: nextQty > 1
                        };
                        setEditingProduct({
                          ...editingProduct,
                          bundles: [...(editingProduct.bundles || []), newBundle]
                        });
                      }}
                      className="px-3.5 py-2 bg-neutral-950 text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
                    >
                      + Add Quantity Bundle
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(editingProduct.bundles || []).map((bundle, bIdx) => {
                      const updateBundle = (updates: Partial<BundleDeal>) => {
                        setEditingProduct({
                          ...editingProduct,
                          bundles: (editingProduct.bundles || []).map((b) => {
                            if (b.id !== bundle.id) {
                              if (updates.isDefault) return { ...b, isDefault: false };
                              return b;
                            }
                            return { ...b, ...updates };
                          })
                        });
                      };

                      return (
                        <div
                          key={bundle.id}
                          className={`p-4 rounded-xl border space-y-3 ${
                            bundle.enabled === false
                              ? 'bg-neutral-100 border-neutral-200 opacity-60'
                              : 'bg-neutral-50 border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                            <span className="text-xs font-black uppercase text-neutral-900">
                              Bundle #{bIdx + 1}: {bundle.title} ({bundle.quantity} Units)
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bundle.enabled !== false}
                                  onChange={(e) => updateBundle({ enabled: e.target.checked })}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span>Enabled</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct({
                                    ...editingProduct,
                                    bundles: (editingProduct.bundles || []).filter(
                                      (b) => b.id !== bundle.id
                                    )
                                  });
                                }}
                                className="text-neutral-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                                Title
                              </label>
                              <input
                                type="text"
                                value={bundle.title}
                                onChange={(e) => updateBundle({ title: e.target.value })}
                                className="w-full text-xs font-bold p-2 bg-white border border-neutral-200 rounded"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={bundle.quantity}
                                onChange={(e) => updateBundle({ quantity: Number(e.target.value) })}
                                className="w-full text-xs font-bold p-2 bg-white border border-neutral-200 rounded"
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
                                  const price = Number(e.target.value);
                                  const orig = bundle.originalPrice || price;
                                  updateBundle({
                                    price,
                                    savingsAmount: Math.max(0, orig - price),
                                    savingsPercentage:
                                      orig > price ? Math.round(((orig - price) / orig) * 100) : 0
                                  });
                                }}
                                className="w-full text-xs font-black p-2 bg-white border border-neutral-200 rounded"
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
                                  const price = bundle.price;
                                  updateBundle({
                                    originalPrice: orig,
                                    savingsAmount: Math.max(0, orig - price),
                                    savingsPercentage:
                                      orig > price ? Math.round(((orig - price) / orig) * 100) : 0
                                  });
                                }}
                                className="w-full text-xs text-neutral-500 p-2 bg-white border border-neutral-200 rounded"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                                Discount Amt (Rs)
                              </label>
                              <input
                                type="number"
                                value={bundle.savingsAmount}
                                onChange={(e) => updateBundle({ savingsAmount: Number(e.target.value) })}
                                className="w-full text-xs text-emerald-700 font-bold p-2 bg-white border border-neutral-200 rounded"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                                Discount (%)
                              </label>
                              <input
                                type="number"
                                value={bundle.savingsPercentage}
                                onChange={(e) =>
                                  updateBundle({ savingsPercentage: Number(e.target.value) })
                                }
                                className="w-full text-xs text-red-600 font-bold p-2 bg-white border border-neutral-200 rounded"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center pt-1">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-neutral-600 block mb-1">
                                Badge Text
                              </label>
                              <input
                                type="text"
                                value={bundle.badgeText || ''}
                                onChange={(e) => updateBundle({ badgeText: e.target.value })}
                                placeholder="e.g. MOST POPULAR"
                                className="w-full text-xs p-2 bg-white border border-neutral-200 rounded"
                              />
                            </div>

                            <label className="flex items-center gap-2 pt-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bundle.isPopular || false}
                                onChange={(e) => updateBundle({ isPopular: e.target.checked })}
                                className="w-4 h-4 cursor-pointer"
                              />
                              <span className="text-xs font-bold">Most Popular Highlight</span>
                            </label>

                            <label className="flex items-center gap-2 pt-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bundle.isDefault || false}
                                onChange={(e) => updateBundle({ isDefault: e.target.checked })}
                                className="w-4 h-4 cursor-pointer"
                              />
                              <span className="text-xs font-bold">Default Selected</span>
                            </label>

                            <label className="flex items-center gap-2 pt-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bundle.requiresMultipleFlavors ?? bundle.quantity > 1}
                                onChange={(e) =>
                                  updateBundle({ requiresMultipleFlavors: e.target.checked })
                                }
                                className="w-4 h-4 cursor-pointer"
                              />
                              <span className="text-xs font-bold">Variant/Flavor Picker</span>
                            </label>
                          </div>

                          {/* Optional Bundle Image Upload */}
                          <div className="pt-2 border-t border-neutral-200/70">
                            <ImageUploader
                              label="Optional Bundle Image"
                              folder={`bundles/${editingProduct.id}`}
                              images={bundle.image ? [bundle.image] : []}
                              onChange={(imgs) => updateBundle({ image: imgs[0] || '' })}
                              multiple={false}
                              maxFiles={1}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: BENEFITS MANAGEMENT */}
              {modalTab === 'benefits' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase text-neutral-900">
                      Product Benefits
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newBen: ProductBenefit = {
                          id: `ben-${Date.now()}`,
                          icon: '💪',
                          title: 'Measurable strength gains',
                          description: 'Clinically proven to increase power output and lean muscle fullness.',
                          enabled: true
                        };
                        setEditingProduct({
                          ...editingProduct,
                          benefits: [...(editingProduct.benefits || []), newBen]
                        });
                      }}
                      className="px-3.5 py-2 bg-neutral-950 text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
                    >
                      + Add Benefit
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(editingProduct.benefits || []).map((ben, idx) => {
                      const updateBen = (updates: Partial<ProductBenefit>) => {
                        setEditingProduct({
                          ...editingProduct,
                          benefits: (editingProduct.benefits || []).map((b) =>
                            b.id === ben.id ? { ...b, ...updates } : b
                          )
                        });
                      };

                      return (
                        <div
                          key={ben.id}
                          className={`p-4 rounded-xl border space-y-3 ${
                            !ben.enabled
                              ? 'bg-neutral-100 border-neutral-200 opacity-60'
                              : 'bg-neutral-50 border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={
                                  ben.icon.startsWith('http') || ben.icon.startsWith('data:')
                                    ? '🖼️'
                                    : ben.icon
                                }
                                onChange={(e) => updateBen({ icon: e.target.value })}
                                className="w-10 text-center text-sm p-1.5 bg-white border border-neutral-200 rounded"
                                title="Emoji or upload icon below"
                              />
                              <input
                                type="text"
                                value={ben.title}
                                onChange={(e) => updateBen({ title: e.target.value })}
                                className="text-xs font-bold p-1.5 bg-white border border-neutral-200 rounded flex-1"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={ben.enabled}
                                  onChange={(e) => updateBen({ enabled: e.target.checked })}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span>Enabled</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => moveBenefit(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 bg-white border border-neutral-200 rounded disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => moveBenefit(idx, 'down')}
                                disabled={idx === (editingProduct.benefits?.length || 0) - 1}
                                className="p-1 bg-white border border-neutral-200 rounded disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct({
                                    ...editingProduct,
                                    benefits: (editingProduct.benefits || []).filter(
                                      (b) => b.id !== ben.id
                                    )
                                  });
                                }}
                                className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <textarea
                            value={ben.description}
                            onChange={(e) => updateBen({ description: e.target.value })}
                            rows={2}
                            className="w-full text-xs p-2 bg-white border border-neutral-200 rounded"
                          />

                          <ImageUploader
                            label="Upload Custom Benefit Icon (Optional)"
                            folder={`benefits/${editingProduct.id}`}
                            images={
                              ben.icon.startsWith('http') || ben.icon.startsWith('data:')
                                ? [ben.icon]
                                : []
                            }
                            onChange={(imgs) => updateBen({ icon: imgs[0] || '💪' })}
                            multiple={false}
                            maxFiles={1}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: CUSTOMER IMAGES / UGC */}
              {modalTab === 'ugc' && (
                <div className="space-y-5">
                  <ImageUploader
                    label="+ Upload Customer / UGC Photos"
                    folder={`ugc/${editingProduct.id}`}
                    images={(editingProduct.customerGallery || []).map((ugc) => ugc.url)}
                    onChange={(urls) => {
                      const updatedUgc: CustomerUGCImage[] = urls.map((url, i) => {
                        const existing = editingProduct.customerGallery?.find((u) => u.url === url);
                        return {
                          id: existing?.id || `ugc-${Date.now()}-${i}`,
                          url,
                          customerName: existing?.customerName || 'Verified Athlete',
                          caption: existing?.caption || 'Authentic FitYatra Delivery',
                          enabled: existing?.enabled ?? true
                        };
                      });
                      setEditingProduct({ ...editingProduct, customerGallery: updatedUgc });
                    }}
                    multiple={true}
                    aspectRatio="tall"
                  />

                  {/* Per-Photo Caption, Customer Connection, Reorder & Enable/Disable */}
                  {(editingProduct.customerGallery || []).length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-neutral-200">
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                        Manage Individual UGC Photos ({editingProduct.customerGallery?.length})
                      </h4>
                      {(editingProduct.customerGallery || []).map((ugc, idx) => {
                        const updateUgcItem = (updates: Partial<CustomerUGCImage>) => {
                          setEditingProduct({
                            ...editingProduct,
                            customerGallery: (editingProduct.customerGallery || []).map((item) =>
                              item.id === ugc.id ? { ...item, ...updates } : item
                            )
                          });
                        };

                        return (
                          <div
                            key={ugc.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                              !ugc.enabled
                                ? 'bg-neutral-100 border-neutral-200 opacity-60'
                                : 'bg-white border-neutral-200'
                            }`}
                          >
                            <img
                              src={ugc.url}
                              alt={ugc.caption || 'UGC'}
                              referrerPolicy="no-referrer"
                              className="w-16 h-20 object-cover rounded-lg border border-neutral-200 shrink-0"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                              <div>
                                <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">
                                  Customer / Connected Review
                                </label>
                                <input
                                  type="text"
                                  value={ugc.customerName || ''}
                                  onChange={(e) => updateUgcItem({ customerName: e.target.value })}
                                  placeholder="e.g. Rupesh T. (Kathmandu)"
                                  className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">
                                  Photo Caption
                                </label>
                                <input
                                  type="text"
                                  value={ugc.caption || ''}
                                  onChange={(e) => updateUgcItem({ caption: e.target.value })}
                                  placeholder="e.g. Week 3 results with Wellcore Creatine"
                                  className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <label className="flex items-center gap-1 text-xs font-bold cursor-pointer mr-1">
                                <input
                                  type="checkbox"
                                  checked={ugc.enabled}
                                  onChange={(e) => updateUgcItem({ enabled: e.target.checked })}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span>Show</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => moveUgc(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => moveUgc(idx, 'down')}
                                disabled={idx === (editingProduct.customerGallery?.length || 0) - 1}
                                className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct({
                                    ...editingProduct,
                                    customerGallery: (editingProduct.customerGallery || []).filter(
                                      (u) => u.id !== ugc.id
                                    )
                                  });
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
