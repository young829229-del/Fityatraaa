import { ShoppingBag } from 'lucide-react';

interface ProductDescriptionCtaProps {
  onAddToCart: () => void;
  price: number;
}

export default function ProductDescriptionCta({
  onAddToCart,
  price
}: ProductDescriptionCtaProps) {
  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4">
      <button
        type="button"
        onClick={onAddToCart}
        className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black text-base uppercase tracking-wider py-4 px-6 rounded-none shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>ADD TO CART — Rs {price.toLocaleString()}</span>
      </button>
    </div>
  );
}
