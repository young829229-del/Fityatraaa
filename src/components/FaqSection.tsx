import { useState } from 'react';
import { ChevronDown, CheckSquare } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    id: 'ship-nepal',
    question: 'Do you ship all over Nepal?',
    answer: (
      <span>
        Yes, absolutely! We ship to every corner of Nepal because we make sure{' '}
        <strong className="font-bold text-neutral-900">no one is left behind</strong>.
      </span>
    )
  },
  {
    id: 'shipping-time',
    question: 'How long does shipping take?',
    answer: (
      <span>
        Delivery within the Kathmandu Valley is expected within 24 to 36 hours, and for other
        locations across all 7 provinces of Nepal, typically within 36 to 48 hours.
      </span>
    )
  },
  {
    id: 'tracking-number',
    question: 'Will I get a tracking number after making an order?',
    answer: (
      <span>
        Yes! Once your parcel is scanned and handed to our logistics partners (Upaya CityCargo /
        Nepal Can Move / Pathao), you receive an instant live tracking ID.
      </span>
    )
  },
  {
    id: 'guarantee',
    question: "What's your guarantee?",
    answer: (
      <span>
        We offer a 30-day money-back guarantee. If you are not satisfied with the product, just
        reach out within 30 days and we will refund you. No fakes, guaranteed.
      </span>
    )
  },
  {
    id: 'original',
    question: 'Is all product 100% Original?',
    answer: (
      <span>
        Every item is 100% authentic, factory-sealed, and directly sourced from official brand
        distributors. You can verify the security QR and batch code on the manufacturer’s site.
      </span>
    )
  }
];

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<string[]>(['ship-nepal']);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-[#FDFBF7]">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            FAQ
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-[#F3F4F6]/70 rounded-xl overflow-hidden transition-all duration-200 border border-neutral-200/50"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="w-full py-4 px-4 sm:px-5 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-neutral-700 shrink-0" />
                    <span className="font-semibold text-sm sm:text-base text-neutral-900">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-neutral-700 leading-relaxed pl-12">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
