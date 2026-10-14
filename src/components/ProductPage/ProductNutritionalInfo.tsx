import { Product } from '../../types';

interface ProductNutritionalInfoProps {
  product: Product;
}

export default function ProductNutritionalInfo({ product }: ProductNutritionalInfoProps) {
  // Determine nutritional stats based on category/name
  const isProtein =
    product.category?.toLowerCase().includes('protein') ||
    product.name?.toLowerCase().includes('whey') ||
    product.id?.includes('whey');

  const stats = [
    {
      icon: isProtein ? '💪' : '💪',
      value: isProtein ? '24g' : '3g',
      label: isProtein ? 'Protein per scoop' : 'Creapure® per scoop'
    },
    {
      icon: isProtein ? '🧬' : '⚡',
      value: isProtein ? '5.5g' : '100%',
      label: isProtein ? 'BCAAs' : 'Micronized'
    },
    {
      icon: isProtein ? '🔥' : '🔥',
      value: isProtein ? '120' : '0',
      label: isProtein ? 'Calories per scoop' : 'Zero Calories'
    },
    {
      icon: isProtein ? '🥄' : '🥄',
      value: isProtein ? '30' : (product.servings ? product.servings.split(' ')[0] : '83'),
      label: isProtein ? 'Servings per tub' : 'Servings per tub'
    }
  ];

  const activeBenefits = (product.benefits || []).filter((b) => b.enabled !== false);

  return (
    <div className="w-full space-y-3 py-1">
      {/* 4-Box Nutritional Stats Grid */}
      <div className="bg-[#f8f9fa] border border-neutral-200/80 rounded-2xl overflow-hidden grid grid-cols-2 divide-x divide-y divide-neutral-200/80 shadow-xs">
        {stats.map((s, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-3 sm:p-4 text-center">
            <span className="text-xl sm:text-2xl mb-1 select-none">{s.icon}</span>
            <span className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight leading-none">
              {s.value}
            </span>
            <span className="text-[11px] sm:text-xs text-neutral-500 font-medium mt-1 leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Product Key Benefits highlights when configured */}
      {activeBenefits.length > 0 && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
              {product.benefitsHeading || 'KEY PRODUCT BENEFITS'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Formula
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeBenefits.slice(0, 4).map((b, idx) => (
              <div
                key={b.id || idx}
                className="flex items-start gap-2.5 text-xs text-neutral-800 bg-neutral-50/70 p-2.5 rounded-xl border border-neutral-100"
              >
                <span className="text-base shrink-0 select-none">{b.icon || '💪'}</span>
                <div>
                  <span className="font-extrabold text-neutral-950 block">{b.title}</span>
                  <span className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed">
                    {b.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
