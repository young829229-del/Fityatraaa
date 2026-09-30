import { Product } from '../../types';

interface ProductDescriptionProps {
  product?: Product;
  descriptionHtml?: string;
  fallbackDescription?: string;
  onAddToCart?: () => void;
  showCtaButton?: boolean;
}

export default function ProductDescription({
  product,
  descriptionHtml,
  fallbackDescription
}: ProductDescriptionProps) {
  const html = descriptionHtml ?? product?.descriptionHtml;
  const text = fallbackDescription ?? product?.description ?? '';

  return (
    <section className="py-6 sm:py-8 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {html ? (
          <div
            className="text-[#121212]/80 text-[15px] leading-[1.7] space-y-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="text-[#121212]/80 text-[15px] leading-[1.75] space-y-4">
            <p className="whitespace-pre-line">{text}</p>
            {(product?.servings || product?.servingSize) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-200 text-xs">
                {product?.servings && (
                  <div>
                    <span className="text-neutral-500 block">Total Servings</span>
                    <span className="font-bold text-[#121212] text-sm">{product.servings}</span>
                  </div>
                )}
                {product?.servingSize && (
                  <div>
                    <span className="text-neutral-500 block">Serving Size</span>
                    <span className="font-bold text-[#121212] text-sm">{product.servingSize}</span>
                  </div>
                )}
                <div>
                  <span className="text-neutral-500 block">Authenticity</span>
                  <span className="font-bold text-emerald-700 text-sm">100% Lab Verified</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
