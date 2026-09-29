import { ProductBenefit } from '../../types';

interface ProductBenefitsProps {
  heading?: string;
  benefits?: ProductBenefit[];
}

export default function ProductBenefits({
  heading = 'PRODUCT BENEFITS',
  benefits = []
}: ProductBenefitsProps) {
  const activeBenefits = benefits.filter((b) => b.enabled !== false);

  if (activeBenefits.length === 0) return null;

  return (
    <section className="w-full py-10 sm:py-14 bg-neutral-50 border-t border-neutral-200/80">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
            PROVEN PERFORMANCE
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-950 tracking-tight mt-1">
            {heading}
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {activeBenefits.map((item, index) => {
            const isEmoji = !item.icon.startsWith('http') && !item.icon.startsWith('/');

            return (
              <div
                key={item.id || index}
                className="bg-white p-5 sm:p-6 border border-neutral-200/90 shadow-xs flex items-start gap-4 transition-all hover:border-neutral-900 group"
              >
                {/* Icon or Emoji Container */}
                <div className="w-12 h-12 shrink-0 bg-neutral-100 border border-neutral-200 flex items-center justify-center text-2xl group-hover:bg-[#FFCD00]/20 transition-colors">
                  {isEmoji ? (
                    <span>{item.icon}</span>
                  ) : (
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-7 h-7 object-contain"
                    />
                  )}
                </div>

                {/* Title & Description */}
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
