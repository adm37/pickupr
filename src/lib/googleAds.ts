export const GOOGLE_ADS_TAG_ID = 'AW-11308826939';
export const GOOGLE_ADS_DESTINATION_ID = 'AW-11308826939/oEemCISDsuAcELuCvJAq';

type Gtag = (...args: unknown[]) => void;

type ConfirmedBooking = {
  amount: number;
  bookingId: string;
};

export function trackConfirmedBooking(
  booking: ConfirmedBooking,
  gtagOverride?: Gtag,
): boolean {
  const amount = Number(booking.amount);
  const bookingId = String(booking.bookingId || '').trim();
  if (!Number.isFinite(amount) || amount <= 0 || !bookingId) return false;

  const browserGtag = typeof window !== 'undefined'
    ? (window as typeof window & { gtag?: Gtag }).gtag
    : undefined;
  const gtag = gtagOverride || browserGtag;
  if (typeof gtag !== 'function') return false;

  try {
    gtag('event', 'conversion', {
      send_to: GOOGLE_ADS_DESTINATION_ID,
      value: amount,
      currency: 'EUR',
      transaction_id: bookingId,
    });
    return true;
  } catch {
    return false;
  }
}
