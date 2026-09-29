import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProductFaqItem } from '../../types';
import { DEFAULT_PRODUCT_FAQS } from '../../data/products';

interface ProductFaqSectionProps {
  heading?: string;
  subheading?: string;
  faqs?: ProductFaqItem[];
}

export default function ProductFaqSection({
  heading = 'FAQs',
  subheading = 'Everything you need to know about our products and services',
  faqs
}: ProductFaqSectionProps) {
  // All FAQs closed by default as required
  const [openIds, setOpenIds] = useState<string[]>([]);

  const activeFaqs = (faqs && faqs.length > 0 ? faqs : DEFAULT_PRODUCT_FAQS).filter(
    (f) => f.enabled !== false
  );

  if (activeFaqs.length === 0) return null;

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-[#FAF9F6] border-t border-neutral-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Heading & Subheading */}
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-950 tracking-tight">
            {heading}
          </h2>
          {subheading && (
            <p className="text-sm sm:text-base text-neutral-600 font-medium">
              {subheading}
            </p>
          )}
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200 bg-white">
          {activeFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div key={faq.id} className="w-full">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full py-4 sm:py-5 px-4 sm:px-6 flex items-center justify-between gap-4 text-left hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-neutral-950">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-neutral-950' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-200 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-neutral-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
