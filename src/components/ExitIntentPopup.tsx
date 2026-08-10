import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { logEvent } from '../lib/tracking';

const settingsApiEnabled = ((import.meta as any).env?.PUBLIC_ENABLE_SETTINGS_API || 'false') === 'true';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!settingsApiEnabled) return;
    // Check local storage so we only show once per session or set time
    const shown = sessionStorage.getItem('exit_intent_shown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/generic/EXIT_INTENT_POPUP');
        if (res.ok) {
          const data = await res.json();
          if (data && data.value) {
            let parsed = data.value;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            if (parsed.enabled) {
              setSettings(parsed);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch exit popup settings', e);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings || hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        // User's mouse left the window
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exit_intent_shown', 'true');
        logEvent('Exit Intent', 'Popup shown to user');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [settings, hasShown]);

  if (!isVisible || !settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm px-4 sm:px-6">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Close Button */}
        <button 
          onClick={() => {
            setIsVisible(false);
            logEvent('Exit Intent', 'Popup closed by user');
          }}
          className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Highlight bar */}
        <div className="h-2 w-full bg-yellow-500"></div>

        <div className="p-8 text-center pt-8">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-yellow-500" />
          </div>

          <h3 className="text-2xl font-bold font-sans tracking-tight text-zinc-900 mb-4">
            {settings.title}
          </h3>
          
          <p className="text-zinc-600 mb-8 leading-relaxed">
            {settings.message}
          </p>

          <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl p-4 mb-6 relative">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2">Discount Code</span>
            <span className="font-mono text-2xl font-bold text-zinc-900 tracking-wider">
              {settings.discountCode}
            </span>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              logEvent('Exit Intent', 'Clicked on Claim Discount button');
              window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to trigger hero component action
            }}
            className="w-full bg-yellow-500 text-zinc-950 font-bold py-4 px-6 rounded-xl text-lg hover:bg-yellow-400 focus:ring-4 focus:ring-yellow-500/20 active:scale-[0.98] transition-all"
          >
            {settings.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
