import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Car, Clock, MapPin, Calendar, User, Briefcase, ArrowLeftRight, Plus, X } from 'lucide-react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { getApiKey, hasValidKey } from './BookingMap';
import { logEvent } from '../lib/tracking';
import { navigateTo } from '../lib/navigation';

function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
  countryRestrictions = ['nl'],
}: {
  value: string,
  onChange: (val: string) => void,
  placeholder: string,
  className?: string,
  countryRestrictions?: string[],
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    if (!autocompleteRef.current) {
      autocompleteRef.current = new placesLib.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'name'],
        componentRestrictions: { country: countryRestrictions },
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.formatted_address) {
          onChangeRef.current(place.formatted_address);
        } else if (place && place.name) {
          onChangeRef.current(place.name);
        }
      });
    }

  }, [placesLib]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      autoComplete="new-password"
      autoCorrect="off"
      role="presentation"
      className={className || "bg-transparent border-none outline-none text-zinc-900 w-full placeholder:text-zinc-600 font-medium truncate"}
    />
  );
}

function DatePickerInput({ value, onChange, placeholder = "Date", min }: { value: string, onChange: (v: string) => void, placeholder?: string, min?: string }) {
  const today = new Date().toISOString().split('T')[0];
  const effectiveMin = min && min >= today ? min : today;
  return (
    <div className="relative flex items-center gap-2 group cursor-pointer min-w-[118px] h-9 px-2.5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
      <input 
        type="date" 
        value={value} 
        min={effectiveMin}
        onChange={e => onChange(e.target.value)} 
        onClick={(e) => { try { (e.target as HTMLInputElement).showPicker() } catch(err) {} }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        style={{ colorScheme: 'light' }}
      />
      <Calendar className="w-4 h-4 text-zinc-700 shrink-0 group-hover:text-emerald-600 transition-colors pointer-events-none" />
      <span className="font-medium text-sm text-zinc-900 truncate pointer-events-none">
        {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : placeholder}
      </span>
    </div>
  );
}

function TimePickerInput({ value, onChange, placeholder = "Time" }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="relative flex items-center gap-2 group cursor-pointer min-w-[102px] h-9 px-2.5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
      <input 
        type="time" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        onClick={(e) => { try { (e.target as HTMLInputElement).showPicker() } catch(err) {} }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        style={{ colorScheme: 'light' }}
      />
      <Clock className="w-4 h-4 text-zinc-700 shrink-0 group-hover:text-emerald-600 transition-colors pointer-events-none" />
      <span className="font-medium text-sm text-zinc-900 truncate pointer-events-none">
        {value || placeholder}
      </span>
    </div>
  );
}

type HeroProps = {
  title?: string;
  subtitle?: string;
};

export default function Hero({ title, subtitle }: HeroProps = {}) {
  const [activeTab, setActiveTab] = useState<'transfers' | 'hourly' | 'multicity'>('transfers');
  const [multicityStops, setMulticityStops] = useState<{location: string, waitTime: number}[]>([{location: '', waitTime: 0}, {location: '', waitTime: 0}]);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  
  const [showReturn, setShowReturn] = useState(false);
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [duration, setDuration] = useState('');


  const handleSearch = () => {
    let details = `Mode: ${activeTab}`;
    if (activeTab === 'transfers') details += ` | From: ${pickup} To: ${dropoff}`;
    if (activeTab === 'hourly') details += ` | From: ${pickup} Duration: ${duration} hours`;
    if (activeTab === 'multicity') details += ` | Multicity Stops: ${multicityStops.map(s => s.location).join(', ')}`;
    details += ` | Date: ${pickupDate} ${pickupTime} | Pax: ${passengers} | Lugg: ${luggage}`;
    
    logEvent('Search Form Submitted', details);
    if (!pickupDate || !pickupTime || !passengers || luggage === undefined || passengers === 0) {
      logEvent('Search Form Failed', 'Missing date, time, passengers, or luggage fields');
      return alert('Please complete all required fields (date, time, passengers, and luggage).');
    }

    if (showReturn) {
      if (!returnDate || !returnTime) {
        return alert('Please select both date and time for your return trip.');
      }
      const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
      const returnDateTime = new Date(`${returnDate}T${returnTime}`);
      if (returnDateTime <= pickupDateTime) {
        return alert('The return trip must be after the outbound trip.');
      }
    }

    let url = `/booking?type=${activeTab}`;
    // pass more parameters to booking page...
    url += `&date=${pickupDate}&time=${pickupTime}&passengers=${passengers}&luggage=${luggage}`;
    if (showReturn) url += `&returnDate=${returnDate}&returnTime=${returnTime}`;
    if (activeTab === 'hourly' && duration) url += `&duration=${duration}`;
    
    if (activeTab === 'transfers') {
      if (!pickup || !dropoff) return alert('Please enter both pickup and drop-off addresses.');
      url += `&pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`;
    } else if (activeTab === 'multicity') {
      const validStops = multicityStops.filter(s => s.location.trim());
      if (validStops.length < 2) return alert('Please enter at least a start point and a destination.');
      url += `&pickup=${encodeURIComponent(validStops[0].location)}&dropoff=${encodeURIComponent(validStops[validStops.length - 1].location)}`;
      if (validStops.length > 2) {
        const waypointsData = validStops.slice(1, -1).map(s => ({ location: s.location, waitTime: s.waitTime }));
        url += `&waypoints=${encodeURIComponent(JSON.stringify(waypointsData))}`;
      }
    } else if (activeTab === 'hourly') {
      if (!pickup) return alert('Please enter a pickup address in the Netherlands.');
      if (!duration) return alert('Please select a duration (number of hours).');
      url += `&pickup=${encodeURIComponent(pickup)}`;
    }
    navigateTo(url);
  };

  const heroTitle = title || 'Premium Chauffeur Services Across Europe';
  const heroSubtitle = subtitle || 'From airport transfers to multi-city itineraries, book your premium ride in under 30 seconds with fixed pricing and professional chauffeurs.';

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-20 md:pt-32 lg:pt-36 pb-16 overflow-hidden bg-zinc-950">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img
          src="/hero-airport-transfer.jpg"
          alt="Luxury Chauffeur Car"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/72 via-zinc-900/60 to-zinc-800/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(16,185,129,0.22),transparent_36%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full text-center lg:text-left order-2 lg:order-none"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-sans tracking-tight mb-6 leading-tight text-white">
            {heroTitle}
            <span className="block text-lg md:text-2xl text-zinc-200/90 mt-4 font-normal">with English speaking drivers</span>
          </h1>
          <p className="text-zinc-200/85 text-base md:text-lg max-w-xl mx-auto lg:mx-0">
            {heroSubtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-2 lg:mb-0 text-white order-3 lg:order-none lg:col-start-1 lg:row-start-2"
        >
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2 rounded-xl bg-black/20 px-2.5 py-1.5 border border-white/15">
              <span className="text-base font-black text-white leading-none">4.9</span>
              <span className="text-xs font-semibold text-zinc-200">/ 5</span>
            </div>

            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-center gap-1 text-emerald-300">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs md:text-sm font-medium text-zinc-100">
                Trusted by <span className="font-bold text-white">500+ guests</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Booking Widget */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-3xl lg:justify-self-end lg:mt-0 lg:mb-0 order-1 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2"
        >
          {/* Tabs */}
          <div className="mb-2">
            <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={() => setActiveTab('transfers')}
              className={`inline-flex items-center gap-2 py-1 text-left text-sm font-semibold transition-colors ${activeTab === 'transfers' ? 'text-white' : 'text-zinc-300 hover:text-white'}`}
            >
              <Car className={`w-4 h-4 ${activeTab === 'transfers' ? 'text-emerald-300' : 'text-zinc-400'}`} />
              <span>Transfers</span>
            </button>

            <button
              onClick={() => setActiveTab('hourly')}
              className={`inline-flex items-center gap-2 py-1 text-left text-sm font-semibold transition-colors ${activeTab === 'hourly' ? 'text-white' : 'text-zinc-300 hover:text-white'}`}
            >
              <Clock className={`w-4 h-4 ${activeTab === 'hourly' ? 'text-emerald-300' : 'text-zinc-400'}`} />
              <span>Hourly driver</span>
            </button>

            <button
              onClick={() => setActiveTab('multicity')}
              className={`inline-flex items-center gap-2 py-1 text-left text-sm font-semibold transition-colors ${activeTab === 'multicity' ? 'text-white' : 'text-zinc-300 hover:text-white'}`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === 'multicity' ? 'text-emerald-300' : 'text-zinc-400'}`} />
              <span>Multi-city</span>
            </button>
            </div>
          </div>

          {/* Input Bar */}
          <div className={`bg-white border border-zinc-200 shadow-[0_26px_70px_-35px_rgba(0,0,0,0.75)] ${activeTab === 'multicity' ? 'p-3 md:p-4 rounded-2xl flex flex-col gap-4 w-full' : 'p-3 md:p-3.5 flex flex-col gap-2.5 rounded-2xl w-full'}`}>
            
            {activeTab === 'transfers' && (
              <>
                <div className="rounded-full bg-zinc-100 p-1 w-full sm:w-fit">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setShowReturn(false)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${!showReturn ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                    >
                      One way
                    </button>
                    <button
                      onClick={() => setShowReturn(true)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${showReturn ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                    >
                      Return
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
                  <div className="flex flex-col items-start px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors w-full space-y-1.5 border border-zinc-200">
                    <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Pickup address</span>
                    <div className="flex items-center w-full space-x-3">
                      <MapPin className="w-5 h-5 text-zinc-800 shrink-0" />
                      <AutocompleteInput value={pickup} onChange={setPickup} placeholder="Pickup address in the Netherlands" countryRestrictions={['nl']} />
                    </div>
                  </div>

                  <button className="inline-flex items-center justify-center gap-1 px-3 py-2 text-zinc-500 hover:text-zinc-900 transition-colors self-center lg:self-auto rounded-full border border-zinc-200 bg-white shadow-sm" onClick={() => { const temp = pickup; setPickup(dropoff); setDropoff(temp); }}>
                    <ArrowLeftRight className="w-4 h-4" />
                    <span className="text-xs font-semibold">Swap</span>
                  </button>

                  <div className="flex flex-col items-start px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors w-full space-y-1.5 border border-zinc-200">
                    <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Drop-off address</span>
                    <div className="flex items-center w-full space-x-3">
                      <MapPin className="w-5 h-5 text-zinc-800 shrink-0" />
                      <AutocompleteInput value={dropoff} onChange={setDropoff} placeholder="Enter drop-off address" countryRestrictions={['nl', 'be', 'de', 'fr']} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col items-start px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors w-full space-y-2 border border-zinc-200">
                    <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Travel date</span>
                    <DatePickerInput value={pickupDate} onChange={setPickupDate} placeholder="dd-mm-jjjj" />
                  </div>

                  <div className="flex flex-col items-start px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors w-full space-y-2 border border-zinc-200">
                    <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Departure time</span>
                    <TimePickerInput value={pickupTime} onChange={setPickupTime} placeholder="--:--" />
                  </div>
                </div>

                {showReturn && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors w-full border border-zinc-200 relative">
                    <div className="grid gap-3 md:grid-cols-2 flex-1 pr-6">
                      <div className="flex flex-col items-start space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Return date</span>
                        <DatePickerInput value={returnDate} onChange={setReturnDate} min={pickupDate} placeholder="dd-mm-jjjj" />
                      </div>
                      <div className="flex flex-col items-start space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Return time</span>
                        <TimePickerInput value={returnTime} onChange={setReturnTime} placeholder="--:--" />
                      </div>
                    </div>
                    <button onClick={() => setShowReturn(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors gap-4 text-zinc-900 w-full border border-zinc-200">
                    <div className="flex items-center gap-2" title="Passengers">
                      <User className="w-5 h-5 text-zinc-800"/>
                      <span className="text-sm font-medium text-zinc-700">Passengers</span>
                    </div>
                    <input type="number" min="1" max="7" value={passengers} onChange={e => setPassengers(Math.min(parseInt(e.target.value) || 1, 7))} className="bg-white border border-zinc-200 rounded-md outline-none font-semibold w-10 h-8 text-center text-sm" />
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors gap-4 text-zinc-900 w-full border border-zinc-200">
                    <div className="flex items-center gap-2" title="Luggage">
                      <Briefcase className="w-5 h-5 text-zinc-800"/>
                      <span className="text-sm font-medium text-zinc-700">Luggage</span>
                    </div>
                    <input type="number" min="0" max="7" value={luggage} onChange={e => setLuggage(Math.min(parseInt(e.target.value) || 0, 7))} className="bg-white border border-zinc-200 rounded-md outline-none font-semibold w-10 h-8 text-center text-sm" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'hourly' && (
              <>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="flex flex-col items-start px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors w-full space-y-1.5 border border-zinc-200 lg:col-span-2">
                    <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Pickup address</span>
                    <div className="flex items-center w-full space-x-3">
                      <MapPin className="w-5 h-5 text-zinc-800 shrink-0" />
                      <AutocompleteInput value={pickup} onChange={setPickup} placeholder="Pickup address in the Netherlands" countryRestrictions={['nl']} />
                    </div>
                  </div>

                  <div className="flex flex-col items-start px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors w-full space-y-2 border border-zinc-200">
                    <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Duration</span>
                    <div className="flex items-center w-full space-x-3">
                      <Clock className="w-5 h-5 text-zinc-800 shrink-0" />
                      <select value={duration} onChange={(e) => setDuration(e.target.value)} className="bg-transparent border-none outline-none text-zinc-900 w-full font-medium cursor-pointer appearance-none">
                        <option value="">Select duration</option>
                        <option value="3">3 Hours</option>
                        <option value="4">4 Hours</option>
                        <option value="8">8 Hours</option>
                        <option value="12">12 Hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col items-start px-4 py-3 bg-zinc-50 rounded-xl cursor-text transition-colors w-full space-y-2 border border-zinc-200">
                    <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Trip date and time</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <DatePickerInput value={pickupDate} onChange={setPickupDate} placeholder="dd-mm-jjjj" />
                      <TimePickerInput value={pickupTime} onChange={setPickupTime} placeholder="--:--" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 rounded-xl cursor-pointer transition-colors gap-4 text-zinc-900 w-full border border-zinc-200">
                    <div className="flex items-center gap-2" title="Passengers">
                      <User className="w-5 h-5 text-zinc-800"/>
                      <span className="text-sm font-medium text-zinc-700">Passengers</span>
                    </div>
                    <input type="number" min="1" max="7" value={passengers} onChange={e => setPassengers(Math.min(parseInt(e.target.value) || 1, 7))} className="bg-white border border-zinc-200 rounded-md outline-none font-semibold w-10 h-8 text-center text-sm" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'multicity' && (
              <div className="flex flex-col w-full gap-2 relative p-1 text-sm">
                <div className="flex flex-col gap-2">
                  {multicityStops.map((stop, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center w-full gap-2">
                      <div className="flex-1 flex flex-col md:flex-row md:items-center px-3 py-2 border border-zinc-200 bg-white rounded-xl md:rounded-full cursor-text transition-colors w-full md:space-x-3 shadow-sm focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-200/50">
                        <div className="flex items-center flex-1 py-1">
                          <MapPin className="w-5 h-5 text-zinc-800 shrink-0 mr-3" />
                          <AutocompleteInput 
                            placeholder={index === 0 ? "Start point (Netherlands)" : `Stop ${index + 1}`} 
                            value={stop.location}
                            className="w-full bg-transparent outline-none pt-0.5 text-zinc-900 placeholder-zinc-500 font-medium"
                            countryRestrictions={index === 0 ? ['nl'] : ['nl', 'be', 'de', 'fr']}
                            onChange={(val) => {
                              const newStops = [...multicityStops];
                              newStops[index].location = val;
                              setMulticityStops(newStops);
                            }}
                          />
                        </div>
                        {index > 0 && index < multicityStops.length - 1 && (
                          <div className="flex items-center gap-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-zinc-200 md:pl-4 whitespace-nowrap text-zinc-900">
                             <Clock className="w-4 h-4 text-zinc-900" />
                             <span className="text-xs font-medium">Wait time (min):</span>
                             <input type="number" min="0" step="5" value={stop.waitTime} onChange={e => {
                               const newStops = [...multicityStops];
                               newStops[index].waitTime = parseInt(e.target.value) || 0;
                               setMulticityStops(newStops);
                             }} className="w-12 h-7 outline-none font-semibold text-center text-zinc-900 bg-white border border-zinc-200 rounded-md" />
                          </div>
                        )}
                      </div>
                      
                      {index > 1 && (
                        <button 
                          onClick={() => {
                            const newStops = [...multicityStops];
                            newStops.splice(index, 1);
                            setMulticityStops(newStops);
                          }}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-2.5 bg-white border border-zinc-200 shadow-sm rounded-full self-end md:self-auto"
                          title="Remove stop"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex flex-col gap-3 w-full mt-1">
                    <button 
                      onClick={() => setMulticityStops([...multicityStops, {location: '', waitTime: 0}])}
                      className="flex items-center py-2 px-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-transparent hover:bg-emerald-50 rounded-full transition-all self-start"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Add another destination
                    </button>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center px-3 py-1.5 bg-white border border-zinc-200 rounded-full cursor-text transition-colors space-x-2 shadow-sm shrink-0 w-full">
                        <div className="flex items-center gap-2 text-sm text-zinc-900">
                          <DatePickerInput value={pickupDate} onChange={setPickupDate} />
                          <TimePickerInput value={pickupTime} onChange={setPickupTime} />
                        </div>
                      </div>

                      <div className="flex items-center px-3 py-1.5 bg-white border border-zinc-200 rounded-full cursor-pointer transition-colors text-zinc-900 shadow-sm shrink-0 w-full">
                        <div className="flex items-center gap-2" title="Passengers">
                           <User className="w-4 h-4 text-zinc-800"/> 
                           <input type="number" min="1" max="7" value={passengers} onChange={e => setPassengers(Math.min(parseInt(e.target.value) || 1, 7))} className="bg-white border border-zinc-200 rounded-md outline-none font-semibold w-7 h-6 text-center text-xs appearance-none m-0" />
                        </div>
                        <div className="w-px h-5 bg-zinc-200 mx-3"></div>
                        <div className="flex items-center gap-2" title="Luggage">
                           <Briefcase className="w-4 h-4 text-zinc-800"/> 
                           <input type="number" min="0" max="7" value={luggage} onChange={e => setLuggage(Math.min(parseInt(e.target.value) || 0, 7))} className="bg-white border border-zinc-200 rounded-md outline-none font-semibold w-7 h-6 text-center text-xs appearance-none m-0" />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSearch} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0 flex items-center justify-center rounded-full h-9 self-start"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'multicity' && (
              <button 
                onClick={handleSearch} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 transition-all shadow-lg hover:shadow-emerald-300/60 flex items-center justify-center rounded-xl w-full mt-1.5"
              >
                Search
              </button>
            )}
          </div>

          {/* Trust USPs */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 mt-8 px-4 text-[11px] md:text-xs font-medium text-zinc-100 md:flex-nowrap">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 text-[10px] leading-none">✓</div>
              <span>Fixed Prices</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
               <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 text-[10px] leading-none">✓</div>
              <span>Free Cancellation</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
               <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 text-[10px] leading-none">✓</div>
              <span>Meet & Greet Included</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
               <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 text-[10px] leading-none">✓</div>
              <span>60 Min Free Waiting Time</span>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Decorative Bottom gradient fade out */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
    </section>
  );
}
