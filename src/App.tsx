import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Services from './components/Services';
import PopularTransfers from './components/PopularTransfers';
import FAQ from './components/FAQ';
import DriversSection from './components/DriversSection';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import BookingPage from './components/BookingPage';
import Login from './components/Login';
import CustomerRating from './components/CustomerRating';
import CustomerPanel from './components/CustomerPanel';
import CustomerRegistration from './components/CustomerRegistration';
import ExitIntentPopup from './components/ExitIntentPopup';
import StickyBookingCTA from './components/StickyBookingCTA';
import WhatsAppButton from './components/WhatsAppButton';
import KeywordLandingContent from './components/KeywordLandingContent';
import CityRouteLandingContent from './components/CityRouteLandingContent';
import { APIProvider } from '@vis.gl/react-google-maps';
import { getApiKey } from './components/BookingMap';
import { logEvent } from './lib/tracking';
import { getCurrentPath, scrollToSection } from './lib/navigation';
import { isCityLandingPath } from './lib/cityLandingRoutes';
import { isKeywordLandingPath } from './lib/keywordLandingRoutes';

type AppProps = {
  initialPath?: string;
};

export default function App({ initialPath = '/' }: AppProps) {
  const normalizedInitialPath = initialPath || '/';
  const [currentPath, setCurrentPath] = useState(normalizedInitialPath);
  const [apiKey, setApiKey] = useState(() => getApiKey());

  useEffect(() => {
    setCurrentPath(getCurrentPath());
  }, []);

  useEffect(() => {
    logEvent('Page View', `Visited ${currentPath}`);
  }, [currentPath]);

  useEffect(() => {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
        const type = target.getAttribute('type');
        if (type === 'password' || type === 'hidden') return;
        
        const placeholder = target.getAttribute('placeholder') || target.name || target.id || 'Input field';
        let val = target.value;
        if (val && val.length > 200) val = val.substring(0, 200) + '...';
        
        logEvent('Input Change', `Filled '${val}' in ${placeholder}`);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignore clicks on basic layout elements to prevent spam
      if (!target || target.tagName.toLowerCase() === 'div' || target.tagName.toLowerCase() === 'body' || target.tagName.toLowerCase() === 'html') {
         // Also check if we clicked a div that is a button (e.g. some icons or styled divs)
         if (!target?.closest('button') && !target?.closest('a')) {
           return;
         }
      }

      let btnOrLink = target.closest('button') || target.closest('a') || target;
      let label = btnOrLink.innerText || btnOrLink.getAttribute('aria-label') || btnOrLink.getAttribute('placeholder') || btnOrLink.tagName;
      
      if (label && label.length > 50) label = label.substring(0, 50) + '...';
      
      logEvent('Click Interaction', `Clicked on ${btnOrLink.tagName} - ${label?.trim() || 'Icon/Element'}`);
    };

    document.addEventListener('change', handleChange, true);
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('change', handleChange, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  useEffect(() => {
    const onLocationChange = () => setCurrentPath(getCurrentPath());

    const handleStorageChange = () => {
      setApiKey(getApiKey());
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for when admin saves key
    window.addEventListener('maps_key_updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('maps_key_updated', handleStorageChange);
    };
  }, []);

  const [pathname] = currentPath.split('?');
  const normalizePath = (path: string) => path.replace(/\/$/, '') || '/';
  const normalizedPath = normalizePath(pathname);

  const isAdmin = normalizedPath === '/admin';
  const isBooking = normalizedPath.startsWith('/booking');
  const isLogin = normalizedPath === '/login';
  const isCustomer = normalizedPath === '/customer';
  const isRegister = normalizedPath === '/register';
  const isRating = normalizedPath.startsWith('/rate/');
  const isKeywordLanding = isKeywordLandingPath(normalizedPath);
  const isCityLanding = isCityLandingPath(normalizedPath);
  const isHomeSection = normalizedPath === '/' || normalizedPath === '/services' || normalizedPath === '/hourly';

  useEffect(() => {
    if (!isHomeSection) return;

    const sectionMap: Record<string, string> = {
      '/services': 'services',
      '/hourly': 'hourly',
    };

    const sectionId = sectionMap[normalizedPath];
    if (sectionId) {
      scrollToSection(sectionId);
    }
  }, [normalizedPath, isHomeSection]);

  const renderContent = () => {
    if (isAdmin) {
      return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
          <Navigation isAdminView={true} />
          <AdminPanel />
        </div>
      );
    }
  
    if (isRating) {
      return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
          <Navigation isAdminView={false} />
          <CustomerRating />
        </div>
      );
    }

    if (isBooking) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
          <Navigation isBookingView={true} />
          <BookingPage />
        </div>
      );
    }
  
    if (isLogin) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
          <Navigation isAdminView={false} />
          <Login />
        </div>
      );
    }

    if (isCustomer) {
      return (
        <div className="min-h-screen bg-zinc-50 text-zinc-100 flex flex-col font-sans">
          <Navigation isCustomerView={true} />
          <CustomerPanel />
        </div>
      );
    }

    if (isRegister) {
      return (
        <div className="min-h-screen bg-zinc-50 text-zinc-100 flex flex-col font-sans">
          <Navigation isCustomerView={true} />
          <CustomerRegistration />
        </div>
      );
    }

    if (isKeywordLanding || isCityLanding) {
      return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
          <Navigation isAdminView={false} />
          <main className="flex-grow bg-zinc-50">
            {isKeywordLanding ? (
              <KeywordLandingContent path={normalizedPath} />
            ) : (
              <CityRouteLandingContent path={normalizedPath} />
            )}
          </main>
          <Footer />
          <StickyBookingCTA />
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
        <Navigation isAdminView={false} />
        <main className="flex-grow">
          <Hero />
          <HowItWorks />
          <Services />
          <DriversSection />
          <PopularTransfers />
          <FAQ />
        </main>
        <Footer />
        <ExitIntentPopup />
        <WhatsAppButton />
      </div>
    );
  };

  return (
    <APIProvider apiKey={apiKey} version="weekly" libraries={['places', 'routes', 'geocoding']}>
      {renderContent()}
    </APIProvider>
  );
}
