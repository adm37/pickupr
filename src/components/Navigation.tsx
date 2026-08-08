import { Menu, X, User, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { navigateTo, scrollToSection } from '../lib/navigation';

interface NavigationProps {
  isAdminView?: boolean;
  isBookingView?: boolean;
  isCustomerView?: boolean;
  forceDarkBackground?: boolean;
}

export default function Navigation({ isAdminView = false, isBookingView = false, isCustomerView = false, forceDarkBackground = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check user login state
    try {
      const userStr = localStorage.getItem('pickupr_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      }
    } catch(e) {}
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLoginHref = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'customer') return '/customer';
    return '/login';
  };

  const navLinks = [
    { name: 'Services', href: '/services', sectionId: 'services' },
    { name: 'Hourly Rates', href: '/hourly', sectionId: 'hourly' },
    { name: 'Routes', href: '/routes', fullPage: true },
    { name: 'Blog', href: '/blog', fullPage: true },
  ];

  const slimNav = isAdminView || isBookingView || isCustomerView;

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${forceDarkBackground ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/92 border-zinc-200'} backdrop-blur-md border-b ${isScrolled || slimNav || forceDarkBackground ? 'py-3.5 shadow-sm' : 'py-5'}`}>
      <div className={`${slimNav ? 'w-full pl-7 pr-6' : 'max-w-7xl mx-auto px-6'} relative flex items-center justify-between`}>
        <a
          href="/"
          className={`text-2xl font-extrabold tracking-tighter flex items-center gap-2 transition-opacity hover:opacity-80 ${forceDarkBackground ? 'text-white' : 'text-zinc-900'}`}
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Pickupr
        </a>

        {isBookingView && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-700 text-[10px] font-bold text-white">1</span>
              <span>Vehicle</span>
              <span className="text-zinc-300">|</span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-600">2</span>
              <span>Details</span>
              <span className="text-zinc-300">|</span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-600">3</span>
              <span>Confirm</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              <Lock className="h-3.5 w-3.5 text-emerald-600" /> Secure checkout
            </span>
          </div>
        )}

        {/* Desktop Nav */}
        {!slimNav && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className={`text-sm font-semibold transition-colors ${forceDarkBackground ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
                onClick={(e) => {
                  if ('fullPage' in link && link.fullPage) {
                    return;
                  }
                  e.preventDefault();
                  navigateTo(link.href);
                  if ('sectionId' in link) {
                    scrollToSection(link.sectionId);
                  }
                }}
              >
                {link.name}
              </a>
            ))}
            <a 
              href={getLoginHref()} 
                className={`transition-colors flex items-center gap-2 ${forceDarkBackground ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(getLoginHref());
              }}
              title={userRole ? "Dashboard" : "Login for customers and taxi companies"}
            >
              <User className="w-5 h-5" />
            </a>
          </nav>
        )}

        {/* Exit Admin Desktop Nav */}
        {isAdminView && (
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem('pickupr_user');
                setUserRole(null);
                navigateTo('/');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors text-zinc-500 border border-zinc-300 hover:text-zinc-900 hover:border-zinc-400"
            >
              Sign Out
            </a>
          </div>
        )}
        
        {isBookingView && (
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors text-zinc-500 border border-zinc-300 hover:text-zinc-900 hover:border-zinc-400"
            >
              Cancel Booking
            </a>
          </div>
        )}

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
          {isAdminView ? (
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                localStorage.removeItem('pickupr_user');
                setUserRole(null);
                navigateTo('/');
              }}
              className="text-zinc-400 p-2"
            >
              Sign Out
            </a>
          ) : isBookingView ? (
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
              }}
              className="text-zinc-400 p-2"
            >
              Cancel
            </a>
          ) : isCustomerView ? null : (
            <button 
              className={forceDarkBackground ? 'text-white' : 'text-zinc-900'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && !slimNav && (
        <div className={`md:hidden absolute top-full left-0 w-full ${forceDarkBackground ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'} border-b p-6 flex flex-col gap-4 shadow-2xl`}>
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                if ('fullPage' in link && link.fullPage) {
                  return;
                }
                e.preventDefault();
                navigateTo(link.href);
                if ('sectionId' in link) {
                  scrollToSection(link.sectionId);
                }
              }}
              className={`text-lg font-medium py-2 ${forceDarkBackground ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-zinc-900'}`}
            >
              {link.name}
            </a>
          ))}
          <a 
            href={getLoginHref()}
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              navigateTo(getLoginHref());
            }}
            className={`text-lg font-medium py-2 flex items-center gap-2 ${forceDarkBackground ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-zinc-900'}`}
            title={userRole ? "Dashboard" : "Login for customers and taxi companies"}
          >
            <User className="w-5 h-5" />
            {userRole ? 'Dashboard' : 'Login'}
          </a>
        </div>
      )}
    </header>
  );
}
