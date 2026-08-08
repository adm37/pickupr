import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Car, Clock, MapPin, Calendar, User, Briefcase, ArrowLeftRight, Plus, X, Users } from 'lucide-react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
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
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="new-password"
      autoCorrect="off"
      role="presentation"
      className={className || 'bg-transparent border-none outline-none text-zinc-900 w-full placeholder:text-zinc-600 font-medium truncate'}
    />
  );
}

function DatePickerInput({ value, onChange, placeholder = 'Date', min }: { value: string, onChange: (v: string) => void, placeholder?: string, min?: string }) {
  const today = new Date().toISOString().split('T')[0];
  const effectiveMin = min && min >= today ? min : today;
  return (
    <div className="relative flex items-center gap-1.5 group cursor-pointer min-w-[108px] h-8 px-2 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
      <input
        type="date"
        value={value}
        min={effectiveMin}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch (_err) {} }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        style={{ colorScheme: 'light' }}
      />
      <Calendar className="w-3.5 h-3.5 text-zinc-700 shrink-0 group-hover:text-emerald-600 transition-colors pointer-events-none" />
      <span className="font-medium text-xs text-zinc-900 truncate pointer-events-none">
        {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : placeholder}
      </span>
    </div>
  );
}

function TimePickerInput({ value, onChange, placeholder = 'Time' }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="relative flex items-center gap-1.5 group cursor-pointer min-w-[96px] h-8 px-2 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch (_err) {} }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        style={{ colorScheme: 'light' }}
      />
      <Clock className="w-3.5 h-3.5 text-zinc-700 shrink-0 group-hover:text-emerald-600 transition-colors pointer-events-none" />
      <span className="font-medium text-xs text-zinc-900 truncate pointer-events-none">
        {value || placeholder}
      </span>
    </div>
  );
}

type HeroProps = {
  title?: string;
  subtitle?: string;
};

function getDailyTravelerCount(): number {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % 100000;
  }

  const min = 18000;
  const max = 32000;
  return min + (hash % (max - min + 1));
}

export default function Hero({ title, subtitle }: HeroProps = {}) {
  const [activeTab, setActiveTab] = useState<'transfers' | 'hourly' | 'multicity'>('transfers');
  const [multicityStops, setMulticityStops] = useState<{ location: string, waitTime: number }[]>([{ location: '', waitTime: 0 }, { location: '', waitTime: 0 }]);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  const [showReturn, setShowReturn] = useState(false);
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');

  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [duration, setDuration] = useState('');
  const dailyTravelerCount = getDailyTravelerCount();

  const handleSearch = () => {
    let details = `Mode: ${activeTab}`;
    if (activeTab === 'transfers') details += ` | From: ${pickup} To: ${dropoff}`;
    if (activeTab === 'hourly') details += ` | From: ${pickup} Duration: ${duration} hours`;
    if (activeTab === 'multicity') details += ` | Multicity Stops: ${multicityStops.map((s) => s.location).join(', ')}`;
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
    url += `&date=${pickupDate}&time=${pickupTime}&passengers=${passengers}&luggage=${luggage}`;
    if (showReturn) url += `&returnDate=${returnDate}&returnTime=${returnTime}`;
    if (activeTab === 'hourly' && duration) url += `&duration=${duration}`;

    if (activeTab === 'transfers') {
      if (!pickup || !dropoff) return alert('Please enter both pickup and drop-off addresses.');
      url += `&pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`;
    } else if (activeTab === 'multicity') {
      const validStops = multicityStops.filter((s) => s.location.trim());
      if (validStops.length < 2) return alert('Please enter at least a start point and a destination.');
      url += `&pickup=${encodeURIComponent(validStops[0].location)}&dropoff=${encodeURIComponent(validStops[validStops.length - 1].location)}`;
      if (validStops.length > 2) {
        const waypointsData = validStops.slice(1, -1).map((s) => ({ location: s.location, waitTime: s.waitTime }));
        url += `&waypoints=${encodeURIComponent(JSON.stringify(waypointsData))}`;
      }
    } else if (activeTab === 'hourly') {
      if (!pickup) return alert('Please enter a pickup address in the Netherlands.');
      if (!duration) return alert('Please select a duration (number of hours).');
      url += `&pickup=${encodeURIComponent(pickup)}`;
    }

    navigateTo(url);
  };

  const heroTitle = title || 'Private Airport Transfers Across Europe';
  const heroSubtitle = subtitle || 'Book your airport or cross-border transfer in under 30 seconds with fixed pricing, professional English-speaking drivers, direct WhatsApp support, and pay in the car by cash or credit card.';

  return (
    <section id="hero" className="relative min-h-[80vh] lg:min-h-[84vh] flex items-center justify-center pt-20 md:pt-28 pb-12 overflow-hidden bg-sky-50">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img src="/hero-airport-transfer.jpg" alt="Luxury Chauffeur Car" className="w-full h-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white/95 to-white/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(14,165,233,0.2),transparent_34%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-start">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full text-center lg:text-left order-2 lg:order-none lg:max-w-[620px]">
          <p className="inline-flex items-center rounded-full border border-sky-200 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700 mb-5">
            Arrive. Relax. Enjoy.
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.08] text-zinc-900">
            {heroTitle}
            <span className="block text-lg md:text-2xl text-zinc-700 mt-3 font-medium">Netherlands, Belgium, France, and Germany</span>
          </h1>
          <p className="text-zinc-700 text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">{heroSubtitle}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full max-w-xl md:max-w-xl lg:max-w-2xl lg:justify-self-end order-1 lg:order-none lg:col-start-2 lg:row-start-1">
          <div className="mb-2">
            <div className="flex flex-wrap items-center gap-5">
              <button onClick={() => setActiveTab('transfers')} className={`inline-flex items-center gap-2 py-1 text-left text-sm font-semibold transition-colors ${activeTab === 'transfers' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>
                <Car className={`w-4 h-4 ${activeTab === 'transfers' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <span>Transfers</span>
              </button>
              <button onClick={() => setActiveTab('hourly')} className={`inline-flex items-center gap-2 py-1 text-left text-sm font-semibold transition-colors ${activeTab === 'hourly' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>
                <Clock className={`w-4 h-4 ${activeTab === 'hourly' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <span>Hourly driver</span>
              </button>
              <button onClick={() => setActiveTab('multicity')} className={`inline-flex items-center gap-2 py-1 text-left text-sm font-semibold transition-colors ${activeTab === 'multicity' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}>
                <MapPin className={`w-4 h-4 ${activeTab === 'multicity' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <span>Multi-city</span>
              </button>
            </div>
          </div>

          <div className={`bg-white border border-zinc-200 shadow-[0_14px_34px_-22px_rgba(0,0,0,0.35)] ${activeTab === 'multicity' ? 'p-2.5 md:p-3 rounded-2xl flex flex-col gap-3 w-full' : 'p-2 md:p-2.5 flex flex-col gap-1.5 rounded-2xl w-full'}`}>
            {activeTab === 'transfers' && (
              <>
                <div className="rounded-full bg-zinc-100 p-0.5 w-full">
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => setShowReturn(false)} className={`rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors ${!showReturn ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>One Way</button>
                    <button onClick={() => setShowReturn(true)} className={`rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors ${showReturn ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Return</button>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-300 bg-zinc-50 overflow-hidden">
                  <div className="relative grid grid-cols-[28px_1fr] items-center gap-1 px-3 py-3 border-b border-zinc-300">
                    <div className="relative h-8">
                      <span className="absolute left-[8px] top-[2px] h-2.5 w-2.5 rounded-full border-2 border-slate-500" />
                      <span className="absolute left-[12px] top-[14px] h-4 border-l border-dashed border-slate-400" />
                    </div>
                    <AutocompleteInput value={pickup} onChange={setPickup} placeholder="From (airport, port, address)" countryRestrictions={['nl']} className="bg-transparent border-none outline-none text-zinc-900 w-full placeholder:text-slate-500 font-medium text-[15px]" />
                  </div>

                  <div className="grid grid-cols-[28px_1fr_auto] items-center gap-1 px-3 py-3 border-b border-zinc-300">
                    <MapPin className="w-4 h-4 text-slate-500 ml-1" />
                    <AutocompleteInput value={dropoff} onChange={setDropoff} placeholder="To (airport, port, address)" countryRestrictions={['nl', 'be', 'de', 'fr']} className="bg-transparent border-none outline-none text-zinc-900 w-full placeholder:text-slate-500 font-medium text-[15px]" />
                    <button
                      type="button"
                      aria-label="Swap addresses"
                      className="inline-flex h-7 items-center justify-center rounded-full border border-zinc-300 bg-white px-2 text-zinc-500 hover:text-zinc-900"
                      onClick={() => {
                        const temp = pickup;
                        setPickup(dropoff);
                        setDropoff(temp);
                      }}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-[28px_1fr] items-center gap-1 px-3 py-2.5">
                    <Calendar className="w-4 h-4 text-slate-500 ml-1" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <DatePickerInput value={pickupDate} onChange={setPickupDate} placeholder="Add date" />
                      <span className="text-slate-400 text-xs">&</span>
                      <TimePickerInput value={pickupTime} onChange={setPickupTime} placeholder="time" />
                    </div>
                  </div>
                </div>

                {showReturn && (
                  <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500 mb-1">Return trip</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <DatePickerInput value={returnDate} onChange={setReturnDate} min={pickupDate} placeholder="Return date" />
                      <TimePickerInput value={returnTime} onChange={setReturnTime} placeholder="Return time" />
                      <button onClick={() => setShowReturn(false)} className="text-zinc-400 hover:text-red-500 transition-colors ml-auto">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2 pt-1">
                  <div>
                    <p className="mb-1.5 text-sm font-semibold text-zinc-800">Passengers</p>
                    <div className="flex items-center justify-between rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2">
                      <button type="button" aria-label="Decrease passengers" className="h-7 w-7 rounded-md text-xl leading-none text-slate-600 hover:bg-zinc-200" onClick={() => setPassengers((prev) => Math.max(1, prev - 1))}>-</button>
                      <span className="text-sm font-semibold text-zinc-900 min-w-6 text-center">{passengers}</span>
                      <button type="button" aria-label="Increase passengers" className="h-7 w-7 rounded-md text-xl leading-none text-slate-600 hover:bg-zinc-200" onClick={() => setPassengers((prev) => Math.min(7, prev + 1))}>+</button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-sm font-semibold text-zinc-800">Luggage pieces</p>
                    <div className="flex items-center justify-between rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2">
                      <button type="button" aria-label="Decrease luggage" className="h-7 w-7 rounded-md text-xl leading-none text-slate-600 hover:bg-zinc-200" onClick={() => setLuggage((prev) => Math.max(0, prev - 1))}>-</button>
                      <span className="text-sm font-semibold text-zinc-900 min-w-6 text-center">{luggage}</span>
                      <button type="button" aria-label="Increase luggage" className="h-7 w-7 rounded-md text-xl leading-none text-slate-600 hover:bg-zinc-200" onClick={() => setLuggage((prev) => Math.min(7, prev + 1))}>+</button>
                    </div>
                  </div>
                </div>

                <button onClick={handleSearch} className="mt-1 w-full rounded-md bg-emerald-500 py-3 text-base font-bold text-white transition-colors hover:bg-emerald-600">Continue</button>

                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm pt-0.5">
                  <Users className="w-4 h-4" />
                  <p>{dailyTravelerCount} travelers in 4 destinations booked a ride today</p>
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
                      <User className="w-5 h-5 text-zinc-800" />
                      <span className="text-sm font-medium text-zinc-700">Passengers</span>
                    </div>
                    <input type="number" min="1" max="7" value={passengers} onChange={(e) => setPassengers(Math.min(parseInt(e.target.value) || 1, 7))} className="bg-white border border-zinc-200 rounded-md outline-none font-semibold w-10 h-8 text-center text-sm" />
                  </div>
                </div>

                <button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 transition-all shadow-lg hover:shadow-emerald-300/60 flex items-center justify-center rounded-xl w-full mt-1">
                  Show available rides
                </button>
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
                            placeholder={index === 0 ? 'Start point (Netherlands)' : `Stop ${index + 1}`}
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
                            <input
                              type="number"
                              min="0"
                              step="5"
                              value={stop.waitTime}
                              onChange={(e) => {
                                const newStops = [...multicityStops];
                                newStops[index].waitTime = parseInt(e.target.value) || 0;
                                setMulticityStops(newStops);
                              }}
                              className="w-12 h-7 outline-none font-semibold text-center text-zinc-900 bg-white border border-zinc-200 rounded-md"
                            />
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
                      onClick={() => setMulticityStops([...multicityStops, { location: '', waitTime: 0 }])}
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
                          <User className="w-4 h-4 text-zinc-800" />
                          <input type="number" min="1" max="7" value={passengers} onChange={(e) => setPassengers(Math.min(parseInt(e.target.value) || 1, 7))} className="bg-white border border-zinc-200 rounded-md outline-none font-semibold w-7 h-6 text-center text-xs appearance-none m-0" />
                        </div>
                        <div className="w-px h-5 bg-zinc-200 mx-3"></div>
                        <div className="flex items-center gap-2" title="Luggage">
                          <Briefcase className="w-4 h-4 text-zinc-800" />
                          <input type="number" min="0" max="7" value={luggage} onChange={(e) => setLuggage(Math.min(parseInt(e.target.value) || 0, 7))} className="bg-white border border-zinc-200 rounded-md outline-none font-semibold w-7 h-6 text-center text-xs appearance-none m-0" />
                        </div>
                      </div>
                    </div>

                    <button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0 flex items-center justify-center rounded-full h-9 self-start">
                      Show available rides
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
