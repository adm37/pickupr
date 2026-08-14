import { CalendarClock, CarFront, CreditCard, ShieldCheck, TimerReset, BadgeCheck } from 'lucide-react';

const steps = [
  {
    icon: <CalendarClock className="h-6 w-6 text-emerald-600" />,
    title: '1. Enter your route and schedule',
    text: 'Choose pickup and drop-off, date, time, passengers, and luggage in under 30 seconds.',
  },
  {
    icon: <CarFront className="h-6 w-6 text-emerald-600" />,
    title: '2. Get a fixed quote instantly',
    text: 'No hidden fees. Your final price includes tolls, taxes, and meet-and-greet where applicable.',
  },
  {
    icon: <CreditCard className="h-6 w-6 text-emerald-600" />,
    title: '3. Confirm and ride with confidence',
    text: 'Receive your booking details and driver information before pickup, with direct support if plans change.',
  },
];

const highlights = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
    title: 'Licensed and insured chauffeurs',
  },
  {
    icon: <TimerReset className="h-5 w-5 text-emerald-600" />,
    title: 'Free cancellation up to 24h',
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-emerald-600" />,
    title: '4.9/5 guest rating and live support',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 text-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 mb-4">
            How Pickupr works
          </h2>
          <p className="text-zinc-600 text-lg">
            Built for travelers who need certainty: fixed pricing, premium vehicles, and professional chauffeurs across the Netherlands and cross-border routes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {steps.map((step) => (
            <article key={step.title} className="rounded-3xl bg-white/95 border border-zinc-200 p-7 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.35)] hover:border-emerald-200 hover:-translate-y-0.5 transition-all">
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{step.title}</h3>
              <p className="text-zinc-600 leading-relaxed">{step.text}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {highlights.map((item) => (
            <div key={item.title} className="inline-flex items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.45)]">
              {item.icon}
              <span className="font-medium text-zinc-800">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}