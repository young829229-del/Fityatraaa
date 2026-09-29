interface ProductDescriptionProps {
  descriptionHtml?: string;
  fallbackDescription?: string;
}

export default function ProductDescription({
  descriptionHtml,
  fallbackDescription
}: ProductDescriptionProps) {
  if (!descriptionHtml && !fallbackDescription) return null;

  return (
    <section className="w-full py-8 border-t border-neutral-100">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3">
          Product Details & Scientific Formulation
        </h2>

        {descriptionHtml ? (
          <div
            className="prose prose-neutral max-w-none text-neutral-800 text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        ) : (
          <div className="text-neutral-700 text-sm sm:text-base leading-relaxed space-y-3">
            <p>{fallbackDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
