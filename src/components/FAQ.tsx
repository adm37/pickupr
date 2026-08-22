import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { logEvent } from '../lib/tracking';

const faqs = [
  {
    question: "How much does an Amsterdam airport transfer cost?",
    answer: "Prices depend on your route, vehicle class, and pickup timing. You always receive a fixed all-in quote before checkout, so your Amsterdam airport transfer price is clear upfront."
  },
  {
    question: "Do you provide private transfers across the Netherlands?",
    answer: "Yes. Pickupr provides private transfer service throughout the Netherlands, including Schiphol airport transfer routes, Amsterdam city rides, and long-distance intercity travel."
  },
  {
    question: "What happens if my flight is delayed?",
    answer: "We monitor all flights in real-time. If your flight is delayed, we automatically adjust your pickup time without any extra charges."
  },
  {
    question: "Where will my driver meet me?",
    answer: "For Schiphol airport transfer bookings, your meeting point is shared in advance with clear instructions. For Amsterdam and other pickups, your private driver meets you at the confirmed location and you receive contact details before departure."
  },
  {
    question: "Are there any hidden costs?",
    answer: "No, all our prices are fixed and include taxes, tolls, and gratuities. What you see during the booking process is the final price."
  },
  {
    question: "Can I cancel my booking?",
    answer: "Yes! We offer free cancellation up to 24 hours before your scheduled pickup time."
  },
  {
    question: "Can I book an hourly chauffeur for meetings and events?",
    answer: "Absolutely. Our chauffeur service in the Netherlands is ideal for roadshows, executive meetings, shopping trips, and flexible schedules with multiple stops."
  },
  {
    question: "Do you provide child seats?",
    answer: "In the Netherlands, taxis are not legally required to have child seats. You may hold your child on your lap or bring your own child seat."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    if (openIndex !== index) {
      logEvent('FAQ Toggled', `Opened FAQ: ${faqs[index].question}`);
    }
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black font-sans tracking-tight text-zinc-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-zinc-500 text-lg">Everything you need to know about airport transfers and private driver service in the Netherlands.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border border-zinc-200 rounded-2xl overflow-hidden hover:border-emerald-200 transition-colors bg-white/95 shadow-[0_16px_28px_-24px_rgba(15,23,42,0.45)]"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggle(i)}
              >
                <span className="font-semibold text-lg text-zinc-900">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-emerald-600' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-5 text-zinc-600 leading-relaxed bg-white border-t border-zinc-100">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
