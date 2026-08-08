import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const contactPhone = (import.meta.env.PUBLIC_CONTACT_PHONE || '').toString().trim();
  const contactPhoneHref = contactPhone ? `tel:${contactPhone.replace(/\s+/g, '')}` : '';

  return (
    <footer className="bg-slate-50 text-zinc-600 py-16 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="text-2xl font-extrabold text-zinc-900 tracking-tighter flex items-center gap-2 mb-6">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Pickupr
          </div>
          <p className="mb-6 leading-relaxed">
            Premium private transportation connecting the Netherlands with Belgium, France, and Germany. Excellence in every mile.
          </p>
        </div>

        <div>
          <h4 className="text-zinc-900 font-semibold mb-6">Services</h4>
          <ul className="space-y-4">
            <li><a href="#services" className="hover:text-zinc-900 transition">Transfers</a></li>
            <li><a href="#hourly" className="hover:text-zinc-900 transition">Hourly Chauffeur</a></li>
            <li><a href="#hero" className="hover:text-zinc-900 transition">Multi-City Trips</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-zinc-900 font-semibold mb-6">Coverage</h4>
          <ul className="space-y-4">
            <li>Netherlands (Headquarters)</li>
            <li>Belgium</li>
            <li>France</li>
            <li>Germany</li>
          </ul>
        </div>

        <div>
          <h4 className="text-zinc-900 font-semibold mb-6">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 shrink-0 text-emerald-600 mt-1" />
              <span>Amsterdam Business District,<br/>Netherlands</span>
            </li>
            <li className="flex items-center">
              <Mail className="w-5 h-5 mr-3 shrink-0 text-emerald-600" />
              <span>bookings@pickupr.com</span>
            </li>
            <li className="flex items-center">
              <Phone className="w-5 h-5 mr-3 shrink-0 text-emerald-600" />
              {contactPhone ? (
                <a href={contactPhoneHref} className="hover:text-zinc-900 transition">
                  {contactPhone}
                </a>
              ) : (
                <span>Phone support available on request</span>
              )}
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-zinc-200 text-sm flex flex-col md:flex-row justify-between items-center text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Pickupr Services. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/routes" className="hover:text-zinc-900 transition">Routes</a>
          <a href="/destinations" className="hover:text-zinc-900 transition">Destinations</a>
          <a href="/sitemap" className="hover:text-zinc-900 transition">Sitemap</a>
          <a href="/privacy-policy" className="hover:text-zinc-900 transition">Privacy Policy</a>
          <a href="/terms-of-service" className="hover:text-zinc-900 transition">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
