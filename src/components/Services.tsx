import { MapPin, Clock, Calendar, CheckCircle2, ChevronRight, Users, Car, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function Services() {
  const intentLinks = [
    { label: 'City-to-city transfers', href: '/routes' },
    { label: 'Airport transfer Netherlands', href: '/airport-transfer-netherlands' },
    { label: 'Amsterdam airport transfer', href: '/airport-transfer-to-amsterdam' },
    { label: 'Schiphol airport transfer', href: '/schiphol-to-amsterdam' },
    { label: 'Business travel', href: '/destinations' },
    { label: 'Chauffeur service Netherlands', href: '/airport-chauffeur-netherlands' },
  ];

  const seoLandingLinks = [
    { label: 'Private Chauffeur Service', href: '/private-chauffeur-service' },
    { label: 'Private Driver Services', href: '/private-driver-services' },
    { label: 'Business Chauffeur Hire', href: '/business-chauffeur-hire' },
    { label: 'Personal Driver Service', href: '/personal-driver-service' },
    { label: 'Personal Drivers for Hire', href: '/personal-drivers-for-hire' },
    { label: 'Best VIP Chauffeured Worldwide', href: '/best-vip-chauffeured-worldwide' },
    { label: 'VIP Taxi Cab', href: '/vip-taxi-cab' },
    { label: 'VIP Transportation', href: '/vip-transportation' },
    { label: 'Personal Chauffeur', href: '/personal-chauffeur' },
    { label: 'Private Chauffeur', href: '/private-chauffeur' },
  ];

  const services = [
    {
      icon: <Car className="w-8 h-8 text-emerald-600" />,
      title: 'Private Transfer Netherlands',
      description: 'Reliable private transfers throughout the Netherlands for airport pickups, hotels, and intercity rides.',
    },
    {
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      title: 'Private Driver Amsterdam',
      description: 'Book a private driver in Amsterdam for flexible schedules, business appointments, and premium local travel.',
    },
    {
      icon: <Globe className="w-8 h-8 text-emerald-600" />,
      title: 'Multi-City Tours',
      description: 'Plan complex itineraries. We handle the driving while you enjoy the journey.',
    },
    {
      icon: <MapPin className="w-8 h-8 text-emerald-600" />,
      title: 'Chauffeur Service Netherlands',
      description: 'Professional chauffeur coverage from Amsterdam and Schiphol to every major Dutch city, with optional cross-border rides.',
    },
  ];

  return (
    <>
      <section id="services" className="py-24 text-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-sans tracking-tight mb-4 text-zinc-900">
              Private Airport Transfer Expertise Across the Netherlands
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto text-lg mb-8">
              Pickupr is your all-in-one platform for Amsterdam airport transfer, Schiphol airport transfer, and private transfer service across the Netherlands. Compare options, book fast, and ride with vetted professional drivers.
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {intentLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium hover:bg-emerald-100 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/95 border border-zinc-200 p-8 rounded-3xl hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="mb-6 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">{service.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">Popular Chauffeur Searches</h3>
              <p className="mt-2 text-zinc-600 max-w-3xl">
                Explore dedicated chauffeur and VIP service pages to compare options and book the right private transfer for your travel intent.
              </p>
            </div>
            <a
              href="/routes"
              className="inline-flex w-fit items-center rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Browse all route pages
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {seoLandingLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        id="hourly" 
        className="relative overflow-hidden bg-transparent min-h-[600px]"
        style={{marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)'}}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-white to-sky-100" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_14%,rgba(16,185,129,0.25),transparent_42%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_82%,rgba(14,165,233,0.2),transparent_44%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 md:via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent md:hidden" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-16 lg:py-20 flex flex-col md:flex-row">
          <div className="md:w-2/3 lg:w-[55%] flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-widest rounded-full mb-8 w-fit shadow-sm">
              <Clock className="w-4 h-4" /> As Directed
            </div>
            
            <h3 className="text-3xl md:text-5xl font-black mb-6 text-zinc-900 tracking-tight">
              Dedicated Hourly <br className="hidden md:block" />
              Chauffeur Service
            </h3>
            
            <p className="text-zinc-600 text-lg leading-relaxed mb-10 max-w-xl">
              Need ultimate flexibility? Reserve one of our premium vehicles and a professional driver by the hour. Perfect for business roadshows, shopping trips, or when your schedule is unpredictable.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl">
              {[
                { title: 'Starting Price', desc: '€120 per hour' },
                { title: 'Minimum Booking', desc: '3 consecutive hours' },
                { title: 'Premium Fleet', desc: 'S-Class, V-Class & Tesla' },
                { title: 'Coverage Area', desc: 'Across the Netherlands' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 transition-colors hover:bg-white hover:shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-zinc-900 font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <a href="#hero" className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg">
                Reserve Hourly Driver <ChevronRight className="w-5 h-5 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
