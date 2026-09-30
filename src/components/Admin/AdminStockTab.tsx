import { useState, useEffect } from 'react';
import { AlertCircle, Plus, Minus, Search, Save, Check } from 'lucide-react';
import { Product } from '../../types';
import { useResolvedMediaUrl } from '../../services/storageService';

function StockProductThumb({ src }: { src?: string }) {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) return null;
  return (
    <img
      src={resolved}
      alt=""
      referrerPolicy="no-referrer"
      className="w-full h-full object-contain"
    />
  );
}

interface AdminStockTabProps {
  products: Product[];
  onSaveProduct: (product: Product) => Promise<void>;
}

export default function AdminStockTab({ products = [], onSaveProduct }: AdminStockTabProps) {
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Keep stockMap synced with live products from Firestore
  useEffect(() => {
    setStockMap((prev) => {
      const next: Record<string, number> = { ...prev };
      products.forEach((p) => {
        next[p.id] = typeof p.stock === 'number' ? p.stock : p.isSoldOut ? 0 : 50;
      });
      return next;
    });
  }, [products]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustStock = (productId: string, delta: number) => {
    setStockMap((prev) => {
      const current = prev[productId] ?? 50;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleSaveStock = async (product: Product) => {
    const newStock = Math.max(0, Number(stockMap[product.id] ?? product.stock ?? 50));
    setSavingId(product.id);
    setSaveError(null);
    try {
      await onSaveProduct({
        ...product,
        stock: newStock,
        isSoldOut: newStock <= 0
      });
      setSavedId(product.id);
      setTimeout(() => setSavedId((curr) => (curr === product.id ? null : curr)), 2000);
    } catch (err: any) {
      console.error('Failed to save stock in Firebase:', err);
      setSaveError('Failed to save stock changes. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Stock / Inventory
        </h2>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter inventory by product name..."
          className="w-full bg-white border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-neutral-900"
        />
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-400 uppercase font-mono text-[10px] tracking-wider border-b border-neutral-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredProducts.map((prod) => {
                const stock = stockMap[prod.id] ?? prod.stock ?? 50;
                const isSavingThis = savingId === prod.id;
                const isSaved = savedId === prod.id;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 10;

                return (
                  <tr key={prod.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 p-1 border border-neutral-200 shrink-0">
                          <StockProductThumb src={prod.image} />
                        </div>
                        <div>
                          <span className="font-extrabold text-neutral-900 block truncate max-w-[200px]">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            ID: {prod.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-neutral-600 font-semibold">{prod.category}</td>

                    <td className="py-3 px-4 font-black text-neutral-900">
                      Rs {prod.price.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-neutral-50 p-1 rounded-lg border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(prod.id, -1)}
                          className="w-6 h-6 rounded bg-white hover:bg-neutral-200 text-neutral-700 flex items-center justify-center font-black cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setStockMap({ ...stockMap, [prod.id]: val });
                          }}
                          className="w-12 text-center font-black text-xs bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(prod.id, 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-neutral-200 text-neutral-700 flex items-center justify-center font-black cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block">
                          Low Stock ({stock})
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block">
                          In Stock ({stock})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(prod.id, 10)}
                          className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-bold text-[10px] cursor-pointer"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(prod.id, 50)}
                          className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-bold text-[10px] cursor-pointer"
                        >
                          +50
                        </button>
                        <button
                          type="button"
                          disabled={isSavingThis}
                          onClick={() => handleSaveStock(prod)}
                          className={`px-3 py-1 text-xs font-black uppercase rounded transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                            isSaved
                              ? 'bg-emerald-500 text-white'
                              : 'bg-neutral-900 text-white hover:bg-neutral-800'
                          }`}
                        >
                          {isSaved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                          <span>{isSavingThis ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
