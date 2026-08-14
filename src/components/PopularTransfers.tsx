import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function PopularTransfers() {
  const transfers = [
    // Airports
    { from: 'Schiphol Airport', to: 'Brussels Airport', duration: '2h 15m' },
    { from: 'Schiphol Airport', to: 'Paris Charles de Gaulle', duration: '5h 0m' },
    { from: 'Schiphol Airport', to: 'Dusseldorf Airport', duration: '2h 15m' },
    { from: 'Schiphol Airport', to: 'Frankfurt Airport', duration: '4h 0m' },
    { from: 'Schiphol Airport', to: 'Cologne Bonn Airport', duration: '2h 45m' },
    { from: 'Schiphol Airport', to: 'Charleroi Airport', duration: '2h 45m' },
    { from: 'Schiphol Airport', to: 'Weeze Airport', duration: '2h 0m' },
    // Cities - Belgium
    { from: 'Amsterdam', to: 'Antwerp', duration: '2h 0m' },
    { from: 'Amsterdam', to: 'Bruges', duration: '3h 0m' },
    { from: 'Amsterdam', to: 'Brussels', duration: '2h 30m' },
    { from: 'Amsterdam', to: 'Ghent', duration: '2h 30m' },
    { from: 'Amsterdam', to: 'Leuven', duration: '2h 30m' },
    { from: 'Amsterdam', to: 'Liège', duration: '2h 45m' },
    { from: 'Amsterdam', to: 'Mechelen', duration: '2h 15m' },
    { from: 'Rotterdam', to: 'Antwerp', duration: '1h 15m' },
    { from: 'Rotterdam', to: 'Bruges', duration: '2h 15m' },
    { from: 'Rotterdam', to: 'Brussels', duration: '1h 45m' },
    { from: 'Rotterdam', to: 'Ghent', duration: '1h 45m' },
    { from: 'The Hague', to: 'Antwerp', duration: '1h 30m' },
    { from: 'The Hague', to: 'Brussels', duration: '2h 0m' },
    { from: 'The Hague', to: 'Bruges', duration: '2h 30m' },
    { from: 'Utrecht', to: 'Antwerp', duration: '1h 30m' },
    { from: 'Utrecht', to: 'Brussels', duration: '2h 0m' },
    { from: 'Eindhoven', to: 'Antwerp', duration: '1h 0m' },
    { from: 'Eindhoven', to: 'Brussels', duration: '1h 30m' },
    // Cities - France
    { from: 'Amsterdam', to: 'Paris', duration: '5h 15m' },
    { from: 'Amsterdam', to: 'Lille', duration: '3h 0m' },
    { from: 'Amsterdam', to: 'Strasbourg', duration: '6h 30m' },
    { from: 'Amsterdam', to: 'Lyon', duration: '8h 30m' },
    { from: 'Rotterdam', to: 'Paris', duration: '4h 30m' },
    { from: 'Rotterdam', to: 'Lille', duration: '2h 15m' },
    { from: 'The Hague', to: 'Paris', duration: '5h 0m' },
    { from: 'The Hague', to: 'Lille', duration: '2h 45m' },
    { from: 'Eindhoven', to: 'Paris', duration: '4h 45m' },
    { from: 'Utrecht', to: 'Paris', duration: '5h 0m' },
    // Cities - Germany
    { from: 'Amsterdam', to: 'Dusseldorf', duration: '2h 45m' },
    { from: 'Amsterdam', to: 'Cologne', duration: '3h 0m' },
    { from: 'Amsterdam', to: 'Frankfurt', duration: '4h 30m' },
    { from: 'Amsterdam', to: 'Bremen', duration: '3h 45m' },
    { from: 'Amsterdam', to: 'Hamburg', duration: '5h 0m' },
    { from: 'Amsterdam', to: 'Berlin', duration: '6h 30m' },
    { from: 'Amsterdam', to: 'Munich', duration: '8h 0m' },
    { from: 'Amsterdam', to: 'Stuttgart', duration: '6h 15m' },
    { from: 'Amsterdam', to: 'Aachen', duration: '2h 30m' },
    { from: 'Amsterdam', to: 'Bonn', duration: '3h 15m' },
    { from: 'Rotterdam', to: 'Dusseldorf', duration: '2h 30m' },
    { from: 'Rotterdam', to: 'Cologne', duration: '2h 45m' },
    { from: 'Rotterdam', to: 'Frankfurt', duration: '4h 15m' },
    { from: 'Rotterdam', to: 'Hamburg', duration: '5h 0m' },
    { from: 'The Hague', to: 'Dusseldorf', duration: '2h 45m' },
    { from: 'The Hague', to: 'Cologne', duration: '3h 0m' },
    { from: 'The Hague', to: 'Frankfurt', duration: '4h 30m' },
    { from: 'Utrecht', to: 'Dusseldorf', duration: '2h 0m' },
    { from: 'Utrecht', to: 'Cologne', duration: '2h 15m' },
    { from: 'Utrecht', to: 'Frankfurt', duration: '4h 0m' },
    { from: 'Eindhoven', to: 'Dusseldorf', duration: '1h 30m' },
    { from: 'Eindhoven', to: 'Cologne', duration: '1h 45m' },
    { from: 'Eindhoven', to: 'Frankfurt', duration: '3h 30m' },
  ];

  const buildBookingUrl = (from: string, to: string) => {
    const params = new URLSearchParams({
      type: 'transfers',
      pickup: from,
      dropoff: to,
      passengers: '2',
      luggage: '2',
    });
    return `/booking?${params.toString()}`;
  };

  return (
    <section className="py-24 text-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black font-sans tracking-tight mb-4 text-zinc-900">
            Most Popular Transfers
          </h2>
          <p className="text-zinc-600 max-w-2xl text-lg mx-auto md:mx-0">
            Discover high-demand routes with fixed pricing, free cancellation, and premium chauffeur service from door to door.
          </p>
          <a
            href="/routes"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            View all routes
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {transfers.map((transfer, idx) => (
            <a 
              key={idx}
              href={buildBookingUrl(transfer.from, transfer.to)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/95 border border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-zinc-900">{transfer.from}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">to</span>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                  <span className="font-bold text-zinc-900 truncate">{transfer.to}</span>
                </div>
                <div className="text-sm text-zinc-500">
                  Est. time: {transfer.duration}
                </div>
                <div className="mt-1 text-xs font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Check live fare and availability
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
