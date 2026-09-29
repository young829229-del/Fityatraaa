import { CheckCircle2, ShieldCheck, Truck, Headphones } from 'lucide-react';

export default function WhyFitYatra() {
  return (
    <section id="why-fityatra" className="py-8 sm:py-12 bg-white border-t border-neutral-100">
      <div className="max-w-4xl mx-auto px-4">
        {/* Comparison Table Graphic */}
        <div className="w-full rounded-lg overflow-hidden border border-neutral-200/80 shadow-xs mb-8">
          <img
            src="https://i.ibb.co/rRCNBQMZ/gpt-image-2-Create-a-comparison-chart-image-titled-WHY-FITYATRA-Style-Clean-minimalist-prof-0-1-1.jpg"
            alt="Why FitYatra vs Others Comparison Chart"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Trust Pillars */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center pt-2">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2 text-neutral-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">100% VERIFIED</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">Quality you can trust</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2 text-neutral-800">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">FAST & TRACKED</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">Delivered nationwide</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2 text-neutral-800">
              <Headphones className="w-5 h-5 text-amber-500" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900">REAL SUPPORT</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">Always here to help</p>
          </div>
        </div>
      </div>
    </section>
  );
}
