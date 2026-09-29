interface MoneyBackBannerProps {
  onShopNowClick: () => void;
}

export default function MoneyBackBanner({ onShopNowClick }: MoneyBackBannerProps) {
  return (
    <section id="guarantee" className="bg-black py-4 sm:py-8 px-3 sm:px-6">
      <div
        onClick={onShopNowClick}
        className="max-w-4xl mx-auto cursor-pointer group flex justify-center"
      >
        <img
          src="https://i.ibb.co/dJBH98db/MV2-1-1-1-1.jpg"
          alt="No Risks, Only Gains - Money Back Guarantee FitYatra"
          referrerPolicy="no-referrer"
          className="w-full max-w-2xl h-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
        />
      </div>
    </section>
  );
}
