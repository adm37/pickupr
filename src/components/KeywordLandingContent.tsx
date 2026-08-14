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

type SeoSection = {
  title: string;
  text: string;
};

type FaqItem = {
  q: string;
  a: string;
};

type KeywordCopyOverride = {
  heroSubtitle: string;
  seoSections: SeoSection[];
  faqs: FaqItem[];
};

const KEYWORD_COPY_OVERRIDES: Record<string, KeywordCopyOverride> = {
  'private chauffeur service': {
    heroSubtitle:
      'Book a private chauffeur service with discreet pickup, premium comfort, and direct confirmation for airport and city travel.',
    seoSections: [
      {
        title: 'Private chauffeur service with privacy and punctuality',
        text: 'People searching for private chauffeur service often value privacy, smooth arrival, and no uncertainty on the day itself. This page focuses on those expectations with private-only rides, predictable planning, and a fast booking path for travelers who want professional transport without unnecessary complexity.',
      },
      {
        title: 'Ideal for airport transfers, hotels, and executive schedules',
        text: 'A private chauffeur service is commonly booked for Schiphol pickups, hotel transfers, and meeting-heavy itineraries. You can schedule collection around real flight or appointment timing and avoid waiting for shared transport, making the journey more controlled from start to finish.',
      },
      {
        title: 'Clear online booking for premium private transport',
        text: 'Use the booking flow to set pickup location, destination, and timing in minutes. This private chauffeur service page is built for high-intent users who are ready to compare reliability and then book immediately.',
      },
    ],
    faqs: [
      {
        q: 'Can I schedule a private chauffeur service in advance?',
        a: 'Yes. You can plan your ride ahead of time and receive direct confirmation for your selected date and pickup slot.',
      },
      {
        q: 'Is this private chauffeur service suitable for business guests?',
        a: 'Yes. It is frequently used for executives, clients, and visitors who require punctual and private transport.',
      },
      {
        q: 'Can I use this service for airport and city rides?',
        a: 'Yes. You can book airport pickup, hotel transfers, and city-to-city routes in one booking flow.',
      },
      {
        q: 'Do I get a private vehicle only for my booking?',
        a: 'Yes. Trips are arranged as private transfers and are not shared with other passengers.',
      },
    ],
  },
  'private driver services': {
    heroSubtitle:
      'Reserve private driver services for one-way transfers, return trips, and hourly itineraries with quick online confirmation.',
    seoSections: [
      {
        title: 'Private driver services for flexible travel needs',
        text: 'Users searching for private driver services usually need flexibility: airport pickup now, a business meeting later, or a return ride in the evening. This page targets that intent by combining private comfort with practical scheduling options for different trip formats.',
      },
      {
        title: 'From airport rides to full-day private driver coverage',
        text: 'Private driver services are suitable for travelers who want one provider for multiple ride types. Instead of switching between transport modes, you can keep your route planning consistent and reduce delays caused by last-minute availability issues.',
      },
      {
        title: 'Book private driver services in a few steps',
        text: 'Complete your booking online, review route details, and lock in timing before your travel day. The page is optimized for conversion intent and gives clear next steps for users comparing premium private transport options.',
      },
    ],
    faqs: [
      {
        q: 'Can I book private driver services for multiple stops?',
        a: 'Yes. You can include your trip details and plan routes that match your schedule and stop sequence.',
      },
      {
        q: 'Are private driver services available for airport travel?',
        a: 'Yes. Airport pickups and drop-offs are a core use case for this service.',
      },
      {
        q: 'Can I arrange return transportation during booking?',
        a: 'Yes. Return-trip details can be added in the same reservation flow.',
      },
      {
        q: 'Is this service useful for business and personal travel?',
        a: 'Yes. The same booking flow supports both executive and personal itineraries.',
      },
    ],
  },
  'business chauffeur hire': {
    heroSubtitle:
      'Business chauffeur hire for executive airport transfers, meetings, and roadshow days with reliable timing and premium comfort.',
    seoSections: [
      {
        title: 'Business chauffeur hire built for executive timing',
        text: 'Search intent around business chauffeur hire is usually performance-driven: punctual arrival, low-friction booking, and transport that supports packed calendars. This page addresses that by prioritizing schedule reliability and straightforward reservation for corporate travelers.',
      },
      {
        title: 'Professional transport for meetings, events, and roadshows',
        text: 'Whether you are coordinating a single airport pickup or a multi-stop client day, business chauffeur hire helps keep teams moving on time. The service supports city rides, intercity travel, and airport connections under one consistent booking process.',
      },
      {
        title: 'Fast booking flow for corporate travel planners',
        text: 'Submit trip details, confirm pickup windows, and finalize the reservation online. The page is designed for users with high commercial intent who need dependable transport without lengthy coordination loops.',
      },
    ],
    faqs: [
      {
        q: 'Is business chauffeur hire suitable for executive guests?',
        a: 'Yes. The service is commonly used for executives, partners, and business visitors.',
      },
      {
        q: 'Can I use business chauffeur hire for meeting-heavy days?',
        a: 'Yes. It is suitable for itineraries with multiple appointments and tight timing.',
      },
      {
        q: 'Can I pre-book airport pickup for business arrivals?',
        a: 'Yes. You can reserve in advance and align pickup with travel schedules.',
      },
      {
        q: 'Does this work for cross-border business travel?',
        a: 'Yes. Routes across nearby countries can be planned through the same booking flow.',
      },
    ],
  },
  'personal driver service': {
    heroSubtitle:
      'Book a personal driver service for daily appointments, airport trips, and private city travel with direct confirmation.',
    seoSections: [
      {
        title: 'Personal driver service for practical day-to-day mobility',
        text: 'People searching personal driver service often need dependable transport for appointments, family logistics, or recurring city travel. This page focuses on convenience, private comfort, and a booking process that is simple enough for routine use.',
      },
      {
        title: 'A private alternative to unpredictable on-demand rides',
        text: 'A personal driver service helps travelers avoid surge uncertainty and repeated re-booking. With advance scheduling, timing can be coordinated around your plans instead of adapting your plans to ride availability.',
      },
      {
        title: 'Reserve your personal driver service in minutes',
        text: 'Enter pickup and destination information, choose timing, and finalize your ride online. This content is optimized for users ready to move from search to action with minimal friction.',
      },
    ],
    faqs: [
      {
        q: 'Can I use a personal driver service for regular weekly trips?',
        a: 'Yes. Many travelers use this type of service for recurring appointments and planned routes.',
      },
      {
        q: 'Is personal driver service only for airport transfers?',
        a: 'No. It can be used for city rides, business appointments, and other private journeys.',
      },
      {
        q: 'Can I add return travel in one booking?',
        a: 'Yes. Return details can be included during reservation.',
      },
      {
        q: 'Is the vehicle shared with other passengers?',
        a: 'No. The transfer is private and dedicated to your booking.',
      },
    ],
  },
  'personal drivers for hire': {
    heroSubtitle:
      'Find personal drivers for hire for private transfers, scheduled appointments, and airport journeys with a direct booking flow.',
    seoSections: [
      {
        title: 'Personal drivers for hire with flexible booking options',
        text: 'Searches for personal drivers for hire usually come from users comparing reliability and convenience over standard ride-hailing. This page provides a direct path to reserve private transport for one-off journeys or repeat travel patterns.',
      },
      {
        title: 'Suitable for appointments, family travel, and airport connections',
        text: 'Personal drivers for hire can support varied trip needs, from healthcare appointments and station pickups to business meetings and flight transfers. Planning ahead reduces same-day uncertainty and helps keep your day predictable.',
      },
      {
        title: 'Private ride confirmation without long coordination',
        text: 'Use the booking form to share trip details and confirm quickly. This page is designed for users who are already comparing providers and want to secure trusted private transport now.',
      },
    ],
    faqs: [
      {
        q: 'Can I hire personal drivers for one-time trips?',
        a: 'Yes. One-way and return bookings are both supported.',
      },
      {
        q: 'Can I arrange a personal driver for recurring travel?',
        a: 'Yes. Recurring transport needs can be planned through advance bookings.',
      },
      {
        q: 'Are airport pickups included in this service type?',
        a: 'Yes. Airport transfers are a common use case for personal drivers for hire.',
      },
      {
        q: 'Is booking available online?',
        a: 'Yes. You can complete your reservation through the online booking flow.',
      },
    ],
  },
  'best vip chauffeured worldwide': {
    heroSubtitle:
      'Book best VIP chauffeured worldwide style transfers with premium standards, smooth planning, and quick online confirmation.',
    seoSections: [
      {
        title: 'Best VIP chauffeured worldwide intent, localized booking execution',
        text: 'This keyword reflects users seeking top-tier chauffeur quality with international expectations. The page addresses that intent with premium private transfer positioning, clear booking steps, and service framing suitable for high-comfort travelers.',
      },
      {
        title: 'Premium transfer quality for international and executive travelers',
        text: 'When travel includes airports, hotels, and cross-border schedules, consistency is critical. This page focuses on reliable pickup planning and a calm transfer experience aligned with VIP expectations around punctuality and discretion.',
      },
      {
        title: 'Reserve your VIP-level transfer online',
        text: 'You can complete booking details quickly and secure your transfer with direct confirmation. Content is optimized to satisfy users comparing worldwide-standard chauffeur options before making a final reservation decision.',
      },
    ],
    faqs: [
      {
        q: 'Is this suitable for high-end international travelers?',
        a: 'Yes. The service format is tailored for premium comfort and reliable planning.',
      },
      {
        q: 'Can I use this for airport and hotel transfers?',
        a: 'Yes. Airport-hotel and hotel-city routes can be booked through the same flow.',
      },
      {
        q: 'Can VIP-level transfers be scheduled in advance?',
        a: 'Yes. Advance booking is available to secure timing and routing before travel day.',
      },
      {
        q: 'Is transportation private or shared?',
        a: 'Transportation is arranged as a private transfer for your booking only.',
      },
    ],
  },
  'vip taxi cab': {
    heroSubtitle:
      'Book a VIP taxi cab alternative with private comfort, clear fares, and direct confirmation for airport or city rides.',
    seoSections: [
      {
        title: 'VIP taxi cab intent with private transfer standards',
        text: 'Users searching VIP taxi cab are often looking for a premium alternative to standard taxis. This page answers that intent with private ride positioning, service consistency, and fast booking steps for users ready to reserve quickly.',
      },
      {
        title: 'Premium ride quality for business and leisure transfers',
        text: 'A VIP taxi cab style booking is suitable for airport pickups, hotel transfers, and important city appointments. With private transport setup, passengers can travel without the unpredictability common in on-demand street pickups.',
      },
      {
        title: 'From search to confirmed ride in one booking flow',
        text: 'The reservation process is built for conversion speed: enter trip details, review your route setup, and complete booking. This gives users a clear path from comparison to action.',
      },
    ],
    faqs: [
      {
        q: 'Is VIP taxi cab booking available for airport trips?',
        a: 'Yes. Airport transfers are one of the most common bookings for this page.',
      },
      {
        q: 'How is this different from a regular taxi?',
        a: 'This service is positioned as private premium transfer with pre-booked scheduling and clear booking flow.',
      },
      {
        q: 'Can I reserve a return ride at the same time?',
        a: 'Yes. Return details can be added during the booking process.',
      },
      {
        q: 'Can I use this for executive guests?',
        a: 'Yes. It is suitable for executive and client transportation needs.',
      },
    ],
  },
  'vip transportation': {
    heroSubtitle:
      'Reserve VIP transportation for business events, airports, and private city travel with premium private transfer support.',
    seoSections: [
      {
        title: 'VIP transportation for high-priority travel plans',
        text: 'Searchers for VIP transportation typically prioritize reliability, comfort, and controlled timing. This page is built around that intent with private booking, straightforward trip setup, and service messaging aligned with premium expectations.',
      },
      {
        title: 'Use VIP transportation for events, meetings, and transfers',
        text: 'From airport arrivals to event-day movement, VIP transportation helps keep itineraries coordinated. Travelers can secure pickup timing ahead of schedule and reduce operational stress around important appointments.',
      },
      {
        title: 'Direct booking path for premium private transport',
        text: 'Complete your route details and confirm in minutes. This page targets users with transactional intent who are evaluating premium providers and need confidence to book now.',
      },
    ],
    faqs: [
      {
        q: 'Can VIP transportation be arranged for corporate events?',
        a: 'Yes. It is commonly used for events, executive movement, and guest transfers.',
      },
      {
        q: 'Is VIP transportation private?',
        a: 'Yes. Bookings are handled as private transfers, not shared rides.',
      },
      {
        q: 'Can I pre-book airport VIP transportation?',
        a: 'Yes. Advance airport booking is available through the online flow.',
      },
      {
        q: 'Can this be used for cross-border routes?',
        a: 'Yes. Nearby international routes can be scheduled as part of private transfer planning.',
      },
    ],
  },
  'personal chauffeur': {
    heroSubtitle:
      'Book a personal chauffeur for private airport, business, and city transfers with professional timing and clear booking steps.',
    seoSections: [
      {
        title: 'Personal chauffeur service designed for convenience',
        text: 'Users searching personal chauffeur are generally looking for comfort plus reliability, not just a one-off ride. This page addresses that by framing private transport as a practical service for both planned appointments and priority transfers.',
      },
      {
        title: 'A personal chauffeur for airport, city, and client travel',
        text: 'Whether your schedule includes flights, meetings, or social commitments, a personal chauffeur setup improves predictability. You can align pickup times to your real itinerary and avoid time loss from transport uncertainty.',
      },
      {
        title: 'Simple reservation flow for personal chauffeur bookings',
        text: 'The booking flow is built for speed and clarity: share trip details, confirm timing, and finalize transport in minutes. This supports users who want to secure private travel without back-and-forth coordination.',
      },
    ],
    faqs: [
      {
        q: 'Can I pre-book a personal chauffeur for airport transfer?',
        a: 'Yes. Airport transfers can be booked in advance with direct confirmation.',
      },
      {
        q: 'Is this useful for both business and personal trips?',
        a: 'Yes. The service supports executive itineraries and private day-to-day travel.',
      },
      {
        q: 'Can I include a return journey in the same booking?',
        a: 'Yes. Return details can be entered during booking.',
      },
      {
        q: 'Will the trip be shared with other passengers?',
        a: 'No. Your booking is organized as a private transfer.',
      },
    ],
  },
  'private chauffeur': {
    heroSubtitle:
      'Reserve a private chauffeur with premium transfer quality, fixed-fare clarity, and fast online confirmation.',
    seoSections: [
      {
        title: 'Private chauffeur bookings for premium travel intent',
        text: 'The keyword private chauffeur attracts users seeking dependable, higher-standard transport. This page is optimized for that intent with private service positioning, clear value messaging, and immediate booking action paths.',
      },
      {
        title: 'Use a private chauffeur for airport and executive routes',
        text: 'A private chauffeur is frequently booked for flight transfers, client visits, and city-to-city meetings. Planned pickup windows and route preparation help reduce delays and improve overall travel confidence.',
      },
      {
        title: 'Book private chauffeur rides online with direct confirmation',
        text: 'Submit trip details through the booking form, confirm route timing, and complete your reservation in one flow. This supports users who are near the end of the decision cycle and ready to convert.',
      },
    ],
    faqs: [
      {
        q: 'Can I book a private chauffeur in advance?',
        a: 'Yes. You can pre-book your ride and receive confirmation for your selected time.',
      },
      {
        q: 'Is private chauffeur travel suitable for executives?',
        a: 'Yes. This service is often used for executive and client transportation.',
      },
      {
        q: 'Can private chauffeur rides include airport pickup?',
        a: 'Yes. Airport pickup and drop-off are standard booking scenarios.',
      },
      {
        q: 'Can I reserve cross-border routes?',
        a: 'Yes. Private transfers to nearby countries are supported in the booking flow.',
      },
    ],
  },
};

export default function KeywordLandingContent({ path }: { path: string }) {
  const route = getKeywordLandingRouteByPath(path);

  if (!route) {
    return null;
  }

  const keyword = route.keyword;
  const parsed = extractRoute(keyword);
  const routeLabel = parsed ? `${parsed.from} to ${parsed.to}` : keyword;
  const priceFrom = estimateFromPrice(keyword);
  const keywordOverride = KEYWORD_COPY_OVERRIDES[keyword.toLowerCase()];

  const heroTitle = keyword;
  const heroSubtitle =
    keywordOverride?.heroSubtitle ||
    `Book ${keyword} with private service, fixed pricing clarity, and instant confirmation. Use the booking form below to secure your transfer in minutes.`;

  const seoSections =
    keywordOverride?.seoSections ||
    [
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

  const faqs =
    keywordOverride?.faqs ||
    [
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

  const expandedFaqs = [
    ...faqs,
    {
      q: `Where will my driver meet me for ${keyword}?`,
      a: 'Meeting instructions are shared before pickup. For airport transfers, the exact meeting point is provided in advance.',
    },
    {
      q: `How does ${keyword} compare to Uber or regular taxi queues?`,
      a: 'Pre-booking gives fixed-fare clarity and confirmed pickup timing, while on-demand alternatives can vary by queue times and demand.',
    },
    {
      q: `Can I request child seats for ${keyword}?`,
      a: 'Yes. You can add child seat requirements during booking so the ride setup matches your travel needs.',
    },
    {
      q: `What happens if my plans change after booking ${keyword}?`,
      a: 'You can contact support with your booking details to adjust timing or route information based on availability.',
    },
  ];

  const comparisonRows = [
    {
      option: 'Pickupr private transfer',
      price: 'Fixed before confirmation',
      waiting: 'Pre-booked pickup slot',
      luggage: 'Included in trip setup',
      support: 'Direct booking support',
    },
    {
      option: 'Taxi rank',
      price: 'Meter-based at trip time',
      waiting: 'Can vary in peak periods',
      luggage: 'Driver dependent',
      support: 'Limited after pickup',
    },
    {
      option: 'Ride-hailing apps',
      price: 'Dynamic demand pricing',
      waiting: 'Vehicle availability dependent',
      luggage: 'Vehicle type dependent',
      support: 'App ticket flow',
    },
    {
      option: 'Public transport',
      price: 'Usually lowest base fare',
      waiting: 'Schedule dependent',
      luggage: 'Self-managed',
      support: 'Operator support channels',
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Fixed fare clarity</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">Price is confirmed before checkout.</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Private ride</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">Dedicated vehicle for your booking only.</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Fast confirmation</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">Direct booking flow with clear next steps.</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Cross-border ready</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">Netherlands, Belgium, Germany, and France coverage.</p>
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

        <article className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">Which transfer option fits your trip?</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Use this quick comparison before booking {keyword}. If certainty and timing matter, pre-booked private transfer is usually the strongest fit.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-600">
                  <th className="px-2 py-2 font-semibold">Option</th>
                  <th className="px-2 py-2 font-semibold">Pricing</th>
                  <th className="px-2 py-2 font-semibold">Pickup reliability</th>
                  <th className="px-2 py-2 font-semibold">Luggage convenience</th>
                  <th className="px-2 py-2 font-semibold">Support</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.option} className="border-b border-zinc-100 text-zinc-800">
                    <td className="px-2 py-2 font-semibold">{row.option}</td>
                    <td className="px-2 py-2">{row.price}</td>
                    <td className="px-2 py-2">{row.waiting}</td>
                    <td className="px-2 py-2">{row.luggage}</td>
                    <td className="px-2 py-2">{row.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mx-auto mb-8 max-w-7xl px-6 py-2">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Frequently asked questions</h2>
        <div className="mt-4 space-y-5">
          {expandedFaqs.map((faq) => (
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
              href="#hero"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700"
            >
              <Car className="h-4 w-4" /> Enter route & check price
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
