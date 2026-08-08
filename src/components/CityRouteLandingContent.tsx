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
  const isTaxiVariant = path.endsWith('-taxi');
  const originLabel = route.pattern === 'schiphol' ? 'Schiphol Airport' : 'Amsterdam';
  const keyword = isTaxiVariant
    ? `${originLabel} to ${route.city} Taxi`
    : `${originLabel} to ${route.city} Private Transfer`;
  const routeLabel = `${route.origin} to ${route.city}`;
  const heroTitle = keyword;
  const heroSubtitle = isTaxiVariant
    ? `Book your ${routeLabel} taxi with fixed pricing, meet-and-greet support, and direct confirmation. Reserve in minutes through the booking form below.`
    : `Reserve your ${routeLabel} private transfer with chauffeur comfort, fixed pricing clarity, and direct online confirmation.`;

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
              {isTaxiVariant
                ? `Travelers comparing ${keyword} options typically want dependable pickup timing, transparent pricing, and a direct booking flow without hidden extras. Pickupr is built around that intent with private transport, professional drivers, and clear reservation steps.`
                : `Users searching ${keyword} usually prioritize comfort, discretion, and schedule control. This page targets that intent with private transfer positioning, reliable route planning, and a frictionless booking process from quote to confirmation.`}
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">A reliable transfer for airport, business, and family itineraries</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              {isTaxiVariant
                ? `This route is frequently booked for airport arrivals, executive travel, and cross-border family trips. Private door-to-door taxi service reduces waiting time and simplifies luggage handling from ${route.origin} to ${route.city}.`
                : `This route is frequently reserved for executive schedules, premium airport pickups, and long-distance private travel. Dedicated transfer service helps keep timing precise while removing the uncertainty of on-demand alternatives.`}
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">Route details for {routeLabel}</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Typical distance for {routeLabel} is around {route.distanceKm} km, with an estimated travel time of {toDurationLabel(route.durationMin)} depending on traffic and route conditions.
              {isTaxiVariant
                ? ` Taxi fares on this route start from EUR ${route.priceFrom}, and you can confirm your booking online with clear trip details before checkout.`
                : ` Private transfer pricing on this route starts from EUR ${route.priceFrom}, with direct confirmation and full pickup instructions available during booking.`}
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">How to get the best value on {routeLabel} transfers</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Pre-booking usually gives the strongest balance between availability, pickup precision, and predictable pricing.
              For high-demand windows, secure your transfer early and provide full flight details where relevant.
              {isTaxiVariant
                ? ` This page is tailored for users searching ${keyword.toLowerCase()} and fixed-rate ${route.origin.toLowerCase()} transport alternatives.`
                : ` This page is tailored for users searching ${keyword.toLowerCase()} and premium private transfer options with direct confirmation.`}
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
              Yes. You can pre-book this route online and receive direct confirmation with your planned pickup details.
            </p>
          </article>
          <article className="border-b border-zinc-200 pb-4">
            <h3 className="text-sm font-bold text-zinc-900">Is this transfer private or shared?</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              The vehicle is reserved for your booking only, with no shared passengers.
            </p>
          </article>
          <article className="border-b border-zinc-200 pb-4">
            <h3 className="text-sm font-bold text-zinc-900">Can I add return travel in the same reservation?</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              Yes. You can add return details during booking to organize round-trip travel in one reservation flow.
            </p>
          </article>
          <article className="border-b border-zinc-200 pb-4">
            <h3 className="text-sm font-bold text-zinc-900">Do travel time and final fare ever change?</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              Travel time and final fare can vary by traffic, schedule, and route conditions, but the booking flow shows clear pricing and trip details before confirmation.
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
