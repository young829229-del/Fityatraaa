import { useState } from 'react';
import {
  Star,
  Search,
  AlertTriangle,
  Sparkles,
  Trash2,
  Plus,
  Edit2,
  EyeOff,
  Check,
  Calendar,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { ReviewRecord, Product } from '../../types';
import ImageUploader from './ImageUploader';
import { useResolvedMediaUrl } from '../../services/storageService';

function AdminResolvedPhoto({
  src,
  alt,
  onClick,
  className
}: {
  src?: string;
  alt: string;
  onClick?: () => void;
  className?: string;
}) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) return null;
  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      onClick={onClick}
      className={className}
    />
  );
}

interface AdminReviewsTabProps {
  reviews: ReviewRecord[];
  products?: Product[];
  onSaveReview: (review: ReviewRecord) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
}

export default function AdminReviewsTab({
  reviews = [],
  products = [],
  onSaveReview,
  onDeleteReview
}: AdminReviewsTabProps) {
  const [filterTab, setFilterTab] = useState<
    'all' | 'approved' | 'pending' | 'rejected' | 'featured' | 'attention'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReview, setEditingReview] = useState<ReviewRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sort reviews by displayOrder ascending, then createdAt descending
  const sortedReviews = [...reviews].sort((a, b) => {
    const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 9999;
    const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 9999;
    if (orderA !== orderB) return orderA - orderB;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  const filteredReviews = sortedReviews.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'pending') return r.status === 'pending';
    if (filterTab === 'approved') return r.status === 'approved';
    if (filterTab === 'rejected') return r.status === 'rejected';
    if (filterTab === 'featured') return !!r.isFeatured;
    if (filterTab === 'attention') return !!r.isAttention;
    return true;
  });

  const handleAddNewReview = () => {
    const defaultProd = products[0];
    const minOrder =
      sortedReviews.length > 0
        ? Math.min(...sortedReviews.map((r, i) => (typeof r.displayOrder === 'number' ? r.displayOrder : i + 1))) - 1
        : 1;

    const newRev: ReviewRecord = {
      id: `rev-${Date.now()}`,
      productId: defaultProd?.id || 'wellcore-creatine',
      productName: defaultProd?.name || 'Wellcore Micronised Creatine Monohydrate',
      name: '',
      location: '',
      rating: 5,
      comment: '',
      imageUrl: '',
      status: 'approved',
      isFeatured: true,
      isAttention: false,
      verified: true,
      displayOrder: Math.max(1, minOrder),
      createdAt: new Date().toISOString()
    };
    setEditingReview(newRev);
  };

  const handleSetStatus = async (review: ReviewRecord, status: ReviewRecord['status']) => {
    await onSaveReview({ ...review, status });
  };

  const handleToggleVerified = async (review: ReviewRecord) => {
    await onSaveReview({ ...review, verified: !(review.verified ?? true) });
  };

  const handleToggleFeatured = async (review: ReviewRecord) => {
    await onSaveReview({ ...review, isFeatured: !review.isFeatured, status: 'approved' });
  };

  const handleToggleAttention = async (review: ReviewRecord) => {
    await onSaveReview({ ...review, isAttention: !review.isAttention });
  };

  const handleMoveReview = async (indexInFiltered: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? indexInFiltered - 1 : indexInFiltered + 1;
    if (targetIndex < 0 || targetIndex >= filteredReviews.length) return;

    // Assign sequential displayOrder across sortedReviews and swap the two items
    const fullList = [...sortedReviews];
    const itemA = filteredReviews[indexInFiltered];
    const itemB = filteredReviews[targetIndex];
    const idxA = fullList.findIndex((r) => r.id === itemA.id);
    const idxB = fullList.findIndex((r) => r.id === itemB.id);
    if (idxA === -1 || idxB === -1) return;

    // Swap in fullList
    const temp = fullList[idxA];
    fullList[idxA] = fullList[idxB];
    fullList[idxB] = temp;

    // Save updated displayOrder for affected items
    await Promise.all(
      fullList.map((rev, idx) => {
        const desiredOrder = idx + 1;
        if (rev.displayOrder !== desiredOrder) {
          return onSaveReview({ ...rev, displayOrder: desiredOrder });
        }
        return Promise.resolve();
      })
    );
  };

  const formatReviewDate = (iso?: string) => {
    if (!iso) return 'Verified Buyer';
    try {
      return new Date(iso).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Customer Review Carousel Manager
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Add, edit, reorder, verify, and publish customer reviews with direct photo uploads. Only Published (Approved) reviews appear in the storefront carousel.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewReview}
          className="bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FFCD00]" />
          <span>+ Add Customer Review</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-white p-2 rounded-xl border border-neutral-200 overflow-x-auto text-xs font-bold no-scrollbar">
        {[
          { id: 'all', label: `All (${reviews.length})` },
          {
            id: 'approved',
            label: `Published / Approved (${reviews.filter((r) => r.status === 'approved').length})`
          },
          {
            id: 'pending',
            label: `Pending (${reviews.filter((r) => r.status === 'pending').length})`
          },
          {
            id: 'rejected',
            label: `Unpublished / Hidden (${reviews.filter((r) => r.status === 'rejected').length})`
          },
          {
            id: 'featured',
            label: `★ Featured (${reviews.filter((r) => r.isFeatured).length})`
          },
          {
            id: 'attention',
            label: `⚠️ Attention (${reviews.filter((r) => r.isAttention).length})`
          }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === tab.id
                ? 'bg-neutral-900 text-white font-black'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, product reviewed, or review text..."
          className="w-full bg-white border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-neutral-900"
        />
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 text-center text-neutral-400 text-xs rounded-2xl border border-neutral-200">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((review, index) => {
            const isVerified = review.verified ?? true;
            const isPublished = review.status === 'approved';
            return (
              <div
                key={review.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                  review.isAttention
                    ? 'border-amber-400 ring-2 ring-amber-300/40 bg-amber-50/20'
                    : 'border-neutral-200/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Reorder Controls + Customer Photo + Review Details */}
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Reorder Up / Down Controls */}
                    <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveReview(index, 'up')}
                        disabled={index === 0}
                        title="Move review earlier in carousel"
                        className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-black disabled:opacity-25 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-neutral-400">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveReview(index, 'down')}
                        disabled={index === filteredReviews.length - 1}
                        title="Move review later in carousel"
                        className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-black disabled:opacity-25 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {review.imageUrl && (
                      <AdminResolvedPhoto
                        src={review.imageUrl}
                        alt={review.name}
                        onClick={() => setPreviewPhoto(review.imageUrl || null)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-neutral-200 shrink-0 cursor-pointer hover:opacity-90"
                      />
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex text-amber-500">
                          {[...Array(Math.max(1, Math.min(5, review.rating || 5)))].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>

                        {isVerified && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Verified Buyer
                          </span>
                        )}

                        {review.isFeatured && (
                          <span className="bg-[#FFCD00] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Featured
                          </span>
                        )}

                        {review.isAttention && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                            Attention
                          </span>
                        )}

                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : review.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {isPublished
                            ? 'Published on Storefront'
                            : review.status === 'rejected'
                            ? 'Unpublished / Hidden'
                            : 'Pending Moderation'}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-neutral-900 leading-relaxed pt-0.5">
                        &ldquo;{review.comment}&rdquo;
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500 pt-1">
                        <span className="text-neutral-900 font-bold">{review.name}</span>
                        {review.location && <span>• {review.location}</span>}
                        {review.productName && (
                          <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-mono text-[10px]">
                            Product: {review.productName}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex flex-wrap sm:flex-col items-end gap-1.5 shrink-0 pt-2 sm:pt-0">
                    <div className="flex items-center gap-1.5">
                      {!isPublished ? (
                        <button
                          type="button"
                          onClick={() => handleSetStatus(review, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetStatus(review, 'rejected')}
                          className="px-2.5 py-1.5 bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-700 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Unpublish or hide from public carousel"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Unpublish</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleVerified(review)}
                        className={`px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isVerified ? 'Verified' : 'Unverified'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(review)}
                        className={`px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                          review.isFeatured
                            ? 'bg-[#FFCD00] text-black font-black'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {review.isFeatured ? '★ Featured' : 'Feature'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAttention(review)}
                        className={`px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                          review.isAttention
                            ? 'bg-amber-500 text-white font-black'
                            : 'bg-neutral-100 hover:bg-amber-100 text-neutral-700'
                        }`}
                      >
                        {review.isAttention ? '⚠️ Attention' : 'Flag'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setEditingReview(review)}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer"
                        title="Edit review"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteId === review.id ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteReview(review.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(review.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDIT / CREATE REVIEW MODAL */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-neutral-900">
                {reviews.some((r) => r.id === editingReview.id)
                  ? 'Edit Customer Review'
                  : 'Add Customer Review'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-neutral-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  value={editingReview.name}
                  onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                  placeholder="e.g. Rupesh T."
                  className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                  City / Location (Optional)
                </label>
                <input
                  type="text"
                  value={editingReview.location || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, location: e.target.value })}
                  placeholder="e.g. Kathmandu"
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                  Product Reviewed (Optional)
                </label>
                {products.length > 0 ? (
                  <select
                    value={editingReview.productId || ''}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setEditingReview({
                          ...editingReview,
                          productId: '',
                          productName: ''
                        });
                        return;
                      }
                      const prod = products.find((p) => p.id === e.target.value);
                      setEditingReview({
                        ...editingReview,
                        productId: prod?.id || e.target.value,
                        productName: prod?.name || editingReview.productName
                      });
                    }}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  >
                    <option value="">General Storefront Review</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editingReview.productName || ''}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, productName: e.target.value })
                    }
                    placeholder="e.g. Wellcore Creatine"
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                  Star Rating (1 - 5)
                </label>
                <div className="flex items-center gap-1.5 p-2 bg-neutral-50 border border-neutral-300 rounded-lg">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setEditingReview({ ...editingReview, rating: starVal })}
                      className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          starVal <= (editingReview.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-bold text-neutral-700">
                    {editingReview.rating || 5} / 5
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                Review Text *
              </label>
              <textarea
                value={editingReview.comment}
                onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                placeholder="Write the customer's review text..."
                rows={3}
                className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                  Publish Status
                </label>
                <select
                  value={editingReview.status}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      status: e.target.value as ReviewRecord['status']
                    })
                  }
                  className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                >
                  <option value="approved">Published (Approved on Storefront)</option>
                  <option value="pending">Pending Moderation (Hidden)</option>
                  <option value="rejected">Unpublished / Hidden</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 block mb-1">
                  Carousel Order Position
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingReview.displayOrder ?? 1}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      displayOrder: Number(e.target.value)
                    })
                  }
                  className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={editingReview.verified ?? true}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, verified: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Verified Purchase Badge</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={Boolean(editingReview.isFeatured)}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Featured on All Product Pages</span>
              </label>
            </div>

            {/* Direct Customer Review Photo Upload (NO URL input) */}
            <div>
              <ImageUploader
                label="Reviewer Photo (Direct File Upload)"
                folder="reviews"
                images={editingReview.imageUrl ? [editingReview.imageUrl] : []}
                onChange={(urls) => setEditingReview({ ...editingReview, imageUrl: urls[0] || '' })}
                multiple={false}
                maxFiles={1}
                helperText="Upload a customer or product unboxing photo directly from your phone or computer."
              />
            </div>

            {saveError && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-3 py-2 rounded-lg text-xs font-bold">
                {saveError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  setSaveError(null);
                  setEditingReview(null);
                }}
                className="px-3 py-2 text-xs font-bold text-neutral-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingReview.name.trim() || !editingReview.comment.trim()) return;
                  setIsSavingReview(true);
                  setSaveError(null);
                  try {
                    await onSaveReview({
                      ...editingReview,
                      name: editingReview.name.trim(),
                      comment: editingReview.comment.trim()
                    });
                    setEditingReview(null);
                  } catch (err: any) {
                    console.error('Failed to save review to Firebase:', err);
                    setSaveError('Failed to save changes. Please try again.');
                  } finally {
                    setIsSavingReview(false);
                  }
                }}
                disabled={isSavingReview || !editingReview.name.trim() || !editingReview.comment.trim()}
                className="px-4 py-2 bg-neutral-950 disabled:opacity-40 text-white text-xs font-black uppercase rounded-lg cursor-pointer"
              >
                {isSavingReview ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-neutral-950/85 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <AdminResolvedPhoto
            src={previewPhoto}
            alt="Customer Review"
            className="max-w-xl max-h-[85vh] rounded-2xl object-contain bg-white p-2 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
