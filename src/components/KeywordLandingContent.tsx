import { Clock3, Car, MapPin } from 'lucide-react';
import Hero from './Hero';
import { getKeywordLandingRouteByPath } from '../lib/keywordLandingRoutes';

function extractRoute(keyword: string): { from: string; to: string } | null {
  const match = keyword.match(/^(.*) to (.*) taxi$/i);
  if (!match) {
    return null;
  }
  return { from: match[1], to: match[2] };
}

function estimateFromPrice(keyword: string): number {
  const hash = [...keyword].reduce((sum, ch, index) => sum + ch.charCodeAt(0) * (index + 5), 0);
  const base = 55 + (hash % 220);
  return Math.round(base / 5) * 5;
}

export default function KeywordLandingContent({ path }: { path: string }) {
  const route = getKeywordLandingRouteByPath(path);

  if (!route) {
    return null;
  }

  const keyword = route.keyword;
  const parsed = extractRoute(keyword);
  const routeLabel = parsed ? `${parsed.from} to ${parsed.to}` : keyword;
  const priceFrom = estimateFromPrice(keyword);

  const heroTitle = keyword;
  const heroSubtitle = `Book ${keyword} with private service, transparent pricing, and direct online confirmation. Use the booking form below to secure your transfer in minutes.`;

  const seoSections = [
    {
      title: `Why travelers book ${keyword}`,
      text: `Travelers searching for ${keyword} usually need dependable pickup, clear fare details, and a simple checkout flow. This page is designed for that exact intent: direct reservation, private transport, and practical travel planning from one place.`,
    },
    {
      title: `${keyword} for airport and long-distance transfers`,
      text: `Whether you are traveling for business, family visits, or international flights, ${keyword} helps reduce complexity in your trip planning. You can reserve in advance, choose timing that matches your itinerary, and keep your transfer process predictable.`,
    },
    {
      title: `Book ${keyword} online with instant confirmation`,
      text: `This landing page allows immediate booking without unnecessary steps. Enter your transfer details in the hero form, review your trip setup, and complete your reservation directly.`,
    },
  ];

  const faqs = [
    {
      q: `Can I pre-book ${keyword} online?`,
      a: `Yes. You can pre-book ${keyword} online and receive direct confirmation for your selected transfer schedule.`,
    },
    {
      q: `Is ${keyword} a private transfer?`,
      a: `Yes. The booking flow is designed for private transfer reservations with a dedicated vehicle for your trip.`,
    },
    {
      q: 'Can I include return travel in the same booking flow?',
      a: 'Yes. You can provide return details during booking to arrange your full transfer plan in one process.',
    },
    {
      q: 'Can I book this for business or executive travel?',
      a: 'Yes. Many routes are booked for business and executive travel where timing reliability is essential.',
    },
  ];

  return (
    <>
      <Hero title={heroTitle} subtitle={heroSubtitle} />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Keyword</p>
            <p className="mt-1 text-lg font-black text-zinc-900">{keyword}</p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Route focus</p>
            <p className="mt-1 text-lg font-black text-zinc-900">{routeLabel}</p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Starting fare</p>
            <p className="mt-1 text-lg font-black text-zinc-900">EUR {priceFrom}</p>
          </article>
        </div>

        <div className="mt-10 space-y-10">
          {seoSections.map((section) => (
            <article key={section.title}>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900">{section.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-zinc-700">{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-8 max-w-7xl px-6 py-2">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Frequently asked questions</h2>
        <div className="mt-4 space-y-5">
          {faqs.map((faq) => (
            <article key={faq.q} className="border-b border-zinc-200 pb-4">
              <h3 className="text-sm font-bold text-zinc-900">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{faq.a}</p>
            </article>
          ))}
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
              href="/#hero"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700"
            >
              <Car className="h-4 w-4" /> Book now
            </a>
          </div>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-700">
            <Clock3 className="h-4 w-4" /> Fast confirmation for {keyword}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-700">
            <MapPin className="h-4 w-4" /> Service area: Netherlands, Belgium, Germany, France
          </p>
        </div>
      </section>
    </>
  );
}
