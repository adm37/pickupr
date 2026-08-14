import { Clock3, MapPin, Car, Shield } from 'lucide-react';
import Hero from './Hero';
import { getCityRouteByPath, getRelatedCityRoutes } from '../lib/cityLandingRoutes';

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
  const relatedRoutes = getRelatedCityRoutes(path, 10);
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

  const comparisonRows = [
    {
      option: 'Pickupr private transfer',
      price: `From EUR ${route.priceFrom}`,
      timing: 'Pre-booked slot with direct confirmation',
      comfort: 'Private vehicle and luggage support',
      bestFor: 'Airport, business, and family travel',
    },
    {
      option: 'Taxi rank',
      price: 'Meter-based and traffic dependent',
      timing: 'Queue and availability dependent',
      comfort: 'Vehicle type varies',
      bestFor: 'Immediate short-notice rides',
    },
    {
      option: 'Ride-hailing',
      price: 'Dynamic by demand',
      timing: 'Driver availability dependent',
      comfort: 'Category dependent',
      bestFor: 'On-demand app users',
    },
    {
      option: 'Public transport',
      price: 'Low base fare',
      timing: 'Schedule and transfers required',
      comfort: 'Self-managed luggage',
      bestFor: 'Budget-first travelers',
    },
  ];

  const expandedFaqs = [
    {
      q: `Can I pre-book ${keyword} online?`,
      a: 'Yes. You can pre-book this route online and receive direct confirmation with your planned pickup details.',
    },
    {
      q: 'Is this transfer private or shared?',
      a: 'The vehicle is reserved for your booking only, with no shared passengers.',
    },
    {
      q: 'Can I add return travel in the same reservation?',
      a: 'Yes. You can add return details during booking to organize round-trip travel in one reservation flow.',
    },
    {
      q: `How long does ${routeLabel} usually take?`,
      a: `Typical travel time is around ${toDurationLabel(route.durationMin)}, depending on traffic and route conditions.`,
    },
    {
      q: `How does ${keyword} compare to Uber or regular taxis?`,
      a: 'Pre-booking typically provides fixed-fare clarity and confirmed pickup timing, while on-demand options can vary by queue and demand.',
    },
    {
      q: 'Can I request child seats or extra luggage support?',
      a: 'Yes. Add your travel requirements during booking so vehicle setup can match your trip needs.',
    },
    {
      q: 'What if my plan changes after booking?',
      a: 'Contact support with your booking details to request timing or route adjustments based on availability.',
    },
    {
      q: 'Do travel time and final fare ever change?',
      a: 'Travel time can vary with traffic. Pricing and route details are clearly presented before booking confirmation.',
    },
  ];

  return (
    <>
      <Hero title={heroTitle} subtitle={heroSubtitle} />

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-18">
        <div className="mb-10 rounded-3xl border border-zinc-200 bg-white px-6 py-7 md:px-8 md:py-9 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.4)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Route overview</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
            {routeLabel} private transfer details
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600 md:text-lg">
            Everything below is structured to help you compare options quickly, understand timing and pricing, and book with confidence.
          </p>
        </div>

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

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Fixed fare clarity</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">Price visibility before confirmation.</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Private vehicle</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">Dedicated transfer for your booking.</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Cross-border coverage</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">Netherlands, Belgium, Germany, and France.</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Fast booking</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">Direct quote and reservation flow.</p>
          </article>
        </div>

        <div className="mt-14 space-y-8 md:space-y-10">
          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 md:text-[2rem]">Why book {keyword} with Pickupr</h2>
            <p className="mt-4 max-w-4xl text-[1.05rem] leading-8 text-zinc-700">
              {isTaxiVariant
                ? `Travelers comparing ${keyword} options typically want dependable pickup timing, transparent pricing, and a direct booking flow without hidden extras. Pickupr is built around that intent with private transport, professional drivers, and clear reservation steps.`
                : `Users searching ${keyword} usually prioritize comfort, discretion, and schedule control. This page targets that intent with private transfer positioning, reliable route planning, and a frictionless booking process from quote to confirmation.`}
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 md:text-[2rem]">A reliable transfer for airport, business, and family itineraries</h2>
            <p className="mt-4 max-w-4xl text-[1.05rem] leading-8 text-zinc-700">
              {isTaxiVariant
                ? `This route is frequently booked for airport arrivals, executive travel, and cross-border family trips. Private door-to-door taxi service reduces waiting time and simplifies luggage handling from ${route.origin} to ${route.city}.`
                : `This route is frequently reserved for executive schedules, premium airport pickups, and long-distance private travel. Dedicated transfer service helps keep timing precise while removing the uncertainty of on-demand alternatives.`}
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 md:text-[2rem]">Route details for {routeLabel}</h2>
            <p className="mt-4 max-w-4xl text-[1.05rem] leading-8 text-zinc-700">
              Typical distance for {routeLabel} is around {route.distanceKm} km, with an estimated travel time of {toDurationLabel(route.durationMin)} depending on traffic and route conditions.
              {isTaxiVariant
                ? ` Taxi fares on this route start from EUR ${route.priceFrom}, and you can confirm your booking online with clear trip details before checkout.`
                : ` Private transfer pricing on this route starts from EUR ${route.priceFrom}, with direct confirmation and full pickup instructions available during booking.`}
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 md:text-[2rem]">How to get the best value on {routeLabel} transfers</h2>
            <p className="mt-4 max-w-4xl text-[1.05rem] leading-8 text-zinc-700">
              Pre-booking usually gives the strongest balance between availability, pickup precision, and predictable pricing.
              For high-demand windows, secure your transfer early and provide full flight details where relevant.
              {isTaxiVariant
                ? ` This page is tailored for users searching ${keyword.toLowerCase()} and fixed-rate ${route.origin.toLowerCase()} transport alternatives.`
                : ` This page is tailored for users searching ${keyword.toLowerCase()} and premium private transfer options with direct confirmation.`}
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 md:text-[2rem]">Pickup and planning tips for this route</h2>
            <p className="mt-4 max-w-4xl text-[1.05rem] leading-8 text-zinc-700">
              Share full pickup notes during booking, including terminal or address details, so handover is fast and clear.
              For airport arrivals, keep your phone reachable after landing and verify meeting instructions before baggage claim to reduce waiting time.
              If your journey includes meetings or onward travel, schedule a realistic time buffer around peak traffic windows.
            </p>
          </article>
        </div>

        <article className="mt-14 rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.4)]">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">Compare transfer choices for {routeLabel}</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">
            This overview helps you choose between private transfer, taxis, ride-hailing, and public transport based on reliability and comfort.
          </p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-zinc-50">
                <tr className="border-b border-zinc-200 text-left text-zinc-600">
                  <th className="px-4 py-3 font-semibold">Option</th>
                  <th className="px-4 py-3 font-semibold">Pricing</th>
                  <th className="px-4 py-3 font-semibold">Timing</th>
                  <th className="px-4 py-3 font-semibold">Comfort</th>
                  <th className="px-4 py-3 font-semibold">Best for</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.option} className="border-b border-zinc-100 text-zinc-800">
                    <td className="px-4 py-3 font-semibold">{row.option}</td>
                    <td className="px-4 py-3">{row.price}</td>
                    <td className="px-4 py-3">{row.timing}</td>
                    <td className="px-4 py-3">{row.comfort}</td>
                    <td className="px-4 py-3">{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mx-auto mb-10 max-w-7xl px-6">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Frequently asked questions</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {expandedFaqs.map((faq) => (
            <article key={faq.q} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.45)]">
              <h3 className="text-base font-bold text-zinc-900">{faq.q}</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-700 md:text-base">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>

      {relatedRoutes.length > 0 && (
        <section className="mx-auto mb-10 max-w-7xl px-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">Nearby transfer routes</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Explore similar routes from {route.origin} across {route.countryName}.
            </p>
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {relatedRoutes.map((relatedRoute) => (
                <li key={relatedRoute.pathname}>
                  <a
                    href={relatedRoute.pathname}
                    className="block rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-emerald-500 hover:text-emerald-700"
                  >
                    {relatedRoute.origin} to {relatedRoute.city}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
              <a href="/destinations" className="text-emerald-700 hover:text-emerald-800">
                Browse all destinations
              </a>
              <a href="/routes" className="text-emerald-700 hover:text-emerald-800">
                Open full route index
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto mb-16 max-w-7xl px-6">
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-6 py-8 md:px-8 md:py-10 shadow-[0_24px_50px_-38px_rgba(5,150,105,0.35)]">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Ready to book</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-emerald-900">Reserve your {keyword} transfer now</p>
            </div>
            <a
              href={bookingHref}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700"
            >
              <Car className="h-4 w-4" /> Book now
            </a>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-700 md:text-base">
            <Clock3 className="h-4 w-4" /> Fast confirmation for {route.origin} to {route.city}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-700 md:text-base">
            <MapPin className="h-4 w-4" /> Route: {route.origin} to {route.city}, {route.countryName}
          </p>
        </div>
      </section>
    </>
  );
}
