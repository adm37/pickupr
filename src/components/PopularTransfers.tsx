import React from 'react';
import { ArrowRight } from 'lucide-react';

type TransferLink = {
  label: string;
  pathname: string;
  duration: string;
};

const FEATURED_TRANSFERS: TransferLink[] = [
  { label: 'Schiphol Airport to Amsterdam', pathname: '/schiphol-to-amsterdam', duration: '30m' },
  { label: 'Schiphol Airport to Rotterdam', pathname: '/schiphol-to-rotterdam', duration: '50m' },
  { label: 'Schiphol Airport to Utrecht', pathname: '/schiphol-to-utrecht', duration: '45m' },
  { label: 'Schiphol Airport to Eindhoven', pathname: '/schiphol-to-eindhoven', duration: '1h 30m' },
  { label: 'Amsterdam to Brussels', pathname: '/amsterdam-to-brussels', duration: '2h 40m' },
  { label: 'Amsterdam to Antwerp', pathname: '/amsterdam-to-antwerp', duration: '2h 05m' },
  { label: 'Amsterdam to Cologne', pathname: '/amsterdam-to-cologne', duration: '3h 00m' },
  { label: 'Amsterdam to Paris', pathname: '/amsterdam-to-paris', duration: '5h 45m' },
];

export default function PopularTransfers() {
  return (
    <section className="py-24 text-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black font-sans tracking-tight mb-4 text-zinc-900">
            Popular Transfer Routes
          </h2>
          <p className="text-zinc-600 max-w-2xl text-lg mx-auto md:mx-0">
            Start with a high-demand route and continue to booking in one click.
          </p>
          <a
            href="/destinations"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Browse destination hub
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_TRANSFERS.map((transfer) => (
            <a
              key={transfer.pathname}
              href={transfer.pathname}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/95 border border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div>
                <div className="font-bold text-zinc-900">{transfer.label}</div>
                <div className="text-sm text-zinc-500 mt-1">Typical duration: {transfer.duration}</div>
                <div className="mt-1 text-xs font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open route page
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
