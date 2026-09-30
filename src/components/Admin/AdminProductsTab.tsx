import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Plus,
  Search,
  Upload,
  Loader2,
  X,
  Image as ImageIcon
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

  // Upload loading states for the 3 dropzones
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingBanners, setUploadingBanners] = useState(false);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const bannersInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditorForProduct = (prod: Product) => {
    const galleryList =
      prod.gallery && prod.gallery.length > 0
        ? prod.gallery
        : prod.image
        ? [prod.image]
        : [];
    const bannersList = prod.detailBanners || [];

    setEditingProduct({
      ...prod,
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

  // Upload helper for Main Supplement Image (Single Photo)
  const handleMainFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProduct) return;
    setUploadingMain(true);
    try {
      const res = await uploadFileToStorage(files[0], `products/${editingProduct.id}/main`);
      if (res.url) {
        setEditingProduct((prev) => (prev ? { ...prev, image: res.url } : prev));
      }
    } catch (err) {
      console.error('Main image upload error:', err);
    } finally {
      setUploadingMain(false);
      if (mainInputRef.current) mainInputRef.current.value = '';
    }
  };

  // Upload helper for Product Gallery Album (Multi-Photo)
  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProduct) return;
    setUploadingGallery(true);
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
                image: prev.image || nextGallery[0] || '',
                gallery: nextGallery
              }
            : prev
        );
      }
    } catch (err) {
      console.error('Gallery upload error:', err);
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Upload helper for Product Detail Banners (Multi-Photo)
  const handleBannerFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProduct) return;
    setUploadingBanners(true);
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
    setIsSaving(true);
    try {
      const galleryList = editingProduct.gallery || [];
      const bannersList = editingProduct.detailBanners || [];

      const discountPercentage =
        editingProduct.originalPrice > editingProduct.price
          ? Math.round(
              ((editingProduct.originalPrice - editingProduct.price) /
                editingProduct.originalPrice) *
                100
            )
          : 0;

      const finalProduct: Product = {
        ...editingProduct,
        image: editingProduct.image || galleryList[0] || '',
        gallery:
          galleryList.length > 0
            ? galleryList
            : editingProduct.image
            ? [editingProduct.image]
            : [],
        detailBanners: bannersList,
        discountPercentage,
        badgeType: editingProduct.isSoldOut ? 'soldout' : 'sale',
        stock: editingProduct.isSoldOut ? 0 : Math.max(1, editingProduct.stock ?? 50)
      };

      await onSaveProduct(finalProduct);
      setEditingProduct(null);
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
                    await onDeleteProduct(product.id);
                    setConfirmDeleteId(null);
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
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value)
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
                    value={editingProduct.originalPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: Number(e.target.value)
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

              {/* Block 5: MAIN SUPPLEMENT IMAGE (SINGLE PHOTO) */}
              <div className="border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-4 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    MAIN SUPPLEMENT IMAGE
                  </span>
                  <span className="bg-neutral-900 text-[#FACC15] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded shrink-0">
                    SINGLE PHOTO
                  </span>
                </div>

                <input
                  ref={mainInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleMainFiles(e.target.files)}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, handleMainFiles)}
                  onClick={() => mainInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-200 hover:border-neutral-300 rounded-xl py-6 sm:py-7 px-4 text-center cursor-pointer transition-colors bg-white"
                >
                  {uploadingMain ? (
                    <Loader2 className="w-6 h-6 text-[#D97706] animate-spin mx-auto mb-2" />
                  ) : (
                    <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                  )}
                  <p className="text-xs font-bold text-neutral-700">
                    Drag &amp; Drop main product picture here
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    or <span className="text-[#D97706] underline font-semibold">browse files</span> on your computer
                  </p>
                </div>

                {editingProduct.image && (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 p-1.5 bg-white border border-neutral-200 rounded-xl shadow-xs relative group">
                    <ResolvedThumb
                      src={editingProduct.image}
                      alt={editingProduct.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs shadow-md cursor-pointer"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Block 6: PRODUCT GALLERY ALBUM (MULTI-PHOTO) */}
              <div className="space-y-2">
                <div className="border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-4 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      PRODUCT GALLERY ALBUM
                    </span>
                    <span className="bg-neutral-900 text-[#FACC15] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded shrink-0">
                      MULTI-PHOTO
                    </span>
                  </div>

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
                    className="border-2 border-dashed border-neutral-200 hover:border-neutral-300 rounded-xl py-6 sm:py-7 px-4 text-center cursor-pointer transition-colors bg-white"
                  >
                    {uploadingGallery ? (
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

                  {(editingProduct.gallery || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(editingProduct.gallery || []).map((imgUrl, idx) => (
                        <div
                          key={`${imgUrl}-${idx}`}
                          className="aspect-square p-1.5 bg-white border border-neutral-200 rounded-xl shadow-xs relative group"
                        >
                          <ResolvedThumb
                            src={imgUrl}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = (editingProduct.gallery || []).filter(
                                (_, i) => i !== idx
                              );
                              setEditingProduct({ ...editingProduct, gallery: next });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs shadow-md cursor-pointer"
                            aria-label="Remove gallery image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 pl-1">
                  These images populate the rotating image gallery at the top of the details view.
                </p>
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
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      isSoldOut: e.target.value === 'soldout'
                    })
                  }
                  className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm font-bold text-neutral-900 focus:outline-none focus:border-[#EAB308]"
                >
                  <option value="instock">In Stock (Enable Add to Cart)</option>
                  <option value="soldout">Sold Out (Disable Add to Cart)</option>
                </select>
              </div>

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
                  disabled={isSaving}
                  className="flex-[1.35] bg-black hover:bg-neutral-900 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-wider py-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  {isSaving ? 'SAVING...' : 'SAVE SPECIFICATIONS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
