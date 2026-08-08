import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { logEvent } from '../lib/tracking';

const faqs = [
  {
    question: "How much is a transfer from Schiphol to Amsterdam?",
    answer: "Prices depend on vehicle type, time, and exact pickup point. You get a fixed all-in quote before checkout, so there are no surprises later."
  },
  {
    question: "Do you operate cross-border transfers from the Netherlands?",
    answer: "Yes. We frequently drive from the Netherlands to Belgium, Germany, and France, including airport pickups, city transfers, and business travel itineraries."
  },
  {
    question: "What happens if my flight is delayed?",
    answer: "We monitor all flights in real-time. If your flight is delayed, we automatically adjust your pickup time without any extra charges."
  },
  {
    question: "Where will my driver meet me?",
    answer: "At Schiphol Airport, passengers will be picked up at Departure Hall Door 3C. For other locations, your driver will meet you at the designated pickup point. You will receive their contact details before the trip."
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
    answer: "Absolutely. Our hourly chauffeur option is ideal for roadshows, executive meetings, shopping trips, and flexible schedules where multiple stops are needed."
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
    <section className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black font-sans tracking-tight text-zinc-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-zinc-500 text-lg">Everything you need to know about our premium chauffeur service.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border border-zinc-200 rounded-2xl overflow-hidden hover:border-emerald-200 transition-colors bg-white"
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
