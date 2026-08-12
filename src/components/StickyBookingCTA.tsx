import { navigateTo } from '../lib/navigation';
import { getBookingCtaTarget } from '../lib/bookingCta';

export default function StickyBookingCTA() {
  const handleClick = () => {
    if (typeof window === 'undefined') return;
    const target = getBookingCtaTarget(window.location.pathname);
    if (target === '#hero') {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigateTo(target);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 md:hidden pointer-events-none">
      <div className="mx-auto max-w-md rounded-2xl border border-emerald-300/70 bg-white/95 p-2.5 shadow-[0_20px_45px_-25px_rgba(5,150,105,0.75)] backdrop-blur pointer-events-auto">
        <button
          onClick={handleClick}
          className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Enter Route & Check Price
        </button>
      </div>
    </div>
  );
}
