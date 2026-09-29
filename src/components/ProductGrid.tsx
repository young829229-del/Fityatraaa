import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
}

export default function ProductGrid({
  products,
  onSelectProduct,
  onAddToCartDirect
}: ProductGridProps) {
  const activeProducts = products.filter((p) => p.isActive !== false);

  return (
    <section id="catalog" className="pt-10 sm:pt-14 pb-12 bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Our Most Loved Products
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-sm sm:max-w-md mx-auto leading-relaxed">
            Know what healthy people are consuming daily.
          </p>
        </div>

        {/* 2-Column Mobile, Responsive Desktop Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-7">
          {activeProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCartDirect={onAddToCartDirect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
