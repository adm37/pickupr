import { Menu, X, Shield, User } from 'lucide-react';
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
    { name: 'Blog', href: '/blog', fullPage: true },
  ];

  const slimNav = isAdminView || isBookingView || isCustomerView;

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 ${isScrolled || slimNav || forceDarkBackground ? 'py-4' : 'py-6'}`}>
      <div className={`${slimNav ? 'w-full pl-7 pr-6' : 'max-w-7xl mx-auto px-6'} flex items-center justify-between`}>
        <a
          href="/"
          className="text-2xl font-bold tracking-tighter flex items-center gap-2 transition-opacity hover:opacity-80 text-white"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
        >
          Pickupr
        </a>

        {/* Desktop Nav */}
        {!slimNav && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium transition-colors text-zinc-300 hover:text-white"
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
              className="transition-colors flex items-center gap-2 text-zinc-300 hover:text-white"
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
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-600"
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
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-600"
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
              className="text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && !slimNav && (
        <div className="md:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl">
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
              className="text-lg font-medium text-zinc-300 hover:text-white py-2"
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
            className="text-lg font-medium text-zinc-300 hover:text-white py-2 flex items-center gap-2"
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
