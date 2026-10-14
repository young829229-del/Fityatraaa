import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Plus,
  Search,
  Upload,
  Loader2,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  Eye,
  Star,
  Trash2
} from 'lucide-react';
import { Product } from '../../types';
import { uploadFileToStorage, useResolvedMediaUrl } from '../../services/storageService';

function ResolvedThumb({
  src,
  alt,
  className
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) {
    return (
      <div className={`flex items-center justify-center bg-neutral-50 text-neutral-300 ${className || ''}`}>
        <ImageIcon className="w-6 h-6" />
      </div>
    );
  }
  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
    />
  );
}

interface AdminProductsTabProps {
  products: Product[];
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onOpenPageBuilder?: (product: Product) => void;
}

const CATEGORY_OPTIONS = [
  'Creatine',
  'Protein',
  'Muscle Building',
  'Collagen',
  'Pre-Workout',
  'Multivitamins',
  'Daily Health',
  'Healthy Fats',
  'Performance',
  'BCAA & EAA',
  'Mass Gainer',
  'Supplements'
];

export default function AdminProductsTab({
  products = [],
  onSaveProduct,
  onDeleteProduct
}: AdminProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState<string | null>(null);

  // Gallery Drag-and-Drop and Preview States
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchDraggingIndex, setTouchDraggingIndex] = useState<number | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [showOrderPreview, setShowOrderPreview] = useState(false);

  // Upload loading states
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingBanners, setUploadingBanners] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const bannersInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditorForProduct = (prod: Product) => {
    setSaveError(null);
    setHasUnsavedChanges(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchDraggingIndex(null);
    setShowOrderPreview(false);

    let galleryList: string[] = [];
    if (prod.gallery && prod.gallery.length > 0) {
      galleryList = [...prod.gallery].filter(Boolean);
      if (prod.image && !galleryList.includes(prod.image)) {
        galleryList = [prod.image, ...galleryList];
      }
    } else if (prod.image) {
      galleryList = [prod.image];
    }
    const bannersList = prod.detailBanners || [];

    setEditingProduct({
      ...prod,
      stock: typeof prod.stock === 'number' ? prod.stock : prod.isSoldOut ? 0 : 50,
      image: galleryList[0] || prod.image || '',
      gallery: galleryList,
      detailBanners: bannersList
    });
  };

  const handleAddNewProduct = () => {
    const newId = `product-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      name: 'Skin Radiance Collagen - Glow Formula',
      brand: 'HK Vitals',
      category: 'Creatine',
      price: 1499,
      originalPrice: 1999,
      discountPercentage: 25,
      stock: 50,
      servings: '25 Servings',
      servingSize: '8g',
      isActive: true,
      isFeatured: true,
      badgeType: 'sale',
      rating: 5,
      reviewCount: 12,
      isSoldOut: false,
      image: '',
      gallery: [],
      detailBanners: [],
      description: 'Authentic imported performance supplement.',
      hasOptions: false,
      variants: ['1 Pack (Standard)']
    };
    openEditorForProduct(newProd);
  };

  // Gallery Reordering logic (Drag & Drop, Move Left/Right, Set Main, Remove)
  const reorderGallery = (fromIndex: number, toIndex: number) => {
    if (!editingProduct) return;
    if (fromIndex === toIndex) return;
    const currentList = [...(editingProduct.gallery || [])];
    if (fromIndex < 0 || fromIndex >= currentList.length) return;
    if (toIndex < 0 || toIndex >= currentList.length) return;

    const [movedItem] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, movedItem);

    setEditingProduct({
      ...editingProduct,
      gallery: currentList,
      image: currentList[0] || ''
    });
    setHasUnsavedChanges(true);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    reorderGallery(index, target);
  };

  const makeMainImage = (index: number) => {
    reorderGallery(index, 0);
  };

  const removeGalleryImage = (index: number) => {
    if (!editingProduct) return;
    const currentList = (editingProduct.gallery || []).filter((_, i) => i !== index);
    setEditingProduct({
      ...editingProduct,
      gallery: currentList,
      image: currentList[0] || ''
    });
    setHasUnsavedChanges(true);
  };

  // Upload helper for Product Gallery Album (Multi-Photo)
  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProduct) return;
    setUploadingGallery(true);
    setSaveError(null);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFileToStorage(files[i], `products/${editingProduct.id}/gallery`);
        if (res.url) uploadedUrls.push(res.url);
      }
      if (uploadedUrls.length > 0) {
        const nextGallery = [...(editingProduct.gallery || []), ...uploadedUrls];
        setEditingProduct((prev) =>
          prev
            ? {
                ...prev,
                image: nextGallery[0] || '',
                gallery: nextGallery
              }
            : prev
        );
        setHasUnsavedChanges(true);
      }
    } catch (err) {
      console.error('Gallery upload error:', err);
      setSaveError('Failed to upload gallery image(s). Please try again.');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Upload helper for Product Detail Banners (Multi-Photo)
  const handleBannerFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProduct) return;
    setUploadingBanners(true);
    setSaveError(null);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFileToStorage(files[i], `products/${editingProduct.id}/banners`);
        if (res.url) uploadedUrls.push(res.url);
      }
      if (uploadedUrls.length > 0) {
        const nextBanners = [...(editingProduct.detailBanners || []), ...uploadedUrls];
        setEditingProduct((prev) =>
          prev ? { ...prev, detailBanners: nextBanners } : prev
        );
      }
    } catch (err) {
      console.error('Detail banner upload error:', err);
      setSaveError('Failed to upload detail banner(s). Please try again.');
    } finally {
      setUploadingBanners(false);
      if (bannersInputRef.current) bannersInputRef.current.value = '';
    }
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    handler: (files: FileList | null) => Promise<void>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handler(e.dataTransfer.files);
    }
  };

  const handleSaveSpecifications = async () => {
    if (!editingProduct) return;
    const trimmedName = (editingProduct.name || '').trim();
    if (!trimmedName) {
      setSaveError('Supplement name is required.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const galleryList = (editingProduct.gallery || []).filter(Boolean);
      const bannersList = (editingProduct.detailBanners || []).filter(Boolean);
      const cleanPrice = Math.max(0, Number(editingProduct.price) || 0);
      const cleanOrigPrice = Math.max(
        0,
        Number(editingProduct.originalPrice ?? cleanPrice) || cleanPrice
      );
      const cleanStock = editingProduct.isSoldOut
        ? 0
        : Math.max(1, Number(editingProduct.stock ?? 50) || 50);

      const discountPercentage =
        cleanOrigPrice > cleanPrice
          ? Math.round(((cleanOrigPrice - cleanPrice) / cleanOrigPrice) * 100)
          : 0;

      // The first image in the saved gallery automatically becomes the main product image
      const primaryImage = galleryList[0] || '';

      const finalProduct: Product = {
        ...editingProduct,
        name: trimmedName,
        brand: (editingProduct.brand || 'FitYatra').trim(),
        category: (editingProduct.category || 'Supplements').trim(),
        price: cleanPrice,
        originalPrice: cleanOrigPrice,
        stock: cleanStock,
        isSoldOut: Boolean(editingProduct.isSoldOut) || cleanStock <= 0,
        image: primaryImage,
        gallery: galleryList,
        detailBanners: bannersList,
        discountPercentage,
        badgeType: editingProduct.isSoldOut || cleanStock <= 0 ? 'soldout' : 'sale'
      };

      await onSaveProduct(finalProduct);
      setEditingProduct(null);
      setHasUnsavedChanges(false);
      setSaveSuccessBanner(`Saved "${finalProduct.name}" to Firebase successfully.`);
      setTimeout(() => setSaveSuccessBanner(null), 4000);
    } catch (err: any) {
      console.error('Failed to save product specifications to Firebase:', err);
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

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* ACTIVE SUPPLEMENTS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-900">
              ACTIVE SUPPLEMENTS
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage active listings, pricing, and product gallery specifications
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewProduct}
          className="bg-black hover:bg-neutral-800 text-white font-black text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#FACC15]" />
          <span>NEW SUPPLEMENT</span>
        </button>
      </div>

      {/* Firebase Save Confirmation Toast */}
      {saveSuccessBanner && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search supplements by name, brand, or category..."
          className="w-full bg-white border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-neutral-900"
        />
      </div>

      {/* ACTIVE SUPPLEMENTS LIST ROWS */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-neutral-200/90 p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 hover:border-neutral-300 transition-colors"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl border border-neutral-100 bg-neutral-50 p-1.5 shrink-0 overflow-hidden flex items-center justify-center">
                <ResolvedThumb
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="min-w-0 space-y-0.5 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">
                  {product.brand} • {product.category}
                </div>
                <h3 className="text-xs sm:text-base font-black text-neutral-900 line-clamp-2 sm:truncate">
                  {product.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
                  <span className="text-xs sm:text-sm font-black text-neutral-900">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-[10px] sm:text-[11px] text-neutral-400 line-through">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {product.isSoldOut && (
                    <span className="text-[9px] font-black uppercase bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => openEditorForProduct(product)}
                className="border border-neutral-800 bg-white hover:bg-neutral-900 hover:text-white text-neutral-900 text-[10px] font-black uppercase tracking-wider px-3 sm:px-3.5 py-1.5 rounded transition-colors cursor-pointer"
              >
                EDIT DETAILS
              </button>

              {confirmDeleteId === product.id ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await onDeleteProduct(product.id);
                      setConfirmDeleteId(null);
                      setSaveSuccessBanner('Supplement deleted from Firebase.');
                      setTimeout(() => setSaveSuccessBanner(null), 3000);
                    } catch (err) {
                      console.error('Delete product failed:', err);
                    }
                  }}
                  className="border border-red-600 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 sm:px-3.5 py-1.5 rounded cursor-pointer"
                >
                  CONFIRM
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(product.id)}
                  className="border border-red-200 bg-red-50/40 hover:bg-red-600 hover:text-white text-red-600 text-[10px] font-black uppercase tracking-wider px-3 sm:px-3.5 py-1.5 rounded transition-colors cursor-pointer"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FULL-SCREEN MOBILE-RESPONSIVE ADMIN PRODUCT EDITOR */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto overscroll-contain">
          <div className="min-h-full flex flex-col bg-white">
            {/* Top Sticky Header */}
            <div className="sticky top-0 z-20 border-b border-neutral-100 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between bg-white/95 backdrop-blur-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 truncate">
                  EDIT SUPPLEMENT: {editingProduct.brand ? `${editingProduct.brand.toUpperCase()} ` : ''}
                  {editingProduct.name.toUpperCase()}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-neutral-900 p-1.5 -mr-1 transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-5 sm:py-6 space-y-5 pb-12">
              {/* Row 1: BRAND DESIGNATION + CATEGORY CLASSIFICATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    BRAND DESIGNATION
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, brand: e.target.value })
                    }
                    placeholder="e.g. HK Vitals"
                    className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    CATEGORY CLASSIFICATION
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                  >
                    {!CATEGORY_OPTIONS.includes(editingProduct.category) &&
                      editingProduct.category && (
                        <option value={editingProduct.category}>
                          {editingProduct.category}
                        </option>
                      )}
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: SUPPLEMENT FULL NAME LABEL */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                  SUPPLEMENT FULL NAME LABEL
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  placeholder="e.g. Skin Radiance Collagen - Glow Formula"
                  className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                />
              </div>

              {/* Row 3: ADJUSTED PRICE (RS.) + COMPARE-AT / ORIGINAL PRICE (RS.) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    ADJUSTED PRICE (RS.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value === '' ? 0 : Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#FAFAFA] border border-[#FDE047] rounded-lg px-3.5 py-2.5 text-sm font-bold text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    COMPARE-AT / ORIGINAL PRICE (RS.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.originalPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: e.target.value === '' ? 0 : Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-600 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>
              </div>

              {/* Row 4: TOTAL SERVINGS COUNT + SERVING SIZE WEIGHT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    TOTAL SERVINGS COUNT
                  </label>
                  <input
                    type="text"
                    value={editingProduct.servings || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, servings: e.target.value })
                    }
                    placeholder="e.g. 25 Servings"
                    className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    SERVING SIZE WEIGHT
                  </label>
                  <input
                    type="text"
                    value={editingProduct.servingSize || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, servingSize: e.target.value })
                    }
                    placeholder="e.g. 8g"
                    className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>
              </div>

              {/* Row 4b: STOCK QUANTITY + PRODUCT DESCRIPTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    STOCK QUANTITY
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.stock ?? 50}
                    onChange={(e) => {
                      const nextStock = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                      setEditingProduct({
                        ...editingProduct,
                        stock: nextStock,
                        isSoldOut: nextStock <= 0
                      });
                    }}
                    className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    SHORT TAGLINE / SUBTITLE
                  </label>
                  <input
                    type="text"
                    value={editingProduct.tagline || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, tagline: e.target.value })
                    }
                    placeholder="e.g. Recover faster. Lift heavier."
                    className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                  PRODUCT DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  placeholder="Enter product description..."
                  className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                />
              </div>

              {/* Product Image Gallery (Unified with Drag-and-Drop Reordering) */}
              <div className="border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-4 bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        <span>Product Image Gallery</span>
                      </span>
                      <span className="bg-neutral-900 text-[#FACC15] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        Drag &amp; Drop Order
                      </span>
                      {hasUnsavedChanges && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                          Unsaved Order
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Drag and drop images into your preferred display order. The <strong className="text-neutral-900 font-bold">1st image</strong> automatically becomes the main product photo across the store.
                    </p>
                  </div>

                  {(editingProduct.gallery || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowOrderPreview(!showOrderPreview)}
                      className="self-start sm:self-auto text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showOrderPreview ? 'Hide Order Preview' : 'Preview Live Order'}</span>
                    </button>
                  )}
                </div>

                {/* Optional Live Order Sequence Bar */}
                {showOrderPreview && (editingProduct.gallery || []).length > 0 && (
                  <div className="bg-[#FAF9F6] border border-amber-200/80 rounded-xl p-3 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      Live Store Display Sequence Preview:
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {(editingProduct.gallery || []).map((imgUrl, i) => (
                        <div key={`preview-order-${i}`} className="flex items-center gap-1.5 shrink-0">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-300 bg-white shadow-xs">
                            <ResolvedThumb
                              src={imgUrl}
                              alt={`Seq ${i + 1}`}
                              className="w-full h-full object-contain"
                            />
                            <span
                              className={`absolute bottom-0 inset-x-0 text-center text-[9px] font-black py-0.5 ${
                                i === 0 ? 'bg-[#FACC15] text-neutral-900' : 'bg-neutral-900/80 text-white'
                              }`}
                            >
                              {i === 0 ? 'Main' : `#${i + 1}`}
                            </span>
                          </div>
                          {i < (editingProduct.gallery || []).length - 1 && (
                            <span className="text-neutral-400 font-bold text-xs">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Trigger / Dropzone */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleGalleryFiles(e.target.files)
                  }
                  className="hidden"
                />

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, handleGalleryFiles)}
                  onClick={() => galleryInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-200 hover:border-amber-400 rounded-xl py-5 px-4 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-amber-50/20"
                >
                  {uploadingGallery ? (
                    <Loader2 className="w-6 h-6 text-[#D97706] animate-spin mx-auto mb-1.5" />
                  ) : (
                    <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
                  )}
                  <p className="text-xs font-bold text-neutral-800">
                    Add Photos to Product Gallery
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Drag &amp; drop files here, or <span className="text-[#D97706] underline font-semibold">browse computer</span> (Select single or multiple)
                  </p>
                </div>

                {/* Gallery Cards Grid with Drag-and-Drop and Touch Reordering */}
                {(editingProduct.gallery || []).length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 px-0.5">
                      <span>{(editingProduct.gallery || []).length} image{(editingProduct.gallery || []).length > 1 ? 's' : ''} in gallery</span>
                      <span className="hidden sm:inline">Tip: Drag any card to rearrange, or use arrows &amp; &apos;Set 1st&apos; buttons</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(editingProduct.gallery || []).map((imgUrl, idx) => {
                        const isPrimary = idx === 0;
                        const isBeingDragged = draggedIndex === idx || touchDraggingIndex === idx;
                        const isDropTarget = dragOverIndex === idx && !isBeingDragged;

                        return (
                          <div
                            key={`gallery-card-${idx}-${imgUrl.slice(-20)}`}
                            data-gallery-index={idx}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', String(idx));
                              e.dataTransfer.effectAllowed = 'move';
                              setDraggedIndex(idx);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              if (dragOverIndex !== idx) {
                                setDragOverIndex(idx);
                              }
                            }}
                            onDragLeave={() => {
                              if (dragOverIndex === idx) {
                                setDragOverIndex(null);
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const sourceIdx =
                                draggedIndex !== null ? draggedIndex : Number(e.dataTransfer.getData('text/plain'));
                              if (!isNaN(sourceIdx)) {
                                reorderGallery(sourceIdx, idx);
                              }
                              setDraggedIndex(null);
                              setDragOverIndex(null);
                            }}
                            onDragEnd={() => {
                              setDraggedIndex(null);
                              setDragOverIndex(null);
                            }}
                            className={`relative aspect-square p-1.5 bg-white rounded-xl border transition-all duration-150 flex flex-col justify-between group select-none ${
                              isDropTarget
                                ? 'border-[#EAB308] ring-3 ring-[#EAB308]/40 scale-[1.03] shadow-lg bg-amber-50/40 z-20'
                                : isBeingDragged
                                ? 'opacity-40 border-dashed border-amber-500 scale-95 shadow-inner'
                                : 'border-neutral-200/90 hover:border-neutral-300 shadow-xs'
                            }`}
                          >
                            {/* Drop indicator banner when dragging over */}
                            {isDropTarget && (
                              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#EAB308] text-neutral-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md z-30 pointer-events-none whitespace-nowrap">
                                Drop Here (Position #{idx + 1})
                              </div>
                            )}

                            {/* Top Badges & Drag Handle */}
                            <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
                              {/* Position / Main badge */}
                              {isPrimary ? (
                                <span className="bg-[#FACC15] text-neutral-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-neutral-950" />
                                  <span>Main Image</span>
                                </span>
                              ) : (
                                <span className="bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
                                  #{idx + 1}
                                </span>
                              )}

                              {/* Drag Handle (Supports both desktop grab and touch dragging) */}
                              <div
                                onTouchStart={(e) => {
                                  e.stopPropagation();
                                  setTouchDraggingIndex(idx);
                                }}
                                onTouchMove={(e) => {
                                  if (touchDraggingIndex === null) return;
                                  const touch = e.touches[0];
                                  const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                                  const card = elem?.closest('[data-gallery-index]');
                                  if (card) {
                                    const targetIdx = Number(card.getAttribute('data-gallery-index'));
                                    if (!isNaN(targetIdx) && targetIdx !== dragOverIndex) {
                                      setDragOverIndex(targetIdx);
                                    }
                                  }
                                }}
                                onTouchEnd={() => {
                                  if (
                                    touchDraggingIndex !== null &&
                                    dragOverIndex !== null &&
                                    touchDraggingIndex !== dragOverIndex
                                  ) {
                                    reorderGallery(touchDraggingIndex, dragOverIndex);
                                  }
                                  setTouchDraggingIndex(null);
                                  setDragOverIndex(null);
                                }}
                                className="pointer-events-auto p-1 bg-black/75 hover:bg-black text-white rounded cursor-grab active:cursor-grabbing transition-opacity shadow-xs"
                                title="Drag handle to reorder"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>
                            </div>

                            {/* Image Thumbnail */}
                            <div className="w-full h-full rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center pt-5 pb-7">
                              <ResolvedThumb
                                src={imgUrl}
                                alt={`Product photo ${idx + 1}`}
                                className="w-full h-full object-contain pointer-events-none"
                              />
                            </div>

                            {/* Bottom Card Bar / Controls */}
                            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1 z-10">
                              {/* Move Left / Right buttons for mobile touch & keyboard/click */}
                              <div className="flex items-center gap-0.5 bg-white/95 backdrop-blur-xs p-0.5 rounded-lg border border-neutral-200/90 shadow-xs">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(idx, 'left');
                                  }}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-neutral-100 disabled:opacity-25 disabled:pointer-events-none rounded text-neutral-700 cursor-pointer transition-colors"
                                  title="Move Left"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImage(idx, 'right');
                                  }}
                                  disabled={idx === (editingProduct.gallery || []).length - 1}
                                  className="p-1 hover:bg-neutral-100 disabled:opacity-25 disabled:pointer-events-none rounded text-neutral-700 cursor-pointer transition-colors"
                                  title="Move Right"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Make Main Button (if not first) */}
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      makeMainImage(idx);
                                    }}
                                    className="bg-white/95 hover:bg-[#FACC15] text-neutral-800 hover:text-neutral-950 font-bold text-[9px] uppercase px-1.5 py-1 rounded-lg border border-neutral-200/90 shadow-xs transition-colors cursor-pointer"
                                    title="Move to 1st position (Make Main Product Image)"
                                  >
                                    Set 1st
                                  </button>
                                )}

                                {/* Preview Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewModalUrl(imgUrl);
                                  }}
                                  className="p-1 bg-white/95 hover:bg-neutral-100 text-neutral-700 rounded-lg border border-neutral-200/90 shadow-xs cursor-pointer transition-colors"
                                  title="Preview image"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>

                                {/* Remove Button (Does not delete file from storage) */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeGalleryImage(idx);
                                  }}
                                  className="p-1 bg-white/95 hover:bg-red-500 hover:text-white text-neutral-600 rounded-lg border border-neutral-200/90 shadow-xs cursor-pointer transition-colors"
                                  title="Remove from product gallery"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic text-center py-3">
                    No images in product gallery yet. Upload photos above.
                  </p>
                )}
              </div>

              {/* Block 7: PRODUCT DETAIL BANNERS (MULTI-PHOTO) */}
              <div className="space-y-2">
                <div className="border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-4 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      PRODUCT DETAIL BANNERS
                    </span>
                    <span className="bg-neutral-900 text-[#FACC15] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded shrink-0">
                      MULTI-PHOTO
                    </span>
                  </div>

                  <input
                    ref={bannersInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleBannerFiles(e.target.files)
                    }
                    className="hidden"
                  />

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, handleBannerFiles)}
                    onClick={() => bannersInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-200 hover:border-neutral-300 rounded-xl py-6 sm:py-7 px-4 text-center cursor-pointer transition-colors bg-white"
                  >
                    {uploadingBanners ? (
                      <Loader2 className="w-6 h-6 text-[#D97706] animate-spin mx-auto mb-2" />
                    ) : (
                      <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                    )}
                    <p className="text-xs font-bold text-neutral-700">
                      Drag &amp; Drop gallery pictures here
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      or <span className="text-[#D97706] underline font-semibold">browse files</span> on your computer
                    </p>
                  </div>

                  {(editingProduct.detailBanners || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(editingProduct.detailBanners || []).map((imgUrl, idx) => (
                        <div
                          key={`${imgUrl}-${idx}`}
                          className="aspect-square p-1.5 bg-white border border-neutral-200 rounded-xl shadow-xs relative group"
                        >
                          <ResolvedThumb
                            src={imgUrl}
                            alt={`Detail Banner ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = (editingProduct.detailBanners || []).filter(
                                (_, i) => i !== idx
                              );
                              setEditingProduct({ ...editingProduct, detailBanners: next });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs shadow-md cursor-pointer"
                            aria-label="Remove banner image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 pl-1">
                  Extra graphical images/banners shown below the description to offer more visual details about the product.
                </p>
              </div>

              {/* Row 8: INVENTORY STATUS FLAG */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                  INVENTORY STATUS FLAG
                </label>
                <select
                  value={editingProduct.isSoldOut ? 'soldout' : 'instock'}
                  onChange={(e) => {
                    const soldOut = e.target.value === 'soldout';
                    setEditingProduct({
                      ...editingProduct,
                      isSoldOut: soldOut,
                      stock: soldOut ? 0 : Math.max(1, editingProduct.stock || 50)
                    });
                  }}
                  className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm font-bold text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                >
                  <option value="instock">In Stock (Enable Add to Cart)</option>
                  <option value="soldout">Sold Out (Disable Add to Cart)</option>
                </select>
              </div>

              {/* Error Banner if Save Fails */}
              {saveError && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Bottom Action Buttons (Mobile & Desktop friendly) */}
              <div className="pt-4 pb-8 flex items-center gap-3 sm:gap-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-black text-[11px] uppercase tracking-wider py-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={handleSaveSpecifications}
                  disabled={isSaving || uploadingGallery || uploadingBanners}
                  className="flex-[1.35] bg-black hover:bg-neutral-900 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-wider py-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  {isSaving ? 'SAVING...' : 'SAVE SPECIFICATIONS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal for Image Gallery */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-60 bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[85vh] bg-white p-2 rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-3 right-3 bg-neutral-900 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors cursor-pointer z-10"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
            <ResolvedThumb
              src={previewModalUrl}
              alt="Gallery Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
