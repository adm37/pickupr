import { Clock3, MapPin, Car, Shield } from 'lucide-react';
import Hero from './Hero';
import { getCityRouteByPath } from '../lib/cityLandingRoutes';

function toDurationLabel(durationMin: number): string {
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;

  if (hours <= 0) {
    return `${mins} min`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

export default function CityRouteLandingContent({ path }: { path: string }) {
  const route = getCityRouteByPath(path);

  if (!route) {
    return null;
  }

  const bookingHref = '/#hero';
  const keyword = route.keyword;
  const routeLabel = `${route.origin} to ${route.city}`;
  const heroTitle = `${keyword}`;
  const heroSubtitle = `Book your ${routeLabel} transfer with fixed pricing, private service, and direct confirmation. Complete your reservation in the booking form below.`;

  return (
    <>
      <Hero title={heroTitle} subtitle={heroSubtitle} />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Distance</p>
            <p className="mt-1 text-xl font-black text-zinc-900">{route.distanceKm} km</p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Estimated duration</p>
            <p className="mt-1 text-xl font-black text-zinc-900">{toDurationLabel(route.durationMin)}</p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Private fare from</p>
            <p className="mt-1 text-xl font-black text-zinc-900">EUR {route.priceFrom}</p>
          </article>
        </div>

        <div className="mt-10 space-y-10">
          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">Why book {keyword} with Pickupr</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              With Pickupr, you can reserve your {routeLabel} transfer in minutes and receive clear trip details right away.
              Your ride is private, with no shared passengers, and managed by a professional driver. For travelers comparing transfer
              options between {route.origin} and {route.city}, this page gives a direct booking path with transparent pricing.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">A reliable transfer for flights, business, and family travel</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              This route is frequently booked for airport arrivals, business appointments, and family trips. Private service removes
              unnecessary transfers and simplifies luggage handling from pickup to destination. When you book {keyword}, your journey
              is planned as one direct transfer from {route.origin} to {route.city}.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">Route details for {routeLabel}</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Typical distance for {routeLabel} is around {route.distanceKm} km, with an estimated travel time of {toDurationLabel(route.durationMin)}
              depending on traffic and border conditions. Private fares start from EUR {route.priceFrom}. During booking, you can submit
              pickup details, choose trip timing, and confirm your reservation directly from this page. If you are comparing {keyword}
              options in search results, this route page gives you complete booking access without extra steps.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">SEO travel guide: {route.origin} to {route.city}</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              This page is optimized for travelers looking for {keyword.toLowerCase()}, {route.origin.toLowerCase()} transfer options, and
              private taxi alternatives with fixed rates. You can use the booking form in the hero section to secure your ride immediately.
              For route planning, we recommend pre-booking when possible, especially during peak flight windows and event dates in {route.city}.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mb-8 max-w-7xl px-6 py-2">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Frequently asked questions</h2>
        <div className="mt-4 space-y-5">
          <article className="border-b border-zinc-200 pb-4">
            <h3 className="text-sm font-bold text-zinc-900">Can I pre-book {keyword} online?</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              Yes. You can pre-book this route online and receive direct confirmation for your planned pickup time.
            </p>
          </article>
          <article className="border-b border-zinc-200 pb-4">
            <h3 className="text-sm font-bold text-zinc-900">Is this transfer private?</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              Yes. The vehicle is reserved for you and your group only, with no shared passengers.
            </p>
          </article>
          <article className="border-b border-zinc-200 pb-4">
            <h3 className="text-sm font-bold text-zinc-900">Can I include return travel as well?</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              Yes. You can schedule return details during booking to organize your full transfer in one flow.
            </p>
          </article>
          <article className="border-b border-zinc-200 pb-4">
            <h3 className="text-sm font-bold text-zinc-900">Do prices and travel times vary?</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              Travel times and final prices can vary based on traffic, timing, and special route conditions, but your booking flow always shows
              clear details before you confirm.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto mb-14 max-w-7xl px-6">
        <div className="py-1">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Ready to book</p>
              <p className="mt-1 text-lg font-black tracking-tight text-emerald-900">Reserve your {keyword} transfer now</p>
            </div>
            <a
              href={bookingHref}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700"
            >
              <Car className="h-4 w-4" /> Book now
            </a>
          </div>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-700">
            <Clock3 className="h-4 w-4" /> Fast confirmation for {route.origin} to {route.city}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-700">
            <MapPin className="h-4 w-4" /> Route: {route.origin} to {route.city}, {route.countryName}
          </p>
        </div>
      </section>
    </>
  );
}
