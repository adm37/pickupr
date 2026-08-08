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
  const heroSubtitle = `Book ${keyword} with private service, fixed pricing clarity, and instant confirmation. Use the booking form below to secure your transfer in minutes.`;

  const seoSections = [
    {
      title: `Why travelers book ${keyword}`,
      text: `Travelers searching for ${keyword} are usually comparing reliability, total fare transparency, and how quickly they can confirm. This page is built for that exact intent: a direct reservation path, private transfer positioning, and practical planning details without unnecessary steps.`,
    },
    {
      title: `${keyword} for airport, executive, and cross-border travel`,
      text: `Whether you are traveling for business meetings, family visits, or international flight connections, ${keyword} helps keep your transfer predictable. You can reserve ahead, align pickup timing with your itinerary, and avoid last-minute uncertainty around transport availability.`,
    },
    {
      title: `Book ${keyword} online with direct confirmation`,
      text: `Enter your transfer details in the hero booking form, review your trip setup, and complete reservation in one flow. This page is optimized for users who want a fast booking action after searching high-intent terms related to ${keyword}.`,
    },
  ];

  const faqs = [
    {
      q: `Can I pre-book ${keyword} online?`,
      a: `Yes. You can pre-book ${keyword} online and receive direct confirmation for your selected transfer date and time.`,
    },
    {
      q: `Is ${keyword} a private transfer?`,
      a: `Yes. The booking flow is designed for private transfer reservations with a dedicated vehicle for your trip only.`,
    },
    {
      q: 'Can I include return travel in the same booking flow?',
      a: 'Yes. You can provide return-trip details during booking to organize your full itinerary in one process.',
    },
    {
      q: 'Can I book this for business or executive travel?',
      a: `Yes. ${keyword} is frequently booked for business and executive travel where punctual pickup is essential.`,
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
