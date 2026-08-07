import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="text-2xl font-bold text-white tracking-tighter flex items-center gap-2 mb-6">
            Pickupr
          </div>
          <p className="mb-6 leading-relaxed">
            Premium private transportation connecting the Netherlands with Belgium, France, and Germany. Excellence in every mile.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Services</h4>
          <ul className="space-y-4">
            <li><a href="#services" className="hover:text-emerald-600 transition">Transfers</a></li>
            <li><a href="#hourly" className="hover:text-emerald-600 transition">Hourly Chauffeur</a></li>
            <li><a href="#hero" className="hover:text-emerald-600 transition">Multi-City Trips</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Coverage</h4>
          <ul className="space-y-4">
            <li>Netherlands (Headquarters)</li>
            <li>Belgium</li>
            <li>France</li>
            <li>Germany</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 shrink-0 text-emerald-600 mt-1" />
              <span>Amsterdam Business District,<br/>Netherlands</span>
            </li>
            <li className="flex items-center">
              <Mail className="w-5 h-5 mr-3 shrink-0 text-emerald-600" />
              <span>bookings@pickupr.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-zinc-900 text-sm flex flex-col md:flex-row justify-between items-center text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Pickupr Services. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/routes" className="hover:text-white transition">Routes</a>
          <a href="/destinations" className="hover:text-white transition">Destinations</a>
          <a href="/sitemap" className="hover:text-white transition">Sitemap</a>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
