import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Services from './components/Services';
import PopularTransfers from './components/PopularTransfers';
import FAQ from './components/FAQ';
import DriversSection from './components/DriversSection';
import Footer from './components/Footer';
import ExitIntentPopup from './components/ExitIntentPopup';
import StickyBookingCTA from './components/StickyBookingCTA';
import WhatsAppButton from './components/WhatsAppButton';
import { APIProvider } from '@vis.gl/react-google-maps';
import { getApiKey } from './components/BookingMap';
import { logEvent } from './lib/tracking';
import { getCurrentPath, scrollToSection } from './lib/navigation';
import { isCityLandingPath } from './lib/cityLandingRoutes';
import { isKeywordLandingPath } from './lib/keywordLandingRoutes';

const AdminPanel = lazy(() => import('./components/AdminPanel'));
const BookingPage = lazy(() => import('./components/BookingPage'));
const Login = lazy(() => import('./components/Login'));
const CustomerRating = lazy(() => import('./components/CustomerRating'));
const CustomerPanel = lazy(() => import('./components/CustomerPanel'));
const CustomerRegistration = lazy(() => import('./components/CustomerRegistration'));
const KeywordLandingContent = lazy(() => import('./components/KeywordLandingContent'));
const CityRouteLandingContent = lazy(() => import('./components/CityRouteLandingContent'));

type AppProps = {
  initialPath?: string;
};

export default function App({ initialPath = '/' }: AppProps) {
  const normalizedInitialPath = initialPath || '/';
  const enableVerboseTracking = import.meta.env.DEV || import.meta.env.PUBLIC_VERBOSE_TRACKING === 'true';
  const [currentPath, setCurrentPath] = useState(normalizedInitialPath);
  const [apiKey, setApiKey] = useState(() => getApiKey());

  useEffect(() => {
    setCurrentPath(getCurrentPath());
  }, []);

  useEffect(() => {
    logEvent('Page View', `Visited ${currentPath}`);
  }, [currentPath]);

  useEffect(() => {
    if (!enableVerboseTracking) {
      return;
    }

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
  }, [enableVerboseTracking]);

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
  const needsMapsProvider = isBooking || isAdmin || isHomeSection || isKeywordLanding || isCityLanding;
  const mapsLibraries = isBooking || isAdmin ? ['places', 'routes', 'geocoding'] : ['places'];
  const lazyFallback = <div className="min-h-[40vh]" aria-hidden="true" />;

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
          <Suspense fallback={lazyFallback}>
            <AdminPanel />
          </Suspense>
        </div>
      );
    }
  
    if (isRating) {
      return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
          <Navigation isAdminView={false} />
          <Suspense fallback={lazyFallback}>
            <CustomerRating />
          </Suspense>
        </div>
      );
    }

    if (isBooking) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
          <Navigation isBookingView={true} />
          <Suspense fallback={lazyFallback}>
            <BookingPage />
          </Suspense>
        </div>
      );
    }
  
    if (isLogin) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
          <Navigation isAdminView={false} />
          <Suspense fallback={lazyFallback}>
            <Login />
          </Suspense>
        </div>
      );
    }

    if (isCustomer) {
      return (
        <div className="min-h-screen bg-zinc-50 text-zinc-100 flex flex-col font-sans">
          <Navigation isCustomerView={true} />
          <Suspense fallback={lazyFallback}>
            <CustomerPanel />
          </Suspense>
        </div>
      );
    }

    if (isRegister) {
      return (
        <div className="min-h-screen bg-zinc-50 text-zinc-100 flex flex-col font-sans">
          <Navigation isCustomerView={true} />
          <Suspense fallback={lazyFallback}>
            <CustomerRegistration />
          </Suspense>
        </div>
      );
    }

    if (isKeywordLanding || isCityLanding) {
      return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
          <Navigation isAdminView={false} />
          <main className="modern-flow flex-grow">
            <Suspense fallback={lazyFallback}>
              {isKeywordLanding ? (
                <KeywordLandingContent path={normalizedPath} />
              ) : (
                <CityRouteLandingContent path={normalizedPath} />
              )}
            </Suspense>
          </main>
          <Footer />
          <StickyBookingCTA />
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
        <Navigation isAdminView={false} />
        <main className="modern-flow flex-grow">
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

  const content = renderContent();

  if (!needsMapsProvider) {
    return content;
  }

  return (
    <APIProvider apiKey={apiKey} version="weekly" libraries={mapsLibraries}>
      {content}
    </APIProvider>
  );
}
